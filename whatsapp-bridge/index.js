/**
 * Invisible CRM — WhatsApp Bridge (Baileys)
 *
 * Connects a real WhatsApp number via QR scan and forwards all incoming
 * messages to the FastAPI backend at POST /webhook (text) and POST /webhook/audio.
 *
 * Exposes a small Express server on port 3001:
 *   GET /qr      → base64 PNG of the current QR code (when not yet connected)
 *   GET /status  → { connected: bool, phone: string|null }
 *
 * Usage:
 *   node index.js
 *
 * First run: a QR code will be printed to the terminal AND served at /qr.
 * Scan it with WhatsApp → Linked Devices → Link a Device.
 * Session is saved in ./auth_info_baileys/ so re-scanning is not needed on restart.
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidGroup,
  downloadMediaMessage,
} from '@whiskeysockets/baileys'
import pino from 'pino'
import express from 'express'
import qrcode from 'qrcode'
import axios from 'axios'
import FormData from 'form-data'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import path from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'
const BRIDGE_PORT = parseInt(process.env.BRIDGE_PORT || '3001', 10)
const AUTH_DIR = process.env.AUTH_DIR || './auth_info_baileys'

// ─── State ───────────────────────────────────────────────────────────────────

let currentQr = null          // base64 PNG string of the latest QR
let isConnected = false
let connectedPhone = null
let sock = null
let reconnectAttempts = 0     // reset to 0 on successful connection

// ─── Express server (QR + status) ────────────────────────────────────────────

const app = express()

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

/**
 * GET /qr
 * Returns the current QR code as a base64 PNG data URL.
 * Returns 503 if already connected or QR not yet generated.
 */
app.get('/qr', async (req, res) => {
  if (isConnected) {
    return res.status(200).json({ connected: true, qr: null })
  }
  if (!currentQr) {
    return res.status(503).json({ error: 'QR not ready yet, please wait a moment.' })
  }
  try {
    const png = await qrcode.toDataURL(currentQr)
    res.json({ connected: false, qr: png })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR image.' })
  }
})

/**
 * GET /status
 * Returns connection status and phone number (if connected).
 */
app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    phone: connectedPhone,
  })
})

