"use client"

import { VendorHeader } from '@/components/vendor/header'
import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, MapPin, User, Car, Clock, Phone, CreditCard, Users, Plane, Eye, Search, Download } from 'lucide-react'
import { BookingAPI, type Booking } from '@/public/api/booking'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchId, setSearchId] = useState("")
  const [searchName, setSearchName] = useState("")
  const [searchDate, setSearchDate] = useState("")
  const [searchBookedBy, setSearchBookedBy] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchId, searchName, searchDate, searchBookedBy])

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

    if (searchDate) {
      filtered = filtered.filter(booking => 
        booking.date?.includes(searchDate)
      )
    }

    if (searchBookedBy) {
      filtered = filtered.filter(booking => 
        booking.bookBy?.toLowerCase().includes(searchBookedBy.toLowerCase())
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

  const deleteBooking = async (bookingId: number) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`${BookingAPI.getBaseUrl()}/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookings(prev => prev.filter(booking => booking.id !== bookingId));
        setFilteredBookings(prev => prev.filter(booking => booking.id !== bookingId));
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        setError('Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      setError('Error deleting booking');
    } finally {
      setIsDeleting(false)
    }
  }

  const downloadCSV = () => {
    const headers = ['Booking ID', 'Date & Time', 'Room No', 'Guest Name', 'Guest Phone', 'Pickup', 'Destination', 'Driver', 'Note', 'Booked By', 'Fare', 'Extra Charge', 'Total Amount', 'Status'];
    const csvData = filteredBookings.map(b => [
      b.id,
      `${b.date} ${b.time}`,
      b.roomNo,
      b.passengerName,
      b.guest_phoneno || '',
      b.pickupAdress,
      b.destination,
      `${b.driverName || ''} ${b.driverNumber ? `(${b.driverNumber})` : ''}`,
      b.note || '',
      b.bookBy,
      b.fare,
      b.extraCharge,
      (Number(b.fare) || 0) + (Number(b.extraCharge) || 0),
      b.status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  const downloadSingleBookingCSV = (booking: Booking) => {
    const headers = ['Booking ID', 'Date & Time', 'Room No', 'Guest Name', 'Guest Phone', 'Pickup', 'Destination', 'Driver', 'Note', 'Booked By', 'Fare', 'Extra Charge', 'Total Amount', 'Status'];
    const csvData = [[
      booking.id,
      `${booking.date} ${booking.time}`,
      booking.roomNo,
      booking.passengerName,
      booking.guest_phoneno || '',
      booking.pickupAdress,
      booking.destination,
      `${booking.driverName || ''} ${booking.driverNumber ? `(${booking.driverNumber})` : ''}`,
      booking.note || '',
      booking.bookBy,
      booking.fare,
      booking.extraCharge,
      (Number(booking.fare) || 0) + (Number(booking.extraCharge) || 0),
      booking.status
    ]];

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `booking_${booking.id}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

        {/* Search Filters */}
        <Card className="bg-white shadow-sm grid grid-cols-2 border-gray-200 mb-6">
          <CardContent className="p-4 w-[800px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                placeholder="Search by ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="bg-white  text-black border-gray-300"
              />
              <Input
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="bg-white text-black border-gray-300"
              />
              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="bg-white text-black border-gray-300"
              />
              {/* <Input
                placeholder="Search by booked by..."
                value={searchBookedBy}
                onChange={(e) => setSearchBookedBy(e.target.value)}
                className="bg-white text-black border-gray-300"
              /> */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setSearchId(""); 
                    setSearchName(""); 
                    setSearchDate("");
                    setSearchBookedBy("");
                  }}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button 
                  onClick={downloadCSV}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Download CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-lg border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className=''>
                <TableRow className='bg-blue-600 text-white'>
                  <TableHead className="w-20 text-white">ID</TableHead>
                  <TableHead className="w-32 text-white">Date & Time</TableHead>
                  <TableHead className="w-24 text-white">Room</TableHead>
                  <TableHead className="w-40 text-white">Guest Info</TableHead>
                  <TableHead className="w-40 text-white">Pickup</TableHead>
                  <TableHead className="w-40 text-white">Destination</TableHead>
                  <TableHead className="w-40 text-white">Driver</TableHead>
                  <TableHead className="w-40 text-white">Note</TableHead>
                  <TableHead className="w-32 text-white">Booked By</TableHead>
                  <TableHead className="w-24 text-white">Fare</TableHead>
                  <TableHead className="w-24 text-white">Extra</TableHead>
                  <TableHead className="w-24 text-white">Total</TableHead>
                  <TableHead className="w-28 text-white">Status</TableHead>
                  <TableHead className="w-32 text-white">Actions</TableHead>
                </TableRow> 
              </TableHeader>
              <TableBody className='bg-white text-black'>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">#{booking.id}</TableCell>
                    <TableCell className="whitespace-normal">
                      {formatDate(booking.date)}<br/>
                      <span className="text-sm text-gray-500">{booking.time}</span>
                    </TableCell>
                    <TableCell>{booking.roomNo}</TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="font-medium">{booking.passengerName}</div>
                      {booking.guest_phoneno && (
                        <div className="text-sm text-gray-500">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {booking.guest_phoneno}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-normal">{booking.pickupAdress}</TableCell>
                    <TableCell className="whitespace-normal">{booking.destination}</TableCell>
                    <TableCell className="whitespace-normal">
                      {booking.driverName && <div>{booking.driverName}</div>}
                      {booking.driverNumber && <div className="text-sm text-gray-500">{booking.driverNumber}</div>}
                    </TableCell>
                    <TableCell className="whitespace-normal">{booking.note}</TableCell>
                    <TableCell>{booking.bookBy}</TableCell>
                    <TableCell>${booking.fare}</TableCell>
                    <TableCell>${booking.extraCharge || 0}</TableCell>
                    <TableCell className="font-bold">
                      ${(Number(booking.fare) || 0) + (Number(booking.extraCharge) || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeleteId(booking.id!);
                            setShowDeleteModal(true);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => downloadSingleBookingCSV(booking)}
                          className="w-full bg-[#111827] text-white "
                        >
                          <Download className="w-4 h-4 mr-1" />
                          CSV
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteId(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteBooking(deleteId)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BookingsPage
