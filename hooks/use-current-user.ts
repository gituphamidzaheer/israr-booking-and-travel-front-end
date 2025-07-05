import { useState, useEffect } from 'react'
import { AuthAPI } from '@/public/api/auth'
import { UserAPI, User } from '@/public/api/users'

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get the current user session
        const session = AuthAPI.getSession()
        
        if (!session.id) {
          setError('No user session found')
          return
        }

        // Fetch user details by ID
        const response = await UserAPI.getUserById(Number(session.id))
        
        if (response.success && response.data) {
          setUser(response.data as User)
        } else {
          setError(response.message || 'Failed to fetch user')
        }
      } catch (err) {
        setError('An error occurred while fetching user data')
        console.error('Error fetching current user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  return { user, loading, error }
}