app.listen(BRIDGE_PORT, () => {
  console.log(`[bridge] Express server listening on http://localhost:${BRIDGE_PORT}`)
  console.log(`[bridge]   GET /qr     → QR code image`)
  console.log(`[bridge]   GET /status → connection status`)
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract a human-readable sender label from a JID.
 * For groups the pushName of the participant is used; for DMs it's the pushName.
 */
function getSenderLabel(msg) {
  const pushName = msg.pushName || 'Unknown'
  const jid = msg.key.remoteJid || ''
  // Strip the @s.whatsapp.net suffix to get the phone number
  const phone = jid.replace(/@.+/, '')
  return pushName !== 'Unknown' ? `${pushName} (${phone})` : phone
}

/**
 * Forward a text message to FastAPI POST /webhook.
 */
async function forwardTextMessage(sender, text) {
  try {
    const resp = await axios.post(`${FASTAPI_URL}/webhook`, {
      sender,
      message: text,
      media_type: 'text',
    })
    const data = resp.data
    console.log(
      `[bridge] Forwarded text from "${sender}" → status=${data.status} orders=${data.orders_extracted ?? 0}`
    )
  } catch (err) {
    console.error(`[bridge] Failed to forward text: ${err.message}`)
  }
}

/**
 * Download an audio message buffer and forward it to FastAPI POST /webhook/audio.
 */
async function forwardAudioMessage(sender, msg) {
  try {
    console.log(`[bridge] Downloading audio from "${sender}"…`)
    const buffer = await downloadMediaMessage(msg, 'buffer', {})
    const form = new FormData()
    form.append('sender', sender)
    form.append('audio', buffer, {
      filename: 'voice.ogg',
      contentType: 'audio/ogg',
    })
    const resp = await axios.post(`${FASTAPI_URL}/webhook/audio`, form, {
      headers: form.getHeaders(),
    })
    const data = resp.data
    console.log(
      `[bridge] Forwarded audio from "${sender}" → status=${data.status} orders=${data.orders_extracted ?? 0}`
    )
  } catch (err) {
    console.error(`[bridge] Failed to forward audio: ${err.message}`)
  }
}

// ─── Baileys socket ───────────────────────────────────────────────────────────

async function startSocket() {
  // Tear down any previous socket cleanly before creating a new one.
  // This prevents duplicate event listeners and "connection replaced" loops.
  if (sock) {
    try {
      sock.ev.removeAllListeners()
      sock.ws?.close()
    } catch (_) { /* ignore */ }
    sock = null
  }

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()

  console.log(`[bridge] Using Baileys WA version ${version.join('.')}`)

  sock = makeWASocket({
    version,
    auth: state,
    // Silence verbose Baileys logs; set level to 'debug' for troubleshooting
    logger: pino({ level: 'silent' }),
    // Improves reliability of media downloads
    generateHighQualityLinkPreview: false,
    // Only receive messages, don't send
    shouldIgnoreJid: (jid) => isJidGroup(jid),  // skip group messages; remove to enable groups
  })

  // ── Credentials update ──
  sock.ev.on('creds.update', saveCreds)

  // ── QR code ──
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      currentQr = qr
      isConnected = false
      // Also print to terminal for convenience
      console.log('\n[bridge] Scan this QR code with WhatsApp → Linked Devices → Link a Device')
      try {
        const terminalQr = await import('qrcode-terminal').catch(() => null)
        if (terminalQr) terminalQr.default.generate(qr, { small: true })
      } catch (_) {
        // qrcode-terminal is optional; QR is always available at GET /qr
      }
      console.log(`[bridge] Or open: http://localhost:${BRIDGE_PORT}/qr\n`)
    }

    if (connection === 'open') {
      isConnected = true
      currentQr = null
      reconnectAttempts = 0
      const jid = sock.user?.id || ''
      connectedPhone = jid.replace(/:.*@/, '@').replace(/@.+/, '')
      console.log(`[bridge] Connected! Phone: ${connectedPhone}`)
    }

    if (connection === 'close') {
      isConnected = false
      connectedPhone = null
      currentQr = null

      const statusCode = lastDisconnect?.error instanceof Boom
        ? lastDisconnect.error.output?.statusCode
        : null

      console.log(`[bridge] Connection closed (code ${statusCode}).`)

      if (statusCode === DisconnectReason.loggedOut) {
        // ── Logged out: wipe saved session so a fresh QR is generated ──
        console.log('[bridge] Logged out — clearing saved session and restarting for fresh QR…')
        try {
          const authPath = path.resolve(AUTH_DIR)
          if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true })
            console.log(`[bridge] Cleared ${AUTH_DIR}`)
          }
        } catch (err) {
          console.error('[bridge] Failed to clear auth dir:', err.message)
        }
        console.log('[bridge] Restarting in 2 seconds…')
        setTimeout(startSocket, 2000)
      } else {
        // ── Any other disconnect: reconnect with exponential backoff (cap 30 s) ──
        reconnectAttempts++
        const base = statusCode === DisconnectReason.connectionReplaced ? 1000 : 3000
        const delay = Math.min(base * reconnectAttempts, 30_000)
        console.log(`[bridge] Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts})…`)
        setTimeout(startSocket, delay)
      }
    }
  })

  // ── Incoming messages ──
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    // 'notify' = new messages arriving in real time
    if (type !== 'notify') return

    for (const msg of messages) {
      // Skip messages sent by us
      if (msg.key.fromMe) continue
      // Skip status broadcast
      if (msg.key.remoteJid === 'status@broadcast') continue

      const sender = getSenderLabel(msg)
      const content = msg.message

      if (!content) continue

      // ── Text message ──
      const text =
        content.conversation ||
        content.extendedTextMessage?.text ||
        content.ephemeralMessage?.message?.conversation ||
        null

      if (text) {
        await forwardTextMessage(sender, text)
        continue
      }

      // ── Audio / voice note ──
      if (content.audioMessage || content.pttMessage) {
        await forwardAudioMessage(sender, msg)
        continue
      }

      // ── Image with caption (treat caption as text order) ──
      const imageCaption = content.imageMessage?.caption
      if (imageCaption) {
        await forwardTextMessage(sender, `[Image] ${imageCaption}`)
        continue
      }

      console.log(`[bridge] Received unsupported message type from "${sender}" — skipping.`)
    }
  })
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

console.log('[bridge] Starting Invisible CRM WhatsApp Bridge…')
console.log(`[bridge] FastAPI URL: ${FASTAPI_URL}`)
startSocket().catch((err) => {
  console.error('[bridge] Fatal error:', err)
  process.exit(1)
})
