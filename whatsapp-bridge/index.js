/**
 * Invisible CRM — WhatsApp Bridge (Baileys) — Multi-session
 *
 * Each caller supplies a ?session=<uuid> query param.
 * A separate Baileys socket + auth directory is maintained per session ID,
 * so different users/devices each get their own independent WhatsApp connection.
 *
 * GET /qr?session=<id>     → QR code for this session (creates socket on first call)
 * GET /status?session=<id> → { connected, phone } for this session
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
const AUTH_DIR    = process.env.AUTH_DIR || './auth_info_baileys'

// ─── Per-session state ────────────────────────────────────────────────────────
// sessions: Map<sessionId, { sock, qr, isConnected, phone, reconnectAttempts }>

const sessions = new Map()

function getSession(sessionId) {
  return sessions.get(sessionId) || null
}

function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    const session = { sock: null, qr: null, isConnected: false, phone: null, reconnectAttempts: 0 }
    sessions.set(sessionId, session)
    startSocket(sessionId).catch(err =>
      console.error(`[bridge][${sessionId}] Fatal error:`, err)
    )
  }
  return sessions.get(sessionId)
}

// ─── Express server ───────────────────────────────────────────────────────────

const app = express()

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

/**
 * GET /qr?session=<id>
 * Returns the current QR code for this session as a base64 PNG data URL.
 * Creates a new socket for the session on first call.
 */
app.get('/qr', async (req, res) => {
  const sessionId = req.query.session
  if (!sessionId) return res.status(400).json({ error: 'Missing ?session= parameter.' })

  const session = getOrCreateSession(sessionId)

  if (session.isConnected) {
    return res.status(200).json({ connected: true, qr: null })
  }
  if (!session.qr) {
    return res.status(503).json({ error: 'QR not ready yet, please wait a moment.' })
  }
  try {
    const png = await qrcode.toDataURL(session.qr)
    res.json({ connected: false, qr: png })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR image.' })
  }
})

/**
 * GET /status?session=<id>
 * Returns { connected, phone } for this session.
 * Returns connected: false without creating a socket (socket is created on /qr).
 */
app.get('/status', (req, res) => {
  const sessionId = req.query.session
  if (!sessionId) return res.status(400).json({ error: 'Missing ?session= parameter.' })

  const session = getSession(sessionId)
  if (!session) {
    return res.json({ connected: false, phone: null })
  }
  res.json({ connected: session.isConnected, phone: session.phone })
})

