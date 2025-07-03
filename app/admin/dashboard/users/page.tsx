"use client"

import { AdminHeader } from '@/components/admin/header'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, User as UserIcon, Mail, Phone, Shield, UserCheck, Users, AlertCircle } from 'lucide-react'
import { UserAPI, type User as UserType } from '@/public/api/users'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const UsersPage = () => {
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'hotel' as 'admin' | 'hotel' 
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    const response = await UserAPI.getAllUsers()
    if (response.success && Array.isArray(response.data)) {
      setUsers(response.data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormLoading(true)
    setError("")

    try {
      let response
      if (editingUser) {
        response = await UserAPI.updateUser(editingUser.id!, formData)
      } else {
        response = await UserAPI.createUser(formData)
      }

      if (response.success) {
        toast.success(editingUser ? "Hotel updated successfully!" : "Hotel created successfully!")
        await fetchUsers()
        setIsDialogOpen(false)
        resetForm()
      } else {
        setError(response.message || "Operation failed")
        toast.error(response.message || "Operation failed")
      }
    } catch (error) {
      console.error('Error saving user:', error)
      setError("An error occurred while saving the user")
      toast.error("An error occurred while saving the user")
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleEdit = (user: UserType) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone,
      role: user.role
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    const response = await UserAPI.deleteUser(id)
    if (response.success) {
      await fetchUsers()
    }
    setDeletingId(null)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'hotel'
    })
    setEditingUser(null)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'hotel': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />
      case 'hotel': return <UserCheck className="w-4 h-4" />
      default: return <UserIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="w-full mt-20">
      <div className="px-4 sm:px-6 pb-6">
        <AdminHeader title="User Management" description="Manage system users and their roles" />

        {/* Beautiful Loading Animation */}
        {isLoading && users.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
                <div className="absolute inset-6 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700 animate-pulse">Loading Users...</h3>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Only show when not loading */}
        {!isLoading && (
          <div className="grid grid-cols-1 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-purple-25 to-purple-50 border-purple-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Hotels</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {users.filter(u => u.role === 'hotel').length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create User Dialog - Only show when not loading */}
        {!isLoading && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { resetForm(); setIsDialogOpen(true) }}
                className="mb-6 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Hotel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-800">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {editingUser ? 'Update user information' : 'Add a new user to the system'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Loading overlay for form */}
                {isFormLoading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">
                        {editingUser ? 'Updating...' : 'Creating...'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editingUser && <span className="text-sm text-gray-500">(leave empty to keep current)</span>}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter password"
                    required={!editingUser}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: 'admin' | 'hotel') => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel">Hotel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-200 text-gray-600" disabled={isFormLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isFormLoading} className="bg-purple-500 hover:bg-purple-600 min-w-[100px]">
                    {isFormLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{editingUser ? 'Updating...' : 'Creating...'}</span>
                      </div>
                    ) : (
                      editingUser ? 'Update' : 'Create'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Users List - Only show when not loading */}
        {!isLoading && (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow bg-white border-gray-100">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                        </div>
                        <Badge className={`mt-2 ${getRoleColor(user.role)} font-medium`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="text-blue-500 border-blue-200 min-w-[70px]"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id!)}
                        disabled={deletingId === user.id}
                        className="text-red-500 border-red-200 min-w-[80px]"
                      >
                        {deletingId === user.id ? (
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"></div>
                            <span>Deleting...</span>
                          </div>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No users message - Only show when not loading */}
        {users.length === 0 && !isLoading && (
          <Card className="bg-white border-gray-100">
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No users found</h3>
              <p className="text-gray-500">Create your first user to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Custom CSS for animation delays */}
      <style jsx>{`
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  )
}

export default UsersPage
