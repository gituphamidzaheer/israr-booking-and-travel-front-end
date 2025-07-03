"use client"

import { VendorHeader } from '@/components/vendor/header'
import { useState, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Car } from 'lucide-react'
import { BookingAPI } from '@/public/api/booking'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const BookingsPage = () => {
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState({
    date: '',
    roomNo: '',
    passengerName: '',
    guest_phoneno: '',
    pickupAdress: '',
    destination: '',
    time: '',
    flightNumber: '',
    bookingType: {
      pickAndDrop: false,
      hourly: false
    },
    sClass: 0,
    vClass: 0,
    others: 0,
    bookBy: '',
    fare: '',
    note: ''
  })

  const bookingTypes = useMemo(() => ['PICK&DROP', 'HOURLY'], [])

  // Memoized time options to prevent regeneration
  const timeOptions = useMemo(() => {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(timeString)
      }
    }
    return times
  }, [])

  // Debounced input handlers for better performance
const handleInputChange = useCallback((field: string) => {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
}, []);


  const handleSelectChange = useCallback((field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const { sClass, vClass, others, bookingType, ...rest } = formData
      const types = []
      if (bookingType.pickAndDrop) types.push('PICK&DROP')
      if (bookingType.hourly) types.push('HOURLY')
      
      const bookingData = {
        ...rest,
        bookingType: types.join(','),
        sClass: Number(sClass) || 0,    // Convert to number or default to 0
        vClass: Number(vClass) || 0,    // Convert to number or default to 0
        others: Number(others) || 0     // Convert to number or default to 0
      }
      
      const response = await BookingAPI.createBooking(bookingData)
      
      // Handle 204 (No Content) as success
      if (response.success || response.data === null) {
        toast.success("Booking created successfully!")
        setSuccessMessage("Booking created successfully!")
        setFormData({
          date: '',
          roomNo: '',
          passengerName: '',
          guest_phoneno: '',
          pickupAdress: '',
          destination: '',
          time: '',
          flightNumber: '',
          bookingType: {
            pickAndDrop: false,
            hourly: false
          },
          sClass: 0,
          vClass: 0,
          others: 0,
          bookBy: '',
          fare: '',
          note: ''
        })
        
        // Clear all form inputs by resetting their values
        const form = e.target as HTMLFormElement
        form.reset()
      } else {
        toast.error(response.message || "Failed to create booking")
        setError(response.message || "Failed to create booking")
      }
    } catch (error) {
      console.error('Error saving booking:', error)
      toast.error("An error occurred while saving the booking")
      setError("An error occurred while saving the booking")
    } finally {
      setIsFormLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full mt-12">
      <div className="p-2 sm:p-4 lg:p-6">
        <VendorHeader title="Create New Booking" description="Fill in the booking details to request a new car service" />

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Car className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Booking Form</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-600">Please fill in all required fields</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm">
                  {successMessage}
                </div>
              )}

              {/* Beautiful Loading Animation */}
              {isFormLoading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-8 shadow-2xl">
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-pulse"></div>
                        <div className="absolute inset-2 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
                        <div className="absolute inset-6 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce">
                          <Car className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-purple-700 animate-pulse">Creating Booking...</h3>
                        <div className="flex justify-center space-x-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date and Room No Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Date */}
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-blue-700 font-medium text-sm sm:text-base">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange('date')}
                      className="border-blue-300 focus:border-blue-500 cursor-pointer bg-white text-gray-900 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>

                {/* Room No (Optional) */}
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                  <div className="space-y-2">
                    <Label htmlFor="roomNo" className="text-green-700 font-medium text-sm sm:text-base">Room No (Optional)</Label>
                    <Input
                      id="roomNo"
                      value={formData.roomNo}
                      onChange={handleInputChange('roomNo')}
                      placeholder="Enter room number"
                      className="border-green-300 focus:border-green-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Passenger Name and Guest Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Name of Passenger */}
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
                  <div className="space-y-2">
                    <Label htmlFor="passengerName" className="text-purple-700 font-medium text-sm sm:text-base">Name of Passenger *</Label>
                    <Input
                      id="passengerName"
                      value={formData.passengerName}
                      onChange={handleInputChange('passengerName')}
                      placeholder="Enter passenger name"
                      className="border-purple-300 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>

                {/* Guest Phone No (Optional) */}
                <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg border border-indigo-200">
                  <div className="space-y-2">
                    <Label htmlFor="guestPhoneNo" className="text-indigo-700 font-medium text-sm sm:text-base">Guest Phone No (Optional)</Label>
                    <Input
                      id="guestPhoneNo"
                      value={formData.guest_phoneno}
                      onChange={handleInputChange('guest_phoneno')}
                      placeholder="Enter guest phone number"
                      className="border-indigo-300 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Address and Destination Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Pickup Address */}
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
                  <div className="space-y-2">
                    <Label htmlFor="pickupAddress" className="text-orange-700 font-medium text-sm sm:text-base">Pickup Address *</Label>
                    <Input
                      id="pickupAddress"
                      value={formData.pickupAdress}
                      onChange={handleInputChange('pickupAdress')}
                      placeholder="Enter pickup address"
                      className="border-orange-300 focus:border-orange-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="bg-teal-50 p-3 sm:p-4 rounded-lg border border-teal-200">
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-teal-700 font-medium text-sm sm:text-base">Destination *</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={handleInputChange('destination')}
                      placeholder="Enter destination"
                      className="border-teal-300 focus:border-teal-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Time and Flight No Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Time */}
                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-yellow-700 font-medium text-sm sm:text-base">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange('time')}
                      className="border-yellow-300 focus:border-yellow-500 bg-white text-gray-900 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>

                {/* Flight No (Optional) */}
                <div className="bg-pink-50 p-3 sm:p-4 rounded-lg border border-pink-200">
                  <div className="space-y-2">
                    <Label htmlFor="flightNo" className="text-pink-700 font-medium text-sm sm:text-base">Flight No (Optional)</Label>
                    <Input
                      id="flightNo"
                      value={formData.flightNumber}
                      onChange={handleInputChange('flightNumber')}
                      placeholder="Enter flight number"
                      className="border-pink-300 focus:border-pink-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Booking Type and Book By Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Booking Type */}
                <div className="bg-cyan-50 p-3 sm:p-4 rounded-lg border border-cyan-200">
                  <div className="space-y-2">
                    <Label className="text-cyan-700 font-medium text-sm sm:text-base">Booking Type *</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="pickAndDrop"
                          checked={formData.bookingType.pickAndDrop}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            bookingType: {
                              ...prev.bookingType,
                              pickAndDrop: e.target.checked
                            }
                          }))}
                          className="w-4 h-4 text-purple-600 border-cyan-300"
                          disabled={isFormLoading}
                        />
                        <Label htmlFor="pickAndDrop" className="text-gray-700">Pick & Drop</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="hourly"
                          checked={formData.bookingType.hourly}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            bookingType: {
                              ...prev.bookingType,
                              hourly: e.target.checked
                            }
                          }))}
                          className="w-4 h-4 text-purple-600 border-cyan-300"
                          disabled={isFormLoading}
                        />
                        <Label htmlFor="hourly" className="text-gray-700">Hourly</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book By */}
                <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
                  <div className="space-y-2">
                    <Label htmlFor="bookBy" className="text-emerald-700 font-medium text-sm sm:text-base">Book By *</Label>
                    <Input
                      id="bookBy"
                      value={formData.bookBy}
                      onChange={handleInputChange('bookBy')}
                      placeholder="Enter who booked this"
                      className="border-emerald-300 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Type and Quantity (Keep existing layout) */}
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200">
                <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-3 sm:mb-4 flex items-center">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sClass" className="text-red-700 font-medium text-sm sm:text-base">S-Class</Label>
                    <Input
                      id="sClass"
                      type="number"
                      min="0"
                      value={formData.sClass}
                      onChange={handleInputChange('sClass')}
                      className="border-red-300 focus:border-red-500 bg-white text-gray-900 text-sm sm:text-base"
                      disabled={isFormLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vClass" className="text-red-700 font-medium text-sm sm:text-base">V-Class</Label>
                    <Input
                      id="vClass"
                      type="number"
                      min="0"
                      value={formData.vClass}
                      onChange={handleInputChange('vClass')}
                      className="border-red-300 focus:border-red-500 bg-white text-gray-900 text-sm sm:text-base"
                      disabled={isFormLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="others" className="text-red-700 font-medium text-sm sm:text-base">Others</Label>
                    <Input
                      id="others"
                      type="number"
                      min="0"
                      value={formData.others}
                      onChange={handleInputChange('others')}
                      className="border-red-300 focus:border-red-500 bg-white text-gray-900 text-sm sm:text-base"
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Fare (Single field) */}
              <div className="bg-violet-50 p-3 sm:p-4 rounded-lg border border-violet-200">
                <div className="space-y-2">
                  <Label htmlFor="fare" className="text-violet-700 font-medium text-sm sm:text-base">Fare *</Label>
                  <Input
                    id="fare"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fare}
                    onChange={handleInputChange('fare')}
                    placeholder="Enter fare amount"
                    className="border-violet-300 focus:border-violet-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                    required
                    disabled={isFormLoading}
                  />
                </div>
              </div>

              {/* Notes (Single field) */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-gray-700 font-medium text-sm sm:text-base">Note</Label>
                  <Textarea
                    id="note"
                    value={formData.note}
                    onChange={handleInputChange('note')}
                    placeholder="Enter any additional note"
                    className="border-gray-300 min-h-[80px] bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                    rows={3}
                    disabled={isFormLoading}
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4 sm:pt-6">
                <Button 
                  type="submit" 
                  disabled={isFormLoading} 
                  className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] sm:min-w-[200px] text-base sm:text-lg py-2 sm:py-3 transition-all duration-200"
                >
                  {isFormLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Booking'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
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

export default BookingsPage;