app.listen(BRIDGE_PORT, () => {
  console.log(`[bridge] Express server listening on http://localhost:${BRIDGE_PORT}`)
  console.log(`[bridge]   GET /qr?session=<id>     → QR code image`)
  console.log(`[bridge]   GET /status?session=<id> → connection status`)
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSenderLabel(msg) {
  const pushName = msg.pushName || 'Unknown'
  const jid = msg.key.remoteJid || ''
  const phone = jid.replace(/@.+/, '')
  return pushName !== 'Unknown' ? `${pushName} (${phone})` : phone
}

async function forwardTextMessage(sessionId, sender, text) {
  try {
    const resp = await axios.post(`${FASTAPI_URL}/webhook`, {
      sender,
      message: text,
      media_type: 'text',
      session_id: sessionId,
    })
    const data = resp.data
    console.log(
      `[bridge][${sessionId}] Forwarded text from "${sender}" → status=${data.status} orders=${data.orders_extracted ?? 0}`
    )
  } catch (err) {
    console.error(`[bridge][${sessionId}] Failed to forward text: ${err.message}`)
  }
}

async function forwardAudioMessage(sessionId, sender, msg) {
  try {
    console.log(`[bridge][${sessionId}] Downloading audio from "${sender}"…`)
    const buffer = await downloadMediaMessage(msg, 'buffer', {})
    const form = new FormData()
    form.append('sender', sender)
    form.append('session_id', sessionId)
    form.append('audio', buffer, { filename: 'voice.ogg', contentType: 'audio/ogg' })
    const resp = await axios.post(`${FASTAPI_URL}/webhook/audio`, form, {
      headers: form.getHeaders(),
    })
    const data = resp.data
    console.log(
      `[bridge][${sessionId}] Forwarded audio from "${sender}" → status=${data.status} orders=${data.orders_extracted ?? 0}`
    )
  } catch (err) {
    console.error(`[bridge][${sessionId}] Failed to forward audio: ${err.message}`)
  }
}

// ─── Baileys socket (per session) ─────────────────────────────────────────────

async function startSocket(sessionId) {
  const session = sessions.get(sessionId)
  if (!session) return

  // Tear down any previous socket cleanly
  if (session.sock) {
    try {
      session.sock.ev.removeAllListeners()
      session.sock.ws?.close()
    } catch (_) {}
    session.sock = null
  }

  const authDir = path.join(AUTH_DIR, sessionId)
  const { state, saveCreds } = await useMultiFileAuthState(authDir)
  const { version } = await fetchLatestBaileysVersion()

  console.log(`[bridge][${sessionId}] Using Baileys WA version ${version.join('.')}`)

  session.sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    generateHighQualityLinkPreview: false,
    shouldIgnoreJid: (jid) => isJidGroup(jid),
  })

  session.sock.ev.on('creds.update', saveCreds)

  session.sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      session.qr = qr
      session.isConnected = false
      console.log(`[bridge][${sessionId}] QR ready — open /qr?session=${sessionId}`)
    }

    if (connection === 'open') {
      session.isConnected = true
      session.qr = null
      session.reconnectAttempts = 0
      const jid = session.sock.user?.id || ''
      session.phone = jid.replace(/:.*@/, '@').replace(/@.+/, '')
      console.log(`[bridge][${sessionId}] Connected! Phone: ${session.phone}`)
    }

    if (connection === 'close') {
      session.isConnected = false
      session.phone = null
      session.qr = null

      const statusCode = lastDisconnect?.error instanceof Boom
        ? lastDisconnect.error.output?.statusCode
        : null

      console.log(`[bridge][${sessionId}] Connection closed (code ${statusCode}).`)

      if (statusCode === DisconnectReason.loggedOut) {
        console.log(`[bridge][${sessionId}] Logged out — clearing session and restarting…`)
        try {
          const absAuthDir = path.resolve(authDir)
          if (fs.existsSync(absAuthDir)) {
            fs.rmSync(absAuthDir, { recursive: true, force: true })
          }
        } catch (err) {
          console.error(`[bridge][${sessionId}] Failed to clear auth dir:`, err.message)
        }
        setTimeout(() => startSocket(sessionId), 2000)
      } else {
        session.reconnectAttempts++
        const base = statusCode === DisconnectReason.connectionReplaced ? 1000 : 3000
        const delay = Math.min(base * session.reconnectAttempts, 30_000)
        console.log(`[bridge][${sessionId}] Reconnecting in ${delay / 1000}s (attempt ${session.reconnectAttempts})…`)
        setTimeout(() => startSocket(sessionId), delay)
      }
    }
  })

  session.sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (msg.key.fromMe) continue
      if (msg.key.remoteJid === 'status@broadcast') continue

      const sender = getSenderLabel(msg)
      const content = msg.message
      if (!content) continue

      const text =
        content.conversation ||
        content.extendedTextMessage?.text ||
        content.ephemeralMessage?.message?.conversation ||
        null

      if (text) {
        await forwardTextMessage(sessionId, sender, text)
        continue
      }

      if (content.audioMessage || content.pttMessage) {
        await forwardAudioMessage(sessionId, sender, msg)
        continue
      }

      const imageCaption = content.imageMessage?.caption
      if (imageCaption) {
        await forwardTextMessage(sessionId, sender, `[Image] ${imageCaption}`)
        continue
      }

      console.log(`[bridge][${sessionId}] Unsupported message type from "${sender}" — skipping.`)
    }
  })
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

console.log('[bridge] Starting Invisible CRM WhatsApp Bridge (multi-session)…')
console.log(`[bridge] FastAPI URL: ${FASTAPI_URL}`)
