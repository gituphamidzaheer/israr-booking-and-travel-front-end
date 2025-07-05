"use client";

import { VendorHeader } from "@/components/vendor/header";
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Car } from "lucide-react";
import { BookingAPI } from "@/public/api/booking";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingsPage = () => {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    roomNo: "",
    passengerName: "",
    guest_phoneno: "",
    pickupAdress: "",
    destination: "",
    time: "",
    numberOfPassengers: "",
    flightNumber: "",
    bookingType: {
      pickAndDrop: false,
      hourly: false,
      other: false
    },
    otherBookingType: "",
    
    sClass: 0,
    vClass: 0,
    others: {
      vehicleType: "",
      quantity: 0,
    },
    type: "",
    quantity: 0,
    bookBy: "",
    fare: "",
    note: "",
    status: "pending",
    extraCharge: 0,
    totalFare: 0,
    driverName: "",
    driverNumber: "",
    noOfVehicle: "",
  });

  // Vehicle type checkboxes state
  const [showSClass, setShowSClass] = useState(false);
  const [showVClass, setShowVClass] = useState(false);
  const [showOthers, setShowOthers] = useState(false);

  const bookingTypes = useMemo(() => ["PICK&DROP", "HOURLY"], []);

  // Memoized time options to prevent regeneration
  const timeOptions = useMemo(() => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        times.push(timeString);
      }
    }
    return times;
  }, []);

  // Debounced input handlers for better performance
  const handleInputChange = useCallback((field: string) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  }, []);

  const handleSelectChange = useCallback(
    (field: string) => (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Handle vehicle type checkbox changes
  const handleVehicleCheckbox = useCallback(
    (type: "sClass" | "vClass" | "others") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (type === "sClass") {
          setShowSClass(checked);
          if (!checked) setFormData((prev) => ({ ...prev, sClass: 0 }));
        }
        if (type === "vClass") {
          setShowVClass(checked);
          if (!checked) setFormData((prev) => ({ ...prev, vClass: 0 }));
        }
        if (type === "others") {
          setShowOthers(checked);
          if (!checked)
            setFormData((prev) => ({
              ...prev,
              others: { vehicleType: "", quantity: 0 },
              type: "",
              quantity: 0,
            }));
        }
      },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { bookingType, otherBookingType, ...rest } = formData;
      const types = [];
      
      // Modified booking type handling
      if (bookingType.pickAndDrop) types.push('PICK&DROP');
      if (bookingType.hourly) types.push('HOURLY');
      if (bookingType.other && otherBookingType.trim()) {
        types.push(otherBookingType.toUpperCase().trim());
      }

      // Ensure we have at least one booking type
      if (types.length === 0) {
        setError("Please select at least one booking type");
        setIsFormLoading(false);
        return;
      }

      // Format data according to API structure
      const bookingData = {
        ...rest,
        bookingType: types.length > 0 ? types.join(",") : "PICK&DROP", // Provide default if empty
        sClass: showSClass ? Number(formData.sClass) || 0 : 0,
        vClass: showVClass ? Number(formData.vClass) || 0 : 0,
        others: showOthers ? {
          ...formData.others,
          quantity: Number(formData.others.quantity) || 0
        } : { vehicleType: "", quantity: 0 },
        fare: Number(formData.fare) || 0,
        extraCharge: Number(formData.extraCharge) || 0,
        totalFare: Number(formData.fare) + (Number(formData.extraCharge) || 0),
        status: "pending"
      };

      console.log('Sending booking data:', bookingData); // Add this for debugging

      const response = await BookingAPI.createBooking(bookingData);

      if (response.success) {
        toast.success("Booking created successfully!");
        setSuccessMessage("Booking created successfully!");
        // Reset form
        setFormData({
          date: "",
          roomNo: "",
          passengerName: "",
          guest_phoneno: "",
          pickupAdress: "",
          destination: "",
          time: "",
          numberOfPassengers: "",
          flightNumber: "",
          bookingType: {
            pickAndDrop: false,
            hourly: false,
            other: false
          },
          otherBookingType: "",
          sClass: 0,
          vClass: 0,
          others: {
            vehicleType: "",
            quantity: 0,
          },
          type: "",
          quantity: 0,
          bookBy: "",
          fare: "",
          note: "",
          status: "pending",
          extraCharge: 0,
          totalFare: 0,
          driverName: "",
          driverNumber: "",
          noOfVehicle: "",
        });
        setShowSClass(false);
        setShowVClass(false);
        setShowOthers(false);
        const form = e.target as HTMLFormElement;
        form.reset();
      } else {
        toast.error(response.message || "Failed to create booking");
        setError(response.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error("An error occurred while saving the booking");
      setError("An error occurred while saving the booking");
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full mt-12">
      <div className="p-2 sm:p-4 lg:p-6">
        <VendorHeader
          title="Create New Booking"
        />

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Car className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-blue-600">
                  Booking Form
                </h2>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Please fill in all required fields
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-6 relative"
            >
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
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
                        <div className="absolute inset-2 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
                        <div className="absolute inset-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-bounce">
                          <Car className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-blue-700 animate-pulse">
                          Creating Booking...
                        </h3>
                        <div className="flex justify-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-100"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* First Row: Date, Room No, Passenger Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Date */}
                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label
                      htmlFor="date"
                      className="text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange("date")}
                      className="border-blue-300 focus:border-blue-500 cursor-pointer bg-white text-gray-900 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>

                {/* Room No */}
                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label
                      htmlFor="roomNo"
                      className="text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Room/Ref.No(Optional)
                    </Label>
                    <Input
                      id="roomNo"
                      value={formData.roomNo}
                      onChange={handleInputChange("roomNo")}
                      //placeholder="Enter room number"
                      className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      disabled={isFormLoading}
                    />
                  </div>
                </div>

                {/* Passenger Name */}
                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label
                      htmlFor="passengerName"
                      className="text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Guest Name *
                    </Label>
                    <Input
                      id="passengerName"
                      value={formData.passengerName}
                      onChange={handleInputChange("passengerName")}
                      //placeholder="Enter guest name"
                      className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Second Row: Guest Phone, Pickup Address, Destination */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Guest Phone */}
                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label
                      htmlFor="guestPhoneNo"
                      className="text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Guest Phone No (Optional)
                    </Label>
                    <Input
                      id="guestPhoneNo"
                      value={formData.guest_phoneno}
                      onChange={handleInputChange("guest_phoneno")}
                      //placeholder="Enter guest phone number"
                      className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      disabled={isFormLoading}
                    />
                  </div>
                </div>

                {/* Pickup Address */}
                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label
                      htmlFor="pickupAddress"
                      className="text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Pickup Address *
                    </Label>
                    <Input
                      id="pickupAddress"
                      value={formData.pickupAdress}
                      onChange={handleInputChange("pickupAdress")}
                      //placeholder="Enter pickup address"
                      className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label
                      htmlFor="destination"
                      className="text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Destination *
                    </Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={handleInputChange("destination")}
                      //placeholder="Enter destination"
                      className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Third Row: Time, Number of Passengers, Flight No */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Time */}
                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label
                      htmlFor="time"
                      className="text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Time *
                    </Label>
                    <Input
                      id="time"
                      type="text"
                      value={formData.time}
                      onChange={handleInputChange("time")}
                      //placeholder="Enter time (24hours)"
                      pattern="^([0]?[1-9]|1[0-2]):[0-5][0-9](\s?[AaPp][Mm])?$|^(?:[01]?[0-9]|2[0-3]):[0-5][0-9]$"
                      className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>

                {/* Flight No */}
                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label
                      htmlFor="flightNo"
                      className="text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Flight No (Optional)
                    </Label>
                    <Input
                      id="flightNo"
                      value={formData.flightNumber}
                      onChange={handleInputChange("flightNumber")}
                      //placeholder="Enter flight number"
                      className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      disabled={isFormLoading}
                    />
                  </div>
                </div>

                  {/* Number of Passengers */}
                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label
                      htmlFor="numberOfPassengers"
                      className="text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Number of Passengers *
                    </Label>
                    <Input
                      id="numberOfPassengers"
                      type="number"
                      min="1"
                      value={formData.numberOfPassengers}
                      onChange={handleInputChange("numberOfPassengers")}
                      //placeholder="Enter number of passengers"
                      className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
                
              </div>

              {/* Booking Type and Book By Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Booking Type */}
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-blue-200 ">
                  <div className="space-y-2">
                    <Label className="text-blue-700 font-medium text-sm sm:text-base">
                      Booking Type *
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="pickAndDrop"
                          checked={formData.bookingType.pickAndDrop}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bookingType: {
                                ...prev.bookingType,
                                pickAndDrop: e.target.checked,
                              },
                            }))
                          }
                          className="w-4 h-4 text-blue-600 border-blue-300"
                          disabled={isFormLoading}
                        />
                        <Label htmlFor="pickAndDrop" className="text-gray-700">
                          Pick & Drop
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="hourly"
                          checked={formData.bookingType.hourly}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bookingType: {
                                ...prev.bookingType,
                                hourly: e.target.checked,
                              },
                            }))
                          }
                          className="w-4 h-4 text-blue-600 border-blue-300"
                          disabled={isFormLoading}
                        />
                        <Label htmlFor="hourly" className="text-gray-700">
                          Hourly
                        </Label>
                      </div>
                      {/* Add Other Booking Type */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="otherBooking"
                            checked={formData.bookingType.other}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                bookingType: {
                                  ...prev.bookingType,
                                  other: e.target.checked,
                                },
                                otherBookingType: e.target.checked ? prev.otherBookingType : "",
                              }))
                            }
                            className="w-4 h-4 text-blue-600 border-blue-300"
                            disabled={isFormLoading}
                          />
                          <Label htmlFor="otherBooking" className="text-gray-700">
                            Other
                          </Label>
                        </div>
                        {formData.bookingType.other && (
                          <Input
                            type="text"
                            value={formData.otherBookingType}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                otherBookingType: e.target.value,
                              }))
                            }
                            //placeholder="Specify other booking type"
                            className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 text-sm sm:text-base mt-2"
                            disabled={isFormLoading}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book By */}
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <Label
                      htmlFor="bookBy"
                      className="text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Request By *
                    </Label>
                    <Input
                      id="bookBy"
                      value={formData.bookBy}
                      onChange={handleInputChange("bookBy")}
                      //placeholder="Enter No"
                      className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Type and Quantity (Checkboxes version) */}
              <div className="bg-white p-3 sm:p-4 rounded-lg ">
                <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {/* S-Class */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="vehicle-sclass"
                        checked={showSClass}
                        onChange={handleVehicleCheckbox("sClass")}
                        className="w-4 h-4 text-blue-600 border-blue-300"
                        disabled={isFormLoading}
                      />
                      <Label
                        htmlFor="vehicle-sclass"
                        className="text-blue-700 font-medium text-sm sm:text-base"
                      >
                        MERCEDES S-Class (SEDAN)
                      </Label>
                    </div>
                    {showSClass && (
                      <Input
                        id="sClass"
                        type="number"
                        min="0"
                        value={formData.sClass}
                        onChange={handleInputChange("sClass")}
                       // placeholder="Enter S-Class quantity"
                        className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 text-sm sm:text-base mt-2"
                        disabled={isFormLoading}
                      />
                    )}
                  </div>
                  {/* V-Class */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="vehicle-vclass"
                        checked={showVClass}
                        onChange={handleVehicleCheckbox("vClass")}
                        className="w-4 h-4 text-blue-600 border-blue-300"
                        disabled={isFormLoading}
                      />
                      <Label
                        htmlFor="vehicle-vclass"
                        className="text-blue-700 font-medium text-sm sm:text-base"
                      >
                       MERCEDES V-Class (7 SEATER)
                      </Label>
                    </div>
                    {showVClass && (
                      <Input
                        id="vClass"
                        type="number"
                        min="0"
                        value={formData.vClass}
                        onChange={handleInputChange("vClass")}
                        // placeholder="Enter V-Class quantity"
                        className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 text-sm sm:text-base mt-2"
                        disabled={isFormLoading}
                      />
                    )}
                  </div>
                  {/* Others */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="vehicle-others"
                        checked={showOthers}
                        onChange={handleVehicleCheckbox("others")}
                        className="w-4 h-4 text-blue-600 border-blue-300"
                        disabled={isFormLoading}
                      />
                      <Label
                        htmlFor="vehicle-others"
                        className="text-blue-700 font-medium text-sm sm:text-base"
                      >
                        Others
                      </Label>
                    </div>
                    {showOthers && (
                      <>
                        <Input
                          id="vehicleType"
                          type="text"
                          value={formData.others.vehicleType}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              others: {
                                ...prev.others,
                                vehicleType: e.target.value,
                              },
                            }))
                          }
                          // placeholder="Enter Other Vehicle Type"
                          className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 text-sm sm:text-base mt-2"
                          disabled={isFormLoading}
                        />
                        <Input
                          id="othersQuantity"
                          type="number"
                          min="0"
                          value={formData.others.quantity}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              others: {
                                ...prev.others,
                                quantity: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          // placeholder="Enter Other Vehicle Quantity"
                          className="border-blue-300 focus:border-blue-500 bg-white text-gray-900 text-sm sm:text-base mt-2"
                          disabled={isFormLoading}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Fare (Single field) */}
              {/* <div className="bg-violet-50 p-3 sm:p-4 rounded-lg border border-violet-200">
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
              </div> */}

              {/* Notes (Single field) */}
              <div className="bg-white p-3 sm:p-4 rounded-lg ">
                <div className="space-y-2">
                  <Label
                    htmlFor="notes"
                    className="text-gray-700 font-medium text-sm sm:text-base"
                  >
                    Note
                  </Label>
                  <Textarea
                    id="note"
                    value={formData.note}
                    onChange={handleInputChange("note")}
                    // placeholder="Enter any additional note"
                    className="border-blue-300 min-h-[80px] bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                    rows={3}
                    disabled={isFormLoading}
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4 sm:pt-6">
                <Button
                  type="submit"
                  disabled={isFormLoading}
                  className="bg-[#235fe7] hover:bg-[#235fe7] text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] sm:min-w-[200px] text-base sm:text-lg py-2 sm:py-3 transition-all duration-200"
                >
                  {isFormLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Booking"
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
  );
};

export default BookingsPage;
