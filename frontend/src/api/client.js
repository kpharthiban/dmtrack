import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
})

export const getOrders = (params = {}) => api.get('/orders', { params })
export const updateOrder = (id, data) => api.patch(`/orders/${id}`, data)
export const getCustomers = () => api.get('/customers')
export const getCustomer = (id) => api.get(`/customers/${id}`)
export const getMessages = () => api.get('/messages')
export const getWhatsappStatus = () => api.get('/whatsapp/status')
export const getQrCode = () => api.get('/whatsapp/qr')  // now through FastAPI proxy

export default api
