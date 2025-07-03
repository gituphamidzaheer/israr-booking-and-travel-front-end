"use client"

import { VendorHeader } from '@/components/vendor/header'
import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, MapPin, User, Car, Clock, Phone, CreditCard, Users, Plane, Eye, Search } from 'lucide-react'
import { BookingAPI, type Booking } from '@/public/api/booking'

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchId, setSearchId] = useState("")
  const [searchName, setSearchName] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchId, searchName])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const hotelId = localStorage.getItem('user_id');
      if (!hotelId) {
        setError("Hotel ID not found");
        return;
      }
      const response = await fetch(`${BookingAPI.getBaseUrl()}/hotel/${hotelId}`);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        setBookings(data);
      } else {
        setError(data.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError("An error occurred while fetching bookings")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBookingById = async (id: number) => {
    try {
      const hotelId = localStorage.getItem('id');
      if (!hotelId) {
        setError("Hotel ID not found");
        return;
      }
      
      const response = await fetch(`${BookingAPI.getBaseUrl()}/hotel/${hotelId}/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        const bookingData = Array.isArray(data) ? data[0] : data;
        if (bookingData) {
          setBookings(prevBookings => 
            prevBookings.map(booking => 
              booking.id === id ? bookingData : booking
            )
          );
          setSelectedBooking(bookingData);
        }
      } else {
        setError(data.message || "Failed to fetch booking details");
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError("An error occurred while fetching the booking details");
    }
  };

  const filterBookings = () => {
    let filtered = bookings

    if (searchId) {
      // If searching by ID, try to fetch that specific booking
      const id = parseInt(searchId);
      if (!isNaN(id)) {
        fetchBookingById(id);
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full">
        <div className="p-2 sm:p-4 lg:p-6">
          <VendorHeader title="My Bookings" description="View and manage all your booking requests" />
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
                <div className="absolute inset-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-bounce">
                  <Car className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700 animate-pulse">Loading Bookings...</h3>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-100"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
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
    <div className="min-h-screen bg-gray-50 w-full mt-12">
      <div className="p-2 sm:p-4 lg:p-6">
        <VendorHeader title="My Bookings" description="View and manage all your booking requests" />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                </div>
                <Car className="w-8 h-8 text-blue-500" />
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beautiful Table */}
        <Card className="bg-white shadow-lg border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 top-0 z-20">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700 text-center py-4 w-20">ID</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-48">Passenger Details</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-40">Pickup Address</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-40">Destination</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4 w-32">Date & Time</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4 w-28">Vehicle Info</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4 w-32">Fare Details</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4 w-28">Extra Charge</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4 w-32">Total Fare</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4 w-36">Driver</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4 w-24">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center py-4 w-48">Notes</TableHead>
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
                        <TableCell className="text-center py-4 w-20">
                          <div className="flex flex-col items-center space-y-1">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                              <Car className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">#{booking.id}</span>
                          </div>
                        </TableCell>

                        {/* Passenger Details */}
                        <TableCell className="py-4 w-48">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="font-medium text-gray-900 text-sm truncate">{booking.passengerName}</span>
                            </div>
                            {booking.guest_phoneno && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-600 truncate">{booking.guest_phoneno}</span>
                              </div>
                            )}
                            {booking.roomNo && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                Room {booking.roomNo}
                              </span>
                            )}
                            <div className="text-xs text-gray-500 truncate">
                              By: {booking.bookBy}
                            </div>
                            {booking.flightNumber && (
                              <div className="flex items-center space-x-2">
                                <Plane className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded truncate">
                                  {booking.flightNumber}
                                </span>
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {booking.bookingType}
                            </div>
                          </div>
                        </TableCell>

                        {/* Pickup Address */}
                        <TableCell className="py-4 w-40">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                              <span className="text-sm font-medium text-green-700">From</span>
                            </div>
                            <div className="text-sm text-gray-800 font-medium truncate" title={booking.pickupAdress}>
                              {booking.pickupAdress}
                            </div>
                          </div>
                        </TableCell>

                        {/* Destination */}
                        <TableCell className="py-4 w-40">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                              <span className="text-sm font-medium text-red-700">To</span>
                            </div>
                            <div className="text-sm text-gray-800 font-medium truncate" title={booking.destination}>
                              {booking.destination}
                            </div>
                          </div>
                        </TableCell>

                        {/* Date & Time */}
                        <TableCell className="text-center py-4 w-32">
                          <div className="space-y-1">
                            <div className="flex items-center justify-center space-x-1">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span className="text-xs font-medium text-gray-800">
                                {formatDate(booking.date)}
                              </span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{booking.time}</span>
                            </div>
                            {booking.createdAt && (
                              <div className="text-xs text-gray-400">
                                {formatDate(booking.createdAt)}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Vehicle Info */}
                        <TableCell className="text-center py-4 w-28">
                          <div className="space-y-1">
                            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                              {booking.type || 'N/A'}
                            </span>
                            <div className="text-xs text-gray-600">
                              Qty: {booking.quantity || 0}
                            </div>
                            {booking.noOfVehicle && (
                              <div className="text-xs text-gray-500">
                                Total: {booking.noOfVehicle}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Base Fare */}
                        <TableCell className="text-center py-4 w-32">
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-blue-600">
                              ${booking.fare || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              Base Fare
                            </div>
                          </div>
                        </TableCell>

                        {/* Extra Charge */}
                        <TableCell className="text-center py-4 w-28">
                          <div className="space-y-1">
                            {booking.extraCharge && Number(booking.extraCharge) > 0 ? (
                              <>
                                <div className="text-lg font-bold text-orange-600">
                                  +${booking.extraCharge}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Additional
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-lg font-medium text-gray-400">
                                  $0
                                </div>
                                <div className="text-xs text-gray-400">
                                  No Extra
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>

                        {/* Total Fare */}
                        <TableCell className="text-center py-4 w-32">
                          <div className="space-y-1">
                            <div className="text-xl font-bold text-green-600">
                              ${(Number(booking.fare) || 0) + (Number(booking.extraCharge) || 0)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Final Amount
                            </div>
                          </div>
                        </TableCell>

                        {/* Driver Info */}
                        <TableCell className="text-center py-4 w-36">
                          {booking.driverName || booking.driverNumber ? (
                            <div className="space-y-1">
                              {booking.driverName && (
                                <div className="text-sm font-medium text-gray-800 truncate">
                                  {booking.driverName}
                                </div>
                              )}
                              {booking.driverNumber && (
                                <div className="text-xs text-gray-600 truncate">
                                  {booking.driverNumber}
                                </div>
                              )}
                              <div className="inline-block bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">
                                Assigned
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-xs text-gray-400">Not Assigned</span>
                              <div className="inline-block bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded">
                                Pending
                              </div>
                            </div>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center py-4 w-24">
                          <div className="space-y-1">
                            <Badge className={`${getStatusColor(booking.status)} font-medium text-xs px-2 py-1`}>
                              {booking.status || 'In Progress'}
                            </Badge>
                            {booking.isActive !== undefined && (
                              <div className="text-xs">
                                {booking.isActive ? (
                                  <span className="text-green-600">● Active</span>
                                ) : (
                                  <span className="text-red-600">● Inactive</span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Notes */}
                        <TableCell className="py-4 w-48">
                          {booking.note ? (
                            <div className="text-xs text-gray-600 truncate" title={booking.note}>
                              {booking.note}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No notes</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <Car className="w-16 h-16 text-gray-300" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                              {searchId || searchName ? 'No matching bookings found' : 'No bookings found'}
                            </h3>
                            <p className="text-gray-500">
                              {searchId || searchName 
                                ? 'Try adjusting your search filters.' 
                                : 'Your bookings will appear here once you create them.'
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

        {/* Fare Summary Card */}
        {filteredBookings.length > 0 && (
          <Card className="bg-white shadow-sm border-gray-200 mt-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Fare Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${filteredBookings.reduce((sum, b) => sum + (Number(b.fare) || 0), 0)}
                  </div>
                  <div className="text-sm text-blue-700">Total Base Fare</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    ${filteredBookings.reduce((sum, b) => sum + (Number(b.extraCharge) || 0), 0)}
                  </div>
                  <div className="text-sm text-orange-700">Total Extra Charges</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${filteredBookings.reduce((sum, b) => sum + (Number(b.fare) || 0) + (Number(b.extraCharge) || 0), 0)}
                  </div>
                  <div className="text-sm text-green-700">Grand Total</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${Math.round(filteredBookings.reduce((sum, b) => sum + (Number(b.fare) || 0) + (Number(b.extraCharge) || 0), 0) / filteredBookings.length)}
                  </div>
                  <div className="text-sm text-purple-700">Average Fare</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default BookingsPage
