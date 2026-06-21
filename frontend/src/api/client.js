import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dmtrack-production-16c0.up.railway.app/',
  timeout: 30000,
})

export const getOrders = (params = {}) => api.get('/orders', { params: { session_id: getSessionId(), ...params } })
export const updateOrder = (id, data) => api.patch(`/orders/${id}`, data)
export const getCustomers = () => api.get('/customers', { params: { session_id: getSessionId() } })
export const getCustomer = (id) => api.get(`/customers/${id}`, { params: { session_id: getSessionId() } })
export const getMessages = () => api.get('/messages', { params: { session_id: getSessionId() } })
function getSessionId() {
  let id = localStorage.getItem('wa_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('wa_session_id', id)
  }
  return id
}

export const getWhatsappStatus = () => api.get('/whatsapp/status', { params: { session: getSessionId() } })
export const getQrCode = () => api.get('/whatsapp/qr', { params: { session: getSessionId() } })

export default api
