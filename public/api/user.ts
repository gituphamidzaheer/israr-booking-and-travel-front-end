import { config } from '@/lib/config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  data?: User[] | any;
  message?: string;
}

export class UserAPI {
  static async getAllUsers(): Promise<UserResponse> {
    try {
      const response = await fetch(`${config.baseUrl}/user/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return { success: response.ok, data, message: data.message };
    } catch (error) {
      console.error('Get users error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }
}
