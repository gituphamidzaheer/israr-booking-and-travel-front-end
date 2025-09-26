import { config } from '@/lib/config'

export interface User {
  id?: number
  name: string
  email: string
  password?: string
  phone: string
  role: 'admin' | 'hotel'
}

export interface UserResponse {
  success: boolean
  data?: User | User[]
  message?: string
}

export class UserAPI {
  private static baseUrl = `${config.baseUrl}`

  static async createUser(userData: Omit<User, 'id'>): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return { success: response.ok, data, message: data.message }
    } catch (error) {
      console.error('Create user error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async getUserById(id: number): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${id}`, {

      })

      const data = await response.json()
      return { success: response.ok, data, message: data.message }
    } catch (error) {
      console.error('Get user error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async updateUser(id: number, userData: Partial<User>): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return { success: response.ok, data, message: data.message }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async deleteUser(id: number): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${id}`, {
        method: 'DELETE',
       
      })
      const data = await response.json()
      return { success: response.ok, message: data.message }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async getAllUsers(): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/user/all`, {
       
      })

      const data = await response.json()
      return { success: response.ok, data, message: data.message }
    } catch (error) {
      console.error('Get users error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

 
}
