"use client"

import { AdminHeader } from '@/components/admin/header'
import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Calendar, MapPin, User, Car, Clock, Phone, CreditCard, Users, Plane, Edit, Trash2, Download, Search, Plus } from 'lucide-react'
import { BookingAPI, type Booking, VehicleType } from '@/public/api/booking'

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchId, setSearchId] = useState("")
  const [searchName, setSearchName] = useState("")
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Booking>>({})

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchId, searchName])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await BookingAPI.getAllBookings()
      if (response.success && Array.isArray(response.data)) {
        setBookings(response.data)
      } else {
        setError(response.message || "Failed to fetch bookings")
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError("An error occurred while fetching bookings")
    } finally {
      setIsLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    if (searchId) {
      filtered = filtered.filter(booking => 
        booking.id?.toString().includes(searchId)
      )
    }

    if (searchName) {
      filtered = filtered.filter(booking => 
        booking.passengerName.toLowerCase().includes(searchName.toLowerCase())
      )
    }

    setFilteredBookings(filtered)
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200'
    
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200'
      case 'inprogress': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setEditFormData({
      passengerName: booking.passengerName,
      guest_phoneno: booking.guest_phoneno,
      roomNo: booking.roomNo,
      pickupAdress: booking.pickupAdress,
      destination: booking.destination,
      date: booking.date?.split('T')[0], // Format for input[type="date"]
      time: booking.time,
      flightNumber: booking.flightNumber,
      bookingType: booking.bookingType,
      vehicleInfo: booking.vehicleInfo || { type: VehicleType.SCLASS, quantity: 1 },
      bookBy: booking.bookBy,
      fare: booking.fare,
      extraCharge: booking.extraCharge || 0,
      totalFare: booking.totalFare || ((Number(booking.fare) || 0) + (Number(booking.extraCharge) || 0)),
      note: booking.note,
      status: booking.status,
      driverName: booking.driverName,
      driverNumber: booking.driverNumber,
      noOfVehicle: booking.noOfVehicle || 1
    })
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editingBooking?.id) return

    setIsEditLoading(true)
    try {
      const response = await BookingAPI.updateBooking(editingBooking.id, editFormData)
      if (response.success) {
        await fetchBookings() // Refresh the list
        setIsEditModalOpen(false)
        setEditingBooking(null)
        setEditFormData({})
      } else {
        setError(response.message || "Failed to update booking")
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      setError("An error occurred while updating the booking")
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await BookingAPI.deleteBooking(id)
      if (response.success) {
        await fetchBookings() // Refresh the list
      } else {
        setError(response.message || "Failed to delete booking")
      }
    } catch (error) {
      console.error('Error deleting booking:', error)
      setError("An error occurred while deleting the booking")
    }
  }

  const downloadCSV = () => {
    // Define CSV headers
    const headers = [
      'ID',
      'Passenger Name',
      'Phone Number',
      'Pickup Address',
      'Destination',
      'Date',
      'Time',
      'Room No',
      'Flight No',
      'Booking Type',
      'Vehicle Type',
      'Vehicle Quantity',
      'Vehicle No',
      'Base Fare',
      'Extra Charge',
      'Total Fare',
      'Driver Name',
      'Driver Number',
      'Status',
      'Book By',
      'Notes',
      'Created At'
    ]

    // Convert bookings data to CSV format (each booking as a row)
    const csvData = filteredBookings.map(booking => [
      booking.id || '',
      booking.passengerName || '',
      booking.guest_phoneno || '',
      booking.pickupAdress || '',
      booking.destination || '',
      booking.date ? new Date(booking.date).toLocaleDateString() : '',
      booking.time || '',
      booking.roomNo || '',
      booking.flightNumber || '',
      booking.bookingType || '',
      booking.vehicleInfo?.type || '',
      booking.vehicleInfo?.quantity || '',
      booking.noOfVehicle || '',
      booking.fare || '',
      booking.extraCharge || '',
      (Number(booking.fare) || 0) + (Number(booking.extraCharge) || 0),
      booking.driverName || '',
      booking.driverNumber || '',
      booking.status || '',
      booking.bookBy || '',
      booking.note || '',
      booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''
    ])

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadSingleBookingCSV = (booking: Booking) => {
    // Define CSV headers
    const headers = [
      'ID',
      'Passenger Name',
      'Phone Number',
      'Pickup Address',
      'Destination',
      'Date',
      'Time',
      'Room No',
      'Flight No',
      'Booking Type',
      'Vehicle Type',
      'Vehicle Quantity',
      'Vehicle No',
      'Base Fare',
      'Extra Charge',
      'Total Fare',
      'Driver Name',
      'Driver Number',
      'Status',
      'Book By',
      'Notes',
      'Created At'
    ]

    // Convert single booking data to CSV format
    const csvData = [
      booking.id || '',
      booking.passengerName || '',
      booking.guest_phoneno || '',
      booking.pickupAdress || '',
      booking.destination || '',
      booking.date ? new Date(booking.date).toLocaleDateString() : '',
      booking.time || '',
      booking.roomNo || '',
      booking.flightNumber || '',
      booking.bookingType || '',
      booking.vehicleInfo?.type || '',
      booking.vehicleInfo?.quantity || '',
      booking.noOfVehicle || '',
      booking.fare || '',
      booking.extraCharge || '',
      (Number(booking.fare) || 0) + (Number(booking.extraCharge) || 0),
      booking.driverName || '',
      booking.driverNumber || '',
      booking.status || '',
      booking.bookBy || '',
      booking.note || '',
      booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''
    ]

    // Combine headers and data
    const csvContent = [headers, csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `booking_${booking.id}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="px-4 sm:px-6 pb-6">
          <AdminHeader title="Bookings Management" description="Manage all booking requests and their details" />
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
                <div className="absolute inset-6 w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center animate-bounce">
                  <Car className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700 animate-pulse">Loading Bookings...</h3>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce animation-delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce animation-delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          .animation-delay-100 { animation-delay: 0.1s; }
          .animation-delay-150 { animation-delay: 0.15s; }
          .animation-delay-200 { animation-delay: 0.2s; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="w-full mt-24">
      <div className="px-4 sm:px-6 pb-6">
        <AdminHeader title="Bookings Management" description="Manage all booking requests and their details" />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                </div>
                <Car className="w-8 h-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">In Progress</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {bookings.filter(b => b.status?.toLowerCase() === 'inprogress').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {bookings.filter(b => b.status?.toLowerCase() === 'completed').length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${bookings.reduce((sum, b) => sum + (Number(b.fare) || 0) + (Number(b.extraCharge) || 0), 0)}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Filters */}
        <Card className="bg-white shadow-sm border-gray-200 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="w-full sm:w-48">
                  <Input
                    placeholder="Search by ID..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="bg-white text-black border-gray-300 text-sm"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Input
                    placeholder="Search by passenger name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="bg-white text-black border-gray-300 text-sm"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchId(""); setSearchName("") }}
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
                <Button 
                  onClick={downloadCSV}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
                
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beautiful Table */}
        <Card className="bg-white shadow-lg border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 top-0 z-20">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700 text-center py-4">ID</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Passenger Name</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Pickup Address</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Destination</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4">Flight No</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4">Room No</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4">Fare</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4">Driver</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4">Notes</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4">Vehicle Info</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                      <TableRow 
                        key={booking.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        {/* ID */}
                        <TableCell className="text-center py-4">
                          <div className="flex flex-col items-center space-y-1">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                              <Car className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">#{booking.id}</span>
                          </div>
                        </TableCell>

                        {/* Passenger Name */}
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-sm">{booking.passengerName}</span>
                          </div>
                          {booking.guest_phoneno && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600">{booking.guest_phoneno}</span>
                            </div>
                          )}
                        </TableCell>

                        {/* Pickup Address */}
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            <span className="text-sm font-medium text-gray-800 truncate" title={booking.pickupAdress}>
                              {booking.pickupAdress}
                            </span>
                          </div>
                        </TableCell>

                        {/* Destination */}
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                            <span className="text-sm font-medium text-gray-800 truncate" title={booking.destination}>
                              {booking.destination}
                            </span>
                          </div>
                        </TableCell>

                        {/* Flight No */}
                        <TableCell className="text-center py-4">
                          {booking.flightNumber ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Plane className="w-3 h-3 text-blue-500" />
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {booking.flightNumber}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-center py-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-center space-x-1">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span className="text-xs font-medium text-gray-800">
                                {formatDate(booking.date)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">{booking.time}</div>
                          </div>
                        </TableCell>

                        {/* Room No */}
                        <TableCell className="text-center py-4">
                          {booking.roomNo ? (
                            <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                              Room {booking.roomNo}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </TableCell>

                        {/* Fare */}
                        <TableCell className="text-center py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-green-600">
                              ${(Number(booking.fare) || 0) + (Number(booking.extraCharge) || 0)}
                            </div>
                            <div className="text-xs text-gray-500">Base: ${booking.fare}</div>
                            {booking.extraCharge && Number(booking.extraCharge) > 0 && (
                              <div className="text-xs text-orange-600">Extra: +${booking.extraCharge}</div>
                            )}
                          </div>
                        </TableCell>

                        {/* Driver */}
                        <TableCell className="text-center py-4">
                          {booking.driverName || booking.driverNumber ? (
                            <div className="space-y-1">
                              {booking.driverName && (
                                <div className="text-sm font-medium text-gray-800">{booking.driverName}</div>
                              )}
                              {booking.driverNumber && (
                                <div className="text-xs text-gray-600">{booking.driverNumber}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Not Assigned</span>
                          )}
                        </TableCell>

                        {/* Notes */}
                        <TableCell className="py-4 max-w-[200px]">
                          {booking.note ? (
                            <div className="text-xs text-gray-600 truncate" title={booking.note}>
                              {booking.note}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No notes</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center py-4">
                          <div className="space-y-1">
                            <Badge className={`${getStatusColor(booking.status)} font-medium text-xs px-2 py-1`}>
                              {booking.status || 'In Progress'}
                            </Badge>
                            <div className="flex items-center justify-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${booking.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className={`text-xs ${booking.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {booking.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Vehicle Info */}
                        <TableCell className="text-center py-4">
                          <div className="space-y-1">
                            <span className="inline-block bg-purple-50 text-purple-700 text-xs font-medium px-2 py-1 rounded">
                              {booking.vehicleInfo?.type || 'N/A'}
                            </span>
                            <div className="text-xs text-gray-600">Qty: {booking.vehicleInfo?.quantity || 0}</div>
                            {booking.noOfVehicle && (
                              <div className="text-xs text-gray-500">Total: {booking.noOfVehicle}</div>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-center py-4">
                          <div className="flex flex-col space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(booking)}
                              className="bg-blue-50  text-blue-700 border-blue-200"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadSingleBookingCSV(booking)}
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              CSV
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-50  text-red-700 border-red-200"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete booking #{booking.id}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => booking.id && handleDelete(booking.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <Car className="w-16 h-16 text-gray-300" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                              {searchId || searchName ? 'No matching bookings found' : 'No bookings found'}
                            </h3>
                            <p className="text-gray-500">
                              {searchId || searchName 
                                ? 'Try adjusting your search filters.' 
                                : 'Bookings will appear here once they are created.'
                              }
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span className='text-blue-600'>Edit Booking #{editingBooking?.id}</span>
              </DialogTitle>
              <DialogDescription>
                Update booking details. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Editable fields */}
              <div className="space-y-2">
                <Label htmlFor="edit-passenger" className="text-gray-800 font-bold">Passenger Name *</Label>
                <Input
                  id="edit-passenger"
                  value={editFormData.passengerName || ''}
                  onChange={(e) => setEditFormData({...editFormData, passengerName: e.target.value})}
                  className="bg-white text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-gray-800 font-bold">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.guest_phoneno || ''}
                  onChange={(e) => setEditFormData({...editFormData, guest_phoneno: e.target.value})}
                  className="bg-white text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-pickup" className="text-gray-800 font-bold">Pickup Address *</Label>
                <Input
                  id="edit-pickup"
                  value={editFormData.pickupAdress || ''}
                  onChange={(e) => setEditFormData({...editFormData, pickupAdress: e.target.value})}
                  className="bg-white text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-destination" className="text-gray-800 font-bold">Destination *</Label>
                <Input
                  id="edit-destination"
                  value={editFormData.destination || ''}
                  onChange={(e) => setEditFormData({...editFormData, destination: e.target.value})}
                  className="bg-white text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-flight" className="text-gray-800 font-bold">Flight Number</Label>
                <Input
                  id="edit-flight"
                  value={editFormData.flightNumber || ''}
                  onChange={(e) => setEditFormData({...editFormData, flightNumber: e.target.value})}
                  className="bg-white text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-date" className="text-gray-800 font-bold">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editFormData.date || ''}
                  onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                  className="bg-white text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-room" className="text-gray-800 font-bold">Room Number</Label>
                <Input
                  id="edit-room"
                  value={editFormData.roomNo || ''}
                  onChange={(e) => setEditFormData({...editFormData, roomNo: e.target.value})}
                  className="bg-white text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-time" className="text-gray-800 font-bold">Time *</Label>
                <Input
                  id="edit-time"
                  value={editFormData.time || ''}
                  onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
                  className="bg-white text-black"
                />
              </div>

              {/* Fare Calculation Section */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-fare" className="text-gray-800 font-bold">Base Fare *</Label>
                    <Input
                      id="edit-fare"
                      type="number"
                      value={editFormData.fare || ''}
                      onChange={(e) => {
                        const newFare = e.target.value;
                        const totalFare = (Number(newFare) || 0) + (Number(editFormData.extraCharge) || 0);
                        setEditFormData({
                          ...editFormData, 
                          fare: newFare,
                          totalFare: totalFare
                        });
                      }}
                      className="bg-white text-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-extra" className="text-gray-800 font-bold">Extra Charge</Label>
                    <Input
                      id="edit-extra"
                      type="number"
                      value={editFormData.extraCharge || ''}
                      onChange={(e) => {
                        const newExtraCharge = e.target.value;
                        const totalFare = (Number(editFormData.fare) || 0) + (Number(newExtraCharge) || 0);
                        setEditFormData({
                          ...editFormData, 
                          extraCharge: Number(newExtraCharge) || 0,
                          totalFare: totalFare
                        });
                      }}
                      className="bg-white text-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-total-fare" className="text-gray-800 font-bold">Total Fare</Label>
                    <Input
                      id="edit-total-fare"
                      type="number"
                      value={editFormData.totalFare || 0}
                      readOnly
                      className="bg-gray-100 text-black cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">Auto-calculated (Base + Extra)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-driver-name" className="text-gray-800 font-bold">Driver Name</Label>
                <Input
                  id="edit-driver-name"
                  value={editFormData.driverName || ''}
                  onChange={(e) => setEditFormData({...editFormData, driverName: e.target.value})}
                  className="bg-white text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-driver-number" className="text-gray-800 font-bold">Driver Number</Label>
                <Input
                  id="edit-driver-number"
                  value={editFormData.driverNumber || ''}
                  onChange={(e) => setEditFormData({...editFormData, driverNumber: e.target.value})}
                  className="bg-white text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-gray-800 font-bold">Status</Label>
                <Select
                  value={editFormData.status || ''}
                  onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                >
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-booking-type" className="text-gray-800 font-bold">Booking Type *</Label>
                <Select
                  value={editFormData.bookingType || ''}
                  onValueChange={(value) => setEditFormData({...editFormData, bookingType: value})}
                >
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PICK&DROP">PICK&DROP</SelectItem>
                    <SelectItem value="HOURLY">HOURLY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Information */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-vehicle-type" className="text-gray-800 font-bold">Vehicle Type *</Label>
                    <Select
                      value={editFormData.vehicleInfo?.type || ''}
                      onValueChange={(value) => setEditFormData({
                        ...editFormData, 
                        vehicleInfo: { 
                          type: value as VehicleType,
                          quantity: editFormData.vehicleInfo?.quantity || 1
                        }
                      })}
                    >
                      <SelectTrigger className="bg-white text-black">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SCLASS">S-Class</SelectItem>
                        <SelectItem value="VCLASS">V-Class</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-vehicle-quantity" className="text-gray-800 font-bold">Vehicle Quantity *</Label>
                    <Input
                      id="edit-vehicle-quantity"
                      type="number"
                      min="1"
                      value={editFormData.vehicleInfo?.quantity || ''}
                      onChange={(e) => setEditFormData({
                        ...editFormData, 
                        vehicleInfo: { 
                          type: editFormData.vehicleInfo?.type || VehicleType.SCLASS,
                          quantity: parseInt(e.target.value) || 1 
                        }
                      })}
                      className="bg-white text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-no-of-vehicle" className="text-gray-800 font-bold">Vehicle No *</Label>
                    <Input
                      id="edit-no-of-vehicle"
                      type="number"
                      min="1"
                      value={editFormData.noOfVehicle || ''}
                      onChange={(e) => setEditFormData({
                        ...editFormData, 
                        noOfVehicle: parseInt(e.target.value) || 1
                      })}
                      className="bg-white text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-note" className="text-gray-800 font-bold">Notes</Label>
                <Textarea
                  id="edit-note"
                  value={editFormData.note || ''}
                  onChange={(e) => setEditFormData({...editFormData, note: e.target.value})}
                  className="bg-white text-black"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isEditLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={isEditLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isEditLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Booking'
                )}
              </Button>
              {editingBooking && (editingBooking.status === 'completed' || editingBooking.status === 'cancelled') && (
                <Button
                  onClick={() => {
                    // Create a new booking with same details but reset status and dates
                    const rebookData = {
                      ...editingBooking,
                      id: undefined,
                      status: 'pending',
                      date: new Date().toISOString().split('T')[0],
                      createdAt: undefined,
                      updatedAt: undefined
                    }
                    BookingAPI.createBooking(rebookData).then((response) => {
                      if (response.success) {
                        fetchBookings()
                        setIsEditModalOpen(false)
                        setEditingBooking(null)
                        setEditFormData({})
                      }
                    })
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Rebook
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default AdminBookingsPage
