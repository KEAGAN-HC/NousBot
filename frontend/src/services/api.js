import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Interceptor: agrega token JWT si el usuario está autenticado
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

export async function sendMessage(question, sessionId = null) {
  const payload = { question }
  if (sessionId) payload.session_id = sessionId

  const response = await api.post('/chat/ask', payload)
  return response.data
}

export async function getStats() {
  const response = await api.get('/documents/stats')
  return response.data
}

export async function uploadPDF(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/documents/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function getSessions() {
  const response = await api.get('/sessions/')
  return response.data
}

export async function getSessionMessages(sessionId) {
  const response = await api.get(`/sessions/${sessionId}`)
  return response.data
}

export async function deleteSession(sessionId) {
  const response = await api.delete(`/sessions/${sessionId}`)
  return response.data
}
