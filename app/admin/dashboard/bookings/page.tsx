"use client";

// Ensure these imports are at the top
import { AdminHeader } from "@/components/admin/header";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  MapPin,
  User,
  Car,
  Clock,
  Phone,
  CreditCard,
  Users,
  Plane,
  Edit,
  Trash2,
  Download,
  Search,
  Plus,
} from "lucide-react";
import { BookingAPI, type Booking } from "@/public/api/booking";
import { UserAPI } from "@/public/api/user";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Booking>>({
    others: {
      vehicleType: "",
      quantity: 0,
    },
  });
  const [showSClass, setShowSClass] = useState(false);
  const [showVClass, setShowVClass] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const [showOtherBookingType, setShowOtherBookingType] = useState(false);
  const [otherBookingType, setOtherBookingType] = useState("");
  const [show, setShow] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedHotel, setSelectedHotel] = useState<string>("");
  const [hotels, setHotels] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await UserAPI.getAllUsers();
      if (response.success && response.data) {
        // Filter users with role "hotel"
        const hotelUsers = response.data.filter((user: any) => user.role === "hotel");
        setUsers(hotelUsers.map((user: any) => ({
          id: user.id,
          name: user.name
        })));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch bookings when hotel selection changes
  useEffect(() => {
    fetchBookings();
  }, [selectedHotel]);

  // Filter bookings when hotel selection changes
  useEffect(() => {
    if (bookings.length > 0) {
      let filtered = [...bookings];
      
      if (selectedHotel) {
        filtered = filtered.filter(booking => booking.hotelId === selectedHotel);
      }
      
      if (statusFilter !== "all") {
        filtered = filtered.filter(booking => booking.status === statusFilter);
      }

      setFilteredBookings(filtered);
    }
  }, [selectedHotel, statusFilter, bookings]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await BookingAPI.getAllBookings(selectedHotel || undefined);
      if (response.success && response.data) {
        const bookingsData = Array.isArray(response.data) ? response.data : [response.data];
        // Filter out any undefined values and ensure all entries are of type Booking
        const validBookings = bookingsData.filter((booking): booking is Booking => booking !== undefined);
        setBookings(validBookings);
        setFilteredBookings(validBookings);
      } else {
        setError(response.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("An error occurred while fetching bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filterBookings();
  }, [bookings, searchId, searchName, searchDate]); // Removed statusFilter

  const filterBookings = () => {
    let filtered = bookings;

    if (searchId) {
      filtered = filtered.filter((booking) =>
        booking.id?.toString().includes(searchId)
      );
    }

    if (searchName) {
      filtered = filtered.filter((booking) =>
        booking.passengerName.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchDate) {
      filtered = filtered.filter((booking) =>
        booking.date?.includes(searchDate)
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-50 text-gray-700 border-gray-200";

    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "inprogress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEdit = (booking: Booking) => {
    const types = booking.bookingType?.split(",") || [];
    const otherType = types.find(
      (t) => t !== "PICK&DROP" && t !== "HOURLY"
    );

    setEditingBooking(booking);
    setShowSClass(booking.sClass > 0);
    setShowVClass(booking.vClass > 0);
    setShowOthers(
      booking.others && (booking.others.quantity > 0 || booking.others.vehicleType !== "")
    );
    setShowOtherBookingType(!!otherType);
    setOtherBookingType(otherType || "");

    setEditFormData({
      ...booking,
      bookingType: JSON.stringify({
        pickAndDrop: types.includes("PICK&DROP"),
        hourly: types.includes("HOURLY"),
        other: otherType || "",
      }),
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingBooking?.id) return;

    setIsEditLoading(true);
    try {
      const url = `/bookings/${editingBooking.id}`;
      console.log('Updating booking at:', url);
      const { bookingType, type, quantity, ...rest } = editFormData;
      const types = [];
      const parsedBookingType = JSON.parse(bookingType || "{}");
      if (parsedBookingType?.pickAndDrop) types.push("PICK&DROP");
      if (parsedBookingType?.hourly) types.push("HOURLY");
      if (parsedBookingType?.other && showOtherBookingType)
        types.push(parsedBookingType.other);

      const bookingData = {
        ...rest,
        bookingType: types.join(","),
        sClass: Number(editFormData.sClass) || 0,
        vClass: Number(editFormData.vClass) || 0,
        others: showOthers ? editFormData.others : { vehicleType: "", quantity: 0 },
      };

      const response = await BookingAPI.updateBooking(editingBooking.id, bookingData);
      if (response.success) {
        await fetchBookings();
        setIsEditModalOpen(false);
        setEditingBooking(null);
        setEditFormData({});
      } else {
        setError(response.message || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      setError("An error occurred while updating the booking");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await BookingAPI.deleteBooking(id);
      if (response.success) {
        await fetchBookings(); // Refresh the list
      } else {
        setError(response.message || "Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      setError("An error occurred while deleting the booking");
    }
  };

  const downloadCSV = () => {
    // Define CSV headers
    const headers = [
      "ID",
      "Passenger Name",
      "Phone Number",
      "Pickup Address",
      "Destination",
      "Date",
      "Time",
      "Room No",
      "Flight No",
      "Booking Type",
      "Vehicle Type",
      "Vehicle Quantity",
      "Vehicle No",
      "Base Fare",
      "Extra Charge",
      "Total Fare",
      "Driver Name",
      "Driver Number",
      "Status",
      "Book By",
      "Notes",
      "Created At",
      "S-Class",
      "V-Class",
      "Others",
    ];

    // Convert bookings data to CSV format (each booking as a row)
    const csvData = filteredBookings.map((booking) => [
      booking.id || "",
      booking.passengerName || "",
      booking.guest_phoneno || "",
      booking.pickupAdress || "",
      booking.destination || "",
      booking.date ? new Date(booking.date).toLocaleDateString() : "",
      booking.time || "",
      booking.roomNo || "",
      booking.flightNumber || "",
      booking.bookingType || "",
      booking.type || "",
      booking.quantity || "",
      booking.noOfVehicle || "",
      booking.fare || "",
      booking.extraCharge || "",
      (Number(booking.fare) || 0) + (Number(booking.extraCharge) || 0),
      booking.driverName || "",
      booking.driverNumber || "",
      booking.status || "",
      booking.bookBy || "",
      booking.note || "",
      booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "",
      booking.sClass || "",
      booking.vClass || "",
      booking.others || "",
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bookings_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSingleBookingCSV = (booking: Booking) => {
    // Define CSV headers
    const headers = [
      "ID",
      "Passenger Name",
      "Phone Number",
      "Pickup Address",
      "Destination",
      "Date",
      "Time",
      "Room No",
      "Flight No",
      "Booking Type",
      "Vehicle Type",
      "Vehicle Quantity",
      "Vehicle No",
      "Base Fare",
      "Extra Charge",
      "Total Fare",
      "Driver Name",
      "Driver Number",
      "Vehicle No",
      "Status",
      "Book By",
      "Notes",
      "Created At",
      "S-Class",
      "V-Class",
      "Others",
    ];

    // Convert single booking data to CSV format
    const csvData = [
      booking.id || "",
      booking.passengerName || "",
      booking.guest_phoneno || "",
      booking.pickupAdress || "",
      booking.destination || "",
      booking.date ? new Date(booking.date).toLocaleDateString() : "",
      booking.time || "",
      booking.roomNo || "",
      booking.flightNumber || "",
      booking.bookingType || "",
      booking.type || "",
      booking.quantity || "",
      booking.noOfVehicle || "",
      booking.fare || "",
      booking.extraCharge || "",
      (Number(booking.fare) || 0) + (Number(booking.extraCharge) || 0),
      booking.driverName || "",
      booking.driverNumber || "",
      booking.status || "",
      booking.bookBy || "",
      booking.note || "",
      booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "",
      booking.sClass || "",
      booking.vClass || "",
      booking.others || "",
    ];

    // Combine headers and data
    const csvContent = [headers, csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `booking_${booking.id}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="px-2 sm:px-4 md:px-6 pb-6">
          <AdminHeader
            title="Bookings Management"
            description="Manage all booking requests and their details"
          />

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
                <h3 className="text-lg font-semibold text-gray-700 animate-pulse">
                  Loading Bookings...
                </h3>
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
  }

  return (
    <div className="w-full mt-24">
      <div className="px-2 sm:px-4 md:px-6 pb-6">
        <AdminHeader
          title="Bookings Management"
          description="Manage all booking requests and their details"
        />

        {/* {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )} */}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredBookings.length}
                  </p>
                </div>
                <Car className="w-8 h-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <div className="sm:col-span-2">
            <Card className="bg-white border-gray-200 shadow-sm h-full">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Label className="text-sm text-gray-600 font-medium">
                    Filter by Hotel:
                  </Label>
                  <Select
                    value={selectedHotel}
                    onValueChange={(value) => setSelectedHotel(value)}
                    className="w-[180px] bg-white"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
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
                <div className="w-full sm:w-48">
                  <Input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="bg-white text-black border-gray-300 text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchId("");
                    setSearchName("");
                    setSearchDate("");
                  }}
                  className="w-[160px] h-[48px] font-medium"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={downloadCSV}
                  className="w-[160px] h-[48px] bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Table */}
        <Card className="bg-white shadow-lg border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[900px] md:min-w-full">
                <TableHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 top-0 z-20">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700 py-4 w-[6%]">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[10%]">
                      Date & Time
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[6%]">
                      Room No
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[10%]">
                      Guest Info
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[10%]">
                      Pickup
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[10%]">
                      Destination
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[10%]">
                      Driver
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[12%]">
                      Note
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[6%]">
                      Booked By
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[6%]">
                      Base Fare
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[6%]">
                      Extra
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[6%]">
                      Total
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                      <TableRow
                        key={booking.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-25"
                        }`}
                      >
                        {/* ID */}
                        <TableCell className="py-4 text-center text-black">
                          <div className="flex flex-col items-center space-y-1">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                              <Car className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">
                              #{booking.id}
                            </span>
                          </div>
                        </TableCell>

                        {/* Date & Time */}
                        <TableCell className="py-4 text-black">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {formatDate(booking.date)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.time}
                            </div>
                          </div>
                        </TableCell>

                        {/* Room No */}
                        <TableCell className="py-4 text-center text-black">
                          {booking.roomNo || 'N/A'}
                        </TableCell>

                        {/* Guest Info */}
                        <TableCell className="py-4 text-black">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {booking.passengerName || 'N/A'}
                            </div>
                            {booking.guest_phoneno && (
                              <div className="text-xs text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {booking.guest_phoneno}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Pickup Address */}
                        <TableCell className="py-4 text-black">
                          <div className="text-sm break-words">
                            {booking.pickupAdress}
                          </div>
                        </TableCell>

                        {/* Destination */}
                        <TableCell className="py-4 text-black">
                          <div className="text-sm break-words">
                            {booking.destination}
                          </div>
                        </TableCell>

                        {/* Driver */}
                        <TableCell className="py-4 text-black">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {booking.driverName || 'Not Assigned'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.driverNumber || 'No Contact'}
                            </div>
                          </div>
                        </TableCell>

                        {/* Note */}
                        <TableCell className="py-4 text-black">
                          <div className="text-sm break-words max-h-20 min-w-28">
                            {booking.note || 'No notes'}
                          </div>
                        </TableCell>

                        {/* Booked By */}
                        <TableCell className="py-4 text-black">
                          <div className="text-sm">
                            {booking.bookBy || 'N/A'}
                          </div>
                        </TableCell>

                        {/* Fare */}
                        <TableCell className="py-4 text-black">
                          <div className="text-sm font-semibold">
                            ${booking.fare || '0'}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-black">
                          <div className="text-sm font-semibold text-orange-600">
                            ${Number(booking.extraCharge) || '0'}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-black">
                          <div className="text-sm font-semibold text-green-600">
                            ${(Number(booking.fare) || 0) + (Number(booking.extraCharge) || 0)}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-4 text-center">
                          <Badge
                            className={`${getStatusColor(
                              booking.status
                            )} font-medium text-xs px-2 py-1`}
                          >
                            {booking.status || "Pending"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-4">
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
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete booking #{booking.id}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      booking.id && handleDelete(booking.id)
                                    }
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
                              {searchId || searchName
                                ? "No matching bookings found"
                                : "No bookings found"}
                            </h3>
                            <p className="text-gray-500">
                              {searchId || searchName
                                ? "Try adjusting your search filters."
                                : "Bookings will appear here once they are created."}
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
          <DialogContent className="max-w-full md:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-2 md:p-8">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600">
                  Edit Booking #{editingBooking?.id}
                </span>
              </DialogTitle>
              <DialogDescription>
                Update booking details. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Editable fields */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-passenger"
                  className="text-gray-800 font-bold"
                >
                  Passenger Name *
                </Label>
                <Input
                  id="edit-passenger"
                  value={editFormData.passengerName || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      passengerName: e.target.value,
                    })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-gray-800 font-bold">
                  Phone Number
                </Label>
                <Input
                  id="edit-phone"
                  value={editFormData.guest_phoneno || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      guest_phoneno: e.target.value,
                    })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-pickup"
                  className="text-gray-800 font-bold"
                >
                  Pickup Address *
                </Label>
                <Input
                  id="edit-pickup"
                  value={editFormData.pickupAdress || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      pickupAdress: e.target.value,
                    })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-destination"
                  className="text-gray-800 font-bold"
                >
                  Destination *
                </Label>
                <Input
                  id="edit-destination"
                  value={editFormData.destination || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      destination: e.target.value,
                    })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-flight"
                  className="text-gray-800 font-bold"
                >
                  Flight Number
                </Label>
                <Input
                  id="edit-flight"
                  value={editFormData.flightNumber || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      flightNumber: e.target.value,
                    })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-date" className="text-gray-800 font-bold">
                  Date *
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editFormData.date || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, date: e.target.value })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-room" className="text-gray-800 font-bold">
                  Room Number
                </Label>
                <Input
                  id="edit-room"
                  value={editFormData.roomNo || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, roomNo: e.target.value })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-time" className="text-gray-800 font-bold">
                  Time *
                </Label>
                <Input
                  id="edit-time"
                  value={editFormData.time || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, time: e.target.value })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>

              {/* Fare Calculation Section */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-fare"
                      className="text-gray-800 font-bold"
                    >
                      Base Fare *
                    </Label>
                    <Input
                      id="edit-fare"
                      type="number"
                      value={editFormData.fare || ""}
                      onChange={(e) => {
                        const newFare = e.target.value;
                        const totalFare =
                          (Number(newFare) || 0) +
                          (Number(editFormData.extraCharge) || 0);
                        setEditFormData({
                          ...editFormData,
                          fare: newFare,
                          totalFare: totalFare,
                        });
                      }}
                      className="bg-white text-black border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-extra"
                      className="text-gray-800 font-bold"
                    >
                      Extra Charge
                    </Label>
                    <Input
                      id="edit-extra"
                      type="number"
                      value={editFormData.extraCharge || ""}
                      onChange={(e) => {
                        const newExtraCharge = e.target.value;
                        const totalFare =
                          (Number(editFormData.fare) || 0) +
                          (Number(newExtraCharge) || 0);
                        setEditFormData({
                          ...editFormData,
                          extraCharge: Number(newExtraCharge) || 0,
                          totalFare: totalFare,
                        });
                      }}
                      className="bg-white text-black border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-total-fare"
                      className="text-gray-800 font-bold"
                    >
                      Total Fare
                    </Label>
                    <Input
                      id="edit-total-fare"
                      type="number"
                      value={editFormData.totalFare || 0}
                      readOnly
                      className="bg-gray-100 text-black cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">
                      Auto-calculated (Base + Extra)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-driver-name"
                  className="text-gray-800 font-bold"
                >
                  Driver Name
                </Label>
                <Input
                  id="edit-driver-name"
                  value={editFormData.driverName || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      driverName: e.target.value,
                    })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-driver-number"
                  className="text-gray-800 font-bold"
                >
                  Driver Number
                </Label>
                <Input
                  id="edit-driver-number"
                  value={editFormData.driverNumber || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      driverNumber: e.target.value,
                    })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-noofvehicle"
                  className="text-gray-800 font-bold"
                >
                  Vehicle No
                </Label>
                <Input
                  id="edit-noofvehicle"
                  type="text"
                  value={editFormData.noOfVehicle || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      noOfVehicle: e.target.value,
                    })
                  }
                  className="bg-white text-black border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-status"
                  className="text-gray-800 font-bold"
                >
                  Status
                </Label>
                <Select
                  value={editFormData.status || ""}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, status: value })
                  }
                >
                  <SelectTrigger className="bg-white text-black border-gray-300">
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
                <Label className="text-gray-800 font-bold">
                  Booking Type *
                </Label>
                <div className="space-y-2 bg-white p-3 rounded-md border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-pickAndDrop"
                      checked={
                        JSON.parse(editFormData.bookingType || "{}")
                          ?.pickAndDrop || false
                      }
                      onChange={(e) => {
                        const current = JSON.parse(
                          editFormData.bookingType || "{}"
                        );
                        const updated = {
                          ...current,
                          pickAndDrop: e.target.checked,
                        };

                        setEditFormData((prev) => ({
                          ...prev,
                          bookingType: JSON.stringify(updated),
                        }));
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                    />
                    <Label htmlFor="edit-pickAndDrop" className="text-gray-700">
                      Pick & Drop
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-hourly"
                      checked={
                        JSON.parse(editFormData.bookingType || "{}")?.hourly ||
                        false
                      }
                      onChange={(e) => {
                        const current = JSON.parse(
                          editFormData.bookingType || "{}"
                        );
                        const updated = {
                          ...current,
                          hourly: e.target.checked,
                        };

                        setEditFormData((prev) => ({
                          ...prev,
                          bookingType: JSON.stringify(updated),
                        }));
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                    />
                    <Label htmlFor="edit-hourly" className="text-gray-700">
                      Hourly
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-other-type"
                      checked={showOtherBookingType}
                      onChange={(e) => {
                        setShowOtherBookingType(e.target.checked);
                        if (!e.target.checked) {
                          setOtherBookingType("");
                          const current = JSON.parse(
                            editFormData.bookingType || "{}"
                          );
                          delete current.other;
                          setEditFormData((prev) => ({
                            ...prev,
                            bookingType: JSON.stringify(current),
                          }));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                    />
                    <Label htmlFor="edit-other-type" className="text-gray-700">
                      Other
                    </Label>
                  </div>

                  {showOtherBookingType && (
                    <div className="mt-2 pl-6">
                      <Input
                        type="text"
                        placeholder="Enter other booking type"
                        value={otherBookingType}
                        onChange={(e) => {
                          setOtherBookingType(e.target.value);
                          const current = JSON.parse(
                            editFormData.bookingType || "{}"
                          );
                          const updated = {
                            ...current,
                            other: e.target.value,
                          }; // Added missing closing curly brace here
                          setEditFormData((prev) => ({
                            ...prev,
                            bookingType: JSON.stringify(updated),
                          }));
                        }}
                        className="bg-white text-black w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-sclass-checkbox"
                        checked={showSClass}
                        onChange={(e) => {
                          setShowSClass(e.target.checked);
                          if (!e.target.checked) {
                            setEditFormData({
                              ...editFormData,
                              sClass: 0,
                            });
                          }
                        }}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                      />
                      <Label
                        htmlFor="edit-sclass-checkbox"
                        className="text-gray-800 font-bold"
                      >
                        Mercedes S-Class(Sadan)
                      </Label>
                    </div>
                    {showSClass && (
                      <Input
                        id="edit-sclass"
                        type="number"
                        min="0"
                        value={editFormData.sClass || 0}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            sClass: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-white text-black mt-2"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-vclass-checkbox"
                        checked={showVClass}
                        onChange={(e) => {
                          setShowVClass(e.target.checked);
                          if (!e.target.checked) {
                            setEditFormData({
                              ...editFormData,
                              vClass: 0,
                            });
                          }
                        }}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                      />
                      <Label
                        htmlFor="edit-vclass-checkbox"
                        className="text-gray-800 font-bold"
                      >
                        Mercedes V-Class(7 seater)
                      </Label>
                    </div>
                    {showVClass && (
                      <Input
                        id="edit-vclass"
                        type="number"
                        min="0"
                        value={editFormData.vClass || 0}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            vClass: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-white text-black mt-2"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-others-checkbox"
                        checked={showOthers}
                        onChange={(e) => {
                          setShowOthers(e.target.checked);
                          if (!e.target.checked) {
                            setEditFormData((prev) => ({
                              ...prev,
                              others: {
                                vehicleType: "",
                                quantity: 0,
                              },
                            }));
                          }
                        }}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                      />
                      <Label
                        htmlFor="edit-others-checkbox"
                        className="text-gray-800 font-bold"
                      >
                        Others
                      </Label>
                    </div>
                    {showOthers && (
                      <>
                        <Input
                          id="edit-others-type"
                          type="text"
                          value={editFormData.others?.vehicleType || ""}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              others: {
                                ...prev.others!,
                                vehicleType: e.target.value,
                              },
                            }))
                          }
                          className="bg-white text-black mt-2"
                          placeholder="Enter vehicle type"
                        />
                        <Input
                          id="edit-others-quantity"
                          type="number"
                          min="0"
                          value={editFormData.others?.quantity || 0}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              others: {
                                ...prev.others!,
                                quantity: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className="bg-white text-black mt-2"
                          placeholder="Enter quantity"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-note" className="text-gray-800 font-bold">
                  Notes
                </Label>
                <Textarea
                  id="edit-note"
                  value={editFormData.note || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, note: e.target.value })
                  }
                  className="bg-white text-black border-gray-300"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
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
                  "Update Booking"
                )}
              </Button>
              {editingBooking &&
                (editingBooking.status === "completed" ||
                  editingBooking.status === "cancelled") && (
                  <Button
                    onClick={() => {
                      // Create a new booking with same details but reset status and dates
                      const rebookData = {
                        ...editingBooking,
                        id: undefined,
                        status: "pending",
                        date: new Date().toISOString().split("T")[0],
                        createdAt: undefined,
                        updatedAt: undefined,
                      };
                      BookingAPI.createBooking(rebookData).then((response) => {
                        if (response.success) {
                          fetchBookings();
                          setIsEditModalOpen(false);
                          setEditingBooking(null);
                          setEditFormData({});
                        }
                      });
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
      {/* Responsive utility styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          td,
          th {
            white-space: normal !important;
            font-size: 12px !important;
            padding-left: 6px !important;
            padding-right: 6px !important;
          }
          .min-w-[900px] {
            min-width: 100vw !important;
          }
        }
        @media (max-width: 768px) {
          .max-w-4xl {
            max-width: 98vw !important;
          }
          .p-8 {
            padding: 0.5rem !important;
          }
        }
      `}</style>
      <style jsx global>{`
        .break-words {
          word-break: break-word;
          white-space: normal;
        }
        
        @media (max-width: 1024px) {
          .table-container {
            overflow-x: auto;
          }
          
          table {
            min-width: 1000px;
          }
        }

        input, textarea, select {
          color: black !important;
        }
        .text-black {
          color: black !important;
        }
      `}</style>
    </div>
  );
}


