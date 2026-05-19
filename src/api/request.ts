import { getApiBaseUrl } from './config'

/**
 * 封装的 API 请求函数
 * 自动拼接后端地址，支持动态端口
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = await getApiBaseUrl()
  const url = `${baseUrl}${endpoint}`

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  return response
}

/**
 * GET 请求
 */
export async function apiGet(endpoint: string): Promise<Response> {
  return apiRequest(endpoint, { method: 'GET' })
}

/**
 * POST 请求
 */
export async function apiPost(endpoint: string, data?: unknown): Promise<Response> {
  return apiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT 请求
 */
export async function apiPut(endpoint: string, data?: unknown): Promise<Response> {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE 请求
 */
export async function apiDelete(endpoint: string): Promise<Response> {
  return apiRequest(endpoint, { method: 'DELETE' })
}
