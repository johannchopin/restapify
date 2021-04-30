import axios from 'axios'

// @ts-ignore
const port = (__NODE_ENV__ === 'development' 
  ? 6767 
  : new URL(window.location.href).port)

// @ts-ignore
const baseUrl = (__NODE_ENV__ === 'development' 
  ? '/dev/restapify/api' 
  : '/restapify/api')

const instance = axios.create({
  baseURL: `http://localhost:${port}${baseUrl}`
})

export default instance
