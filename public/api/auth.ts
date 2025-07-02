import { config } from '@/lib/config'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token?: string
  role?: string
  id?: number
  message?: string
}

export class AuthAPI {
  private static baseUrl = config.baseUrl

  static async login(credentials: LoginCredentials): Promise<{ success: boolean; data?: AuthResponse; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data: AuthResponse = await response.json()

      if (response.ok && data.access_token) {
        // Save session to localStorage
        this.saveSession(data.access_token, data)
        return { success: true, data }
      } else {
        return { success: false, message: data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Network error occurred',
      }
    }
  }

  static saveSession(token: string, responseData: AuthResponse) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
      localStorage.setItem('user_role', responseData.role || '')
      localStorage.setItem('user_id', responseData.id?.toString() || '')
      localStorage.setItem('auth_data', JSON.stringify(responseData))
    }
  }

  static getSession() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      const role = localStorage.getItem('user_role')
      const id = localStorage.getItem('user_id')
      const authData = localStorage.getItem('auth_data')
      
      return {
        token,
        role,
        id,
        data: authData ? JSON.parse(authData) : null,
      }
    }
    return { token: null, role: null, id: null, data: null }
  }

  static clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_role')
      localStorage.removeItem('user_id')
      localStorage.removeItem('auth_data')
    }
  }

  static isAuthenticated(): boolean {
    const { token } = this.getSession()
    return !!token
  }

  static logout() {
    this.clearSession()
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }
}
   
