import { invoke } from '@tauri-apps/api/core'

// 缓存后端地址，避免重复调用
let cachedApiBaseUrl: string | null = null

/**
 * 获取后端 API 基础地址
 * 通过 Tauri 命令获取，支持动态端口配置
 */
export async function getApiBaseUrl(): Promise<string> {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl
  }

  try {
    // 尝试通过 Tauri 命令获取后端地址
    const baseUrl = await invoke<string>('get_api_base_url')
    cachedApiBaseUrl = baseUrl
    console.log('获取到后端地址:', baseUrl)
    return baseUrl
  } catch (error) {
    // 如果 Tauri 命令失败（比如开发环境），使用默认地址
    console.warn('获取后端地址失败，使用默认地址:', error)
    const defaultUrl = 'http://127.0.0.1:8000'
    cachedApiBaseUrl = defaultUrl
    return defaultUrl
  }
}

/**
 * 重置缓存的 API 地址（用于端口变更时刷新）
 */
export function resetApiBaseUrl(): void {
  cachedApiBaseUrl = null
}
