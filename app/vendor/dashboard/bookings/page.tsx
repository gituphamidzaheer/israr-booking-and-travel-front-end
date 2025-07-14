"use client";

import { VendorHeader } from "@/components/vendor/header";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Calendar,
  MapPin,
  User,
  Car,
  Clock,
  Phone,
  CreditCard,
  Users,
  Plane,
  Eye,
  Search,
  Download,
  Edit,
  Trash2,
} from "lucide-react";
import { BookingAPI, type Booking } from "@/public/api/booking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Extend the Booking type to include the isUpdated flag
interface ExtendedBooking extends Booking {
  isUpdated?: boolean;
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<ExtendedBooking[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchBookedBy, setSearchBookedBy] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchMonth, setSearchMonth] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingBooking, setEditingBooking] = useState<ExtendedBooking | null>(
    null
  );
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
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [searchfrom, setSearchfrom] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Track recently updated bookings with a timeout to clear the highlight
  const updateHighlight = (bookingId: number) => {
    const updatedBooking = bookings.find((b) => b.id === bookingId);
    if (updatedBooking) {
      updatedBooking.isUpdated = true;
      setTimeout(() => {
        updatedBooking.isUpdated = false;
        setBookings([...bookings]);
        setFilteredBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, isUpdated: false }
              : booking
          )
        );
      }); // Clear highlight after 5 seconds
    }
  };

  const handleExtraChargeClick = () => {
    setShowReasonInput(true);
  };

  const handleEdit = (booking: Booking) => {
    const types = booking.bookingType?.split(",") || [];
    const otherType = types.find((t) => t !== "PICK&DROP" && t !== "HOURLY");

    setEditingBooking(booking);
    setShowSClass(booking.sClass > 0);
    setShowVClass(booking.vClass > 0);
    setShowOthers(
      booking.others &&
        (booking.others.quantity > 0 || booking.others.vehicleType !== "")
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
        others: showOthers
          ? editFormData.others
          : { vehicleType: "", quantity: 0 },
      };

      const response = await BookingAPI.updateHotelBooking(
        editingBooking.id,
        bookingData
      );

      if (response.success) {
        // Fetch fresh data from server
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

  const cancelBooking = async (bookingId: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${BookingAPI.getBaseUrl()}/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "cancelled",
          }),
        }
      );

      if (response.ok) {
        // Update the local state to reflect the cancelled status
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );
        setFilteredBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        setError("Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setError("Error cancelling booking");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [
    bookings,
    searchId,
    searchName,
    searchDate,
    searchBookedBy,
    fromDate,
    toDate,
    searchMonth,
    searchYear,
  ]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const hotelId = localStorage.getItem("user_id");
      if (!hotelId) {
        setError("Hotel ID not found");
        return;
      }
      const response = await fetch(
        `${BookingAPI.getBaseUrl()}/bookings/hotel/${hotelId}`
      );
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setBookings(data);
      } else {
        setError(data.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("An error occurred while fetching bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookingById = async (id: number) => {
    try {
      const hotelId = localStorage.getItem("id");
      if (!hotelId) {
        setError("Hotel ID not found");
        return;
      }

      const response = await fetch(
        `${BookingAPI.getBaseUrl()}/hotel/${hotelId}/${id}`
      );
      const data = await response.json();

      if (response.ok) {
        const bookingData = Array.isArray(data) ? data[0] : data;
        if (bookingData) {
          setBookings((prevBookings) =>
            prevBookings.map((booking) =>
              booking.id === id ? bookingData : booking
            )
          );
        }
      } else {
        setError(data.message || "Failed to fetch booking details");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      setError("An error occurred while fetching the booking details");
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings]; // Create a new array to avoid mutating the original

    // Filter by ID
    if (searchId.trim()) {
      const searchIdNum = parseInt(searchId);
      filtered = filtered.filter((booking) =>
        booking.id?.toString().includes(searchId.trim())
      );
      // Only fetch by ID if it's a valid number and exists
      if (!isNaN(searchIdNum)) {
        fetchBookingById(searchIdNum);
      }
    }

    // Filter by Name
    if (searchName.trim()) {
      filtered = filtered.filter((booking) =>
        booking.passengerName
          ?.toLowerCase()
          .includes(searchName.trim().toLowerCase())
      );
    }

    // Filter by Date
    if (searchDate) {
      filtered = filtered.filter((booking) => {
        if (!booking.date) return false;
        const formattedBookingDate = new Date(booking.date)
          .toISOString()
          .split("T")[0];
        return formattedBookingDate === searchDate;
      });
    }

    // Filter by Month
    if (searchMonth) {
      filtered = filtered.filter((booking) => {
        if (!booking.date) return false;
        const bookingDate = new Date(booking.date);
        const bookingMonth = String(bookingDate.getMonth() + 1).padStart(
          2,
          "0"
        );
        return bookingMonth === searchMonth;
      });
    }

    // Filter by Year
    if (searchYear.trim()) {
      filtered = filtered.filter((booking) => {
        if (!booking.date) return false;
        const bookingDate = new Date(booking.date);
        const bookingYear = bookingDate.getFullYear().toString();
        return bookingYear === searchYear.trim();
      });
    }

    // Modified date range filtering - handle specific dates
    if (fromDate || toDate) {
      filtered = filtered.filter((booking) => {
        if (!booking.date) return false;

        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);

        if (fromDate && !toDate) {
          // If only fromDate is selected, show only that specific date
          const fromDateObj = new Date(fromDate);
          fromDateObj.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === fromDateObj.getTime();
        }

        if (!fromDate && toDate) {
          // If only toDate is selected, show only that specific date
          const toDateObj = new Date(toDate);
          toDateObj.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === toDateObj.getTime();
        }

        // If both dates are selected, show date range
        if (fromDate && toDate) {
          const fromDateObj = new Date(fromDate);
          const toDateObj = new Date(toDate);
          fromDateObj.setHours(0, 0, 0, 0);
          toDateObj.setHours(0, 0, 0, 0);
          return bookingDate >= fromDateObj && bookingDate <= toDateObj;
        }

        return true;
      });
    }

    // Filter by Booked By
    if (searchBookedBy?.trim()) {
      filtered = filtered.filter((booking) =>
        booking.bookBy
          ?.toLowerCase()
          .includes(searchBookedBy.trim().toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-blue-50 text-gray-700 border-gray-200";

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
        return "bg-blue-50 text-gray-700 border-gray-200";
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

  const deleteBooking = async (bookingId: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${BookingAPI.getBaseUrl()}/bookings/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setBookings((prev) =>
          prev.filter((booking) => booking.id !== bookingId)
        );
        setFilteredBookings((prev) =>
          prev.filter((booking) => booking.id !== bookingId)
        );
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        setError("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      setError("Error deleting booking");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadCSV = () => {
    const headers = [
      "ID",
      "Passenger Name",
      "Date",
      "Room No",
      "Time",
      "Pickup Address",
      "Destination",
      "Booking Type",
      "Flight No",
      "S-Class",
      "V-Class",
      "Others",
      "Notes",
      "Driver Name",
      "Driver Number",
      "Base Fare",
      "Extra Charge",
      "Comment",
      "Total Fare",
      "Status",
      "Request By",
      "Created At",

      // "Vehicle",
      // "Vehicle Quantity",
      // "Vehicle No",
      // "Request By",
    ];
    const csvData = filteredBookings.map((b) => [
      b.id,
      b.passengerName,
      `${b.date}`,
      b.roomNo,
      b.time,
      b.pickupAdress,
      b.destination,
      b.bookingType || "",
      b.flightNumber,
      b.sClass || "",
      b.vClass || "",
      b.others?.vehicleType || "",
      b.note || "",
      b.driverName || "",
      b.driverNumber,
      b.fare,
      b.extraCharge,
      b.comment || "",
      b.totalFare,
      b.status || "",
      b.bookBy,
      b.createdAt,

      // b.flightNumber,
      // b.guest_phoneno || "",
      // `${b.driverName || ""} ${b.driverNumber ? `(${b.driverNumber})` : ""}`,
      // b.note || "",
      // b.bookBy,
      // b.fare,
      // b.extraCharge,
      // (Number(b.fare) || 0) + (Number(b.extraCharge) || 0),
      // b.status,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bookings_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const downloadSingleBookingCSV = (booking: Booking) => {
    const headers = [
      "ID",
      "Passenger Name",
      "Date",
      "Room No",
      "Time",
      "Pickup Address",
      "Destination",
      "Booking Type",
      "Flight No",
      "S-Class",
      "V-Class",
      "Others",
      "Notes",
      "Driver Name",
      "Driver Number",
      "Base Fare",
      "Extra Charge",
      "Comment",
      "Total Fare",
      "Status",
      "Request By",
      "Created At",

      // "Vehicle",
      // "Vehicle Quantity",
      // "Vehicle No",
      // "Request By",
    ];
    const csvData = [
      [
        booking.id || "",
        booking.passengerName || "",
        booking.date ? new Date(booking.date).toLocaleDateString() : "",
        booking.roomNo || "",
        booking.time || "",
        booking.pickupAdress || "",
        booking.destination || "",
        booking.bookingType || "",
        booking.flightNumber,
        booking.sClass || "",
        booking.vClass || "",
        booking.others?.vehicleType || "",
        booking.note || "",
        booking.driverName || "",
        booking.driverNumber,
        booking.fare,
        booking.extraCharge,
        booking.comment || "",
        booking.totalFare,
        booking.status || "",
        booking.bookBy,
        booking.createdAt,
      ],
    ];

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `booking_${booking.id}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full">
        <div className="p-2 sm:p-4 lg:p-6">
          <VendorHeader title="My Bookings" />

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
                <h3 className="text-lg font-semibold text-gray-700 animate-pulse">
                  Loading Bookings...
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
    <div className="min-h-screen bg-gray-50 w-full mt-12">
      <div className="p-2 sm:p-4 lg:p-6">
        <VendorHeader title="My Bookings" />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-blue-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-lg font-semibold">
                    Total Bookings
                  </div>
                  <div className="text-2xl font-bold text-gray-700 mt-2">
                    {filteredBookings.length}
                  </div>
                </div>
                <Car className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="text-yellow-600 text-lg font-semibold">
                Pending Bookings
              </div>
              <div className="text-2xl font-bold text-yellow-700 mt-2">
                {
                  filteredBookings.filter(
                    (b) => b.status?.toLowerCase() === "pending"
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          {/* Add In Progress Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-blue-600 text-lg font-semibold">
                In Progress
              </div>
              <div className="text-2xl font-bold text-blue-700 mt-2">
                {
                  filteredBookings.filter(
                    (b) => b.status?.toLowerCase() === "inprogress"
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-green-600 text-lg font-semibold">
                Completed Bookings
              </div>
              <div className="text-2xl font-bold text-green-700 mt-2">
                {
                  filteredBookings.filter(
                    (b) => b.status?.toLowerCase() === "completed"
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="text-red-600 text-lg font-semibold">
                Cancelled Bookings
              </div>
              <div className="text-2xl font-bold text-red-700 mt-2">
                {
                  filteredBookings.filter(
                    (b) => b.status?.toLowerCase() === "cancelled"
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          {/* <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-blue-600 text-lg font-semibold">
                Total Revenue
              </div>
              <div className="text-2xl font-bold text-blue-700 mt-2 flex items-center gap-1">
                 <img
                  src="https://upload.wikimedia.org/wikipedia/commons/e/ee/UAE_Dirham_Symbol.svg"
                  alt="AED"
                  className="w-5 h-5"
                />
                {filteredBookings
                  .reduce(
                    (total, b) =>
                      total +
                      (Number(b.fare) || 0) +
                      (Number(b.extraCharge) || 0),
                    0
                  )
                  .toFixed(2)}
               
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Search Filters */}
        <Card className="bg-white shadow-sm  border-gray-200 mb-6">
          <CardContent className="p-4 w-[800px] ">
            <div className="flex gap-4 md:gap-4 ">
              <Input
                placeholder="Search by ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="bg-white w-[160px]  text-black border-gray-300"
              />
              <Input
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="bg-white w-[160px] text-black border-gray-300"
              />
              {/* <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="bg-white w-[160px] text-black border-gray-300"
              /> */}

              <div className="flex items-center gap-1">
                <Label
                  htmlFor="fromDate"
                  className="whitespace-nowrap text-black text-sm"
                >
                  From:
                </Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-white w-[160px] text-black border-gray-300"
                />
              </div>

              {/* Date Range Filter - To */}
              <div className="flex items-center gap-1">
                <Label
                  htmlFor="toDate"
                  className="whitespace-nowrap text-black text-sm"
                >
                  To:
                </Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-white w-[160px] text-black border-gray-300"
                />
              </div>
              <select
                value={searchMonth || "all"}
                onChange={(e) =>
                  setSearchMonth(e.target.value === "all" ? "" : e.target.value)
                }
                className="bg-white text-black w-[250px] border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>

              <Input
                placeholder="Search by year..."
                value={searchYear}
                onChange={(e) => setSearchYear(e.target.value)}
                className="bg-white w-[160px] text-black border-gray-300"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setSearchId("");
                  setSearchName("");
                  setSearchDate("");
                  setSearchBookedBy("");
                  setSearchMonth("");
                  setSearchYear("");
                  setFromDate("");
                  setToDate("");
                }}
                className="flex-1 w-[160px] bg-blue-600"
              >
                Clear
              </Button>
              <Button
                onClick={downloadCSV}
                className="flex-1 bg-blue-600 w-[160px] text-white hover:bg-blue-700"
              >
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-lg border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="">
                <TableRow className="bg-blue-600 border-2 border-black text-white hover:bg-blue-600">
                  <TableHead className="w-20 text-white hover:bg-blue-600">
                    ID
                  </TableHead>
                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    Guest Name
                  </TableHead>
                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    Guest Phone Number
                  </TableHead>
                  <TableHead className="w-32 text-white hover:bg-blue-600">
                    Date
                  </TableHead>
                  <TableHead className="w-24 text-white hover:bg-blue-600">
                    Room No
                  </TableHead>
                  <TableHead className="w-32 text-white hover:bg-blue-600">
                    Time
                  </TableHead>
                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    Pickup Address
                  </TableHead>
                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    Destination
                  </TableHead>
                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    Booking Type
                  </TableHead>

                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    Flight No
                  </TableHead>

                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    Vehicle Type
                  </TableHead>
                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    No of Passengers
                  </TableHead>
                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    Note
                  </TableHead>

                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    Driver Name
                  </TableHead>

                  <TableHead className="w-40 text-white hover:bg-blue-600">
                    Driver Number
                  </TableHead>

                  <TableHead className="w-24 text-white hover:bg-blue-600">
                    Fare
                  </TableHead>
                  <TableHead className="w-24 text-white hover:bg-blue-600">
                    Extra
                  </TableHead>
                  <TableHead className="w-24 text-white hover:bg-blue-600">
                    Comment
                  </TableHead>
                  <TableHead className="w-24 text-white hover:bg-blue-600">
                    Total
                  </TableHead>
                  <TableHead className="w-28 text-white hover:bg-blue-600">
                    Status
                  </TableHead>
                  <TableHead className="w-32 text-white hover:bg-blue-600">
                    Request By
                  </TableHead>
                  <TableHead className="w-32 text-white hover:bg-blue-600">
                    Created At
                  </TableHead>
                  <TableHead className="w-32 text-white hover:bg-blue-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white text-black hover:bg-blue-50 ">
                {filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className={`border-2 border-black ${
                      booking.status === "cancelled"
                        ? "bg-red-200"
                        : booking.isUpdated === true
                        ? "bg-green-200"
                        : ""
                    }`}
                  >
                    <TableCell className="font-medium">#{booking.id}</TableCell>
                    <TableCell className="py-4 text-black">
                      <div className="text-sm max-h-20 min-w-28 w-full overflow-auto rounded p-2">
                        <div className="whitespace-pre-wrap break-words">
                          {booking.passengerName || ""}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">
                      {booking.guest_phoneno}
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      {formatDate(booking.date)}
                    </TableCell>
                    <TableCell>{booking.roomNo}</TableCell>
                    <TableCell className="whitespace-normal">
                      {booking.time || "N/A"}
                    </TableCell>
                    <TableCell className="py-4 text-black">
                      <div className="text-sm max-h-20 min-w-28 w-full overflow-auto rounded p-2">
                        <div className="whitespace-pre-wrap break-words">
                          {booking.pickupAdress || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-black">
                      <div className="text-sm max-h-20 min-w-28 w-full overflow-auto rounded p-2">
                        <div className="whitespace-pre-wrap break-words">
                          {booking.destination || "N/A"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-black">
                      <div className="text-sm max-h-20 min-w-28 w-full overflow-auto rounded p-2">
                        <div className="whitespace-pre-wrap break-words">
                          {booking.bookingType || "N/A"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      {booking.flightNumber || "N/A"}
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      <div className="space-y-1">
                        {booking.sClass > 0 && (
                          <div className="text-sm font-medium">
                            S-Class{" "}
                            <span className="text-xs text-gray-500">
                              Qty: {booking.sClass}
                            </span>
                          </div>
                        )}
                        {booking.vClass > 0 && (
                          <div className="text-sm font-medium">
                            V-Class{" "}
                            <span className="text-xs text-gray-500">
                              Qty: {booking.vClass}
                            </span>
                          </div>
                        )}
                        {booking.others && booking.others.vehicleType && (
                          <div className="text-sm font-medium">
                            {booking.others.vehicleType}{" "}
                            <span className="text-xs text-gray-500">
                              Qty: {booking.others.quantity}
                            </span>
                          </div>
                        )}
                        {!booking.sClass &&
                          !booking.vClass &&
                          (!booking.others || !booking.others.vehicleType) && (
                            <div className="text-sm text-gray-500">
                              N/A
                              <div className="text-xs">Qty: 0</div>
                            </div>
                          )}
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      {booking.numberOfPassengers || "N/A"}
                    </TableCell>

                    <TableCell className="py-4 text-black ">
                      <div className="text-sm max-h-20 min-w-28 w-full overflow-auto rounded p-2">
                        <div className="whitespace-pre-wrap break-words">
                          {booking.note || "N/A"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      {booking.driverName || "N/A"}
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      {booking.driverNumber || "N/A"}
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      {booking.fare || "0 AED"}
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      {booking.extraCharge || "0 AED"}
                    </TableCell>

                    <TableCell className="py-4 text-black ">
                      <div className="text-sm max-h-20 min-w-28 w-full overflow-auto rounded p-2">
                        <div className="whitespace-pre-wrap break-words">
                          {booking.comment || " "}
                        </div>
                      </div>
                    </TableCell>

                    {/* <TableCell className="whitespace-normal">
                      {booking.driverName && <div>{booking.driverName}</div>}
                      {booking.driverNumber && (
                        <div className="text-sm text-gray-500">
                          {booking.driverNumber}
                        </div>
                      )}
                    // </TableCell> */}
                    {/* // <TableCell>${booking.fare}</TableCell>
                    // <TableCell>${booking.extraCharge || 0}</TableCell>
                    // <TableCell>{booking.comment}</TableCell> */}
                    <TableCell className="font-bold">
                      {(Number(booking.fare) || 0) +
                        (Number(booking.extraCharge) || 0)}
                      AED
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>

                    <TableCell>{booking.bookBy}</TableCell>

                    <TableCell>{booking.createdAt}</TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(booking)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => downloadSingleBookingCSV(booking)}
                          className="w-full   bg-blue-600 text-white "
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
              Are you sure you want to delete this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            {bookings.map((booking) => (
              <Button
                key={booking.id}
                variant="outline"
                size="sm"
                onClick={() => handleEdit(booking)}
                className="bg-blue-700 text-white border-blue-700 hover:bg-blue-800"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            ))}

            <Button
              variant="destructive"
              onClick={() => deleteId && deleteBooking(deleteId)}
              className="bg-black text-white hover:bg-gray-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting....
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[98vw] max-w-none sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[98vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-2 sm:p-4 md:p-6 lg:p-8 m-1 sm:m-4">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-blue-600">
                Edit Booking #{editingBooking?.id}
              </span>
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Update booking details. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 py-2 sm:py-4">
            {/* Editable fields */}
            <div className="space-y-2">
              <Label
                htmlFor="edit-passenger"
                className="text-gray-800 font-bold text-sm"
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
                className="bg-white text-black border-gray-300 text-sm h-11 sm:h-10 touch-manipulation"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-phone"
                className="text-gray-800 font-bold text-sm"
              >
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
                className="bg-white text-black border-gray-300 text-sm h-10"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-pickup"
                className="text-gray-800 font-bold text-sm"
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
                className="bg-white text-black border-gray-300 text-sm h-10"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-destination"
                className="text-gray-800 font-bold text-sm"
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
                className="bg-white text-black border-gray-300 text-sm h-10"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-flight"
                className="text-gray-800 font-bold text-sm"
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
                className="bg-white text-black border-gray-300 text-sm h-10"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-date"
                className="text-gray-800 font-bold text-sm"
              >
                Date *
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={editFormData.date || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, date: e.target.value })
                }
                className="bg-white text-black border-gray-300 text-sm h-10"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-room"
                className="text-gray-800 font-bold text-sm"
              >
                Room Number
              </Label>
              <Input
                id="edit-room"
                value={editFormData.roomNo || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, roomNo: e.target.value })
                }
                className="bg-white text-black border-gray-300 text-sm h-10"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-time"
                className="text-gray-800 font-bold text-sm"
              >
                Time *
              </Label>
              <Input
                id="edit-time"
                value={editFormData.time || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, time: e.target.value })
                }
                className="bg-white text-black border-gray-300 text-sm h-10"
              />
            </div>

            {/* Fare Calculation Section */}

            <div className="space-y-2">
              <Label
                htmlFor="edit-noofvehicle"
                className="text-gray-800 font-bold text-sm"
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
                className="bg-white text-black border-gray-300 text-sm h-10"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-status"
                className="text-gray-800 font-bold text-sm"
              >
                Status
              </Label>
              <Select
                value={editFormData.status || ""}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, status: value })
                }
              >
                <SelectTrigger className="bg-blue-700 text-white border-blue-700 text-sm h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-700 rounded-lg">
                  <SelectItem
                    value="pending"
                    className="text-white hover:bg-blue-500 focus:bg-blue-500"
                  >
                    Pending
                  </SelectItem>

                  <SelectItem
                    value="updated"
                    className="text-white hover:bg-blue-500 focus:bg-blue-500"
                  >
                    Update
                  </SelectItem>

                  <SelectItem
                    value="cancelled"
                    className="text-white hover:bg-blue-500 focus:bg-blue-500"
                  >
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label className="text-gray-800 font-bold text-sm">
                Booking Type *
              </Label>
              <div className="space-y-2 bg-white p-2 sm:p-3 rounded-md border border-gray-200">
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
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <Label
                    htmlFor="edit-pickAndDrop"
                    className="text-gray-700 text-sm"
                  >
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
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <Label
                    htmlFor="edit-hourly"
                    className="text-gray-700 text-sm"
                  >
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
                  <Label
                    htmlFor="edit-other-type"
                    className="text-gray-700 text-sm"
                  >
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
                        };
                        setEditFormData((prev) => ({
                          ...prev,
                          bookingType: JSON.stringify(updated),
                        }));
                      }}
                      className="bg-white text-black w-full text-sm h-10"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <Label
                      htmlFor="edit-sclass-checkbox"
                      className="text-gray-800 font-bold text-sm"
                    >
                      Mercedes S-Class (Sedan)
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
                      className="bg-white text-black mt-2 text-sm h-10"
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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <Label
                      htmlFor="edit-vclass-checkbox"
                      className="text-gray-800 font-bold text-sm"
                    >
                      Mercedes V-Class (7 seater)
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
                      className="bg-white text-black mt-2 text-sm h-10"
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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <Label
                      htmlFor="edit-others-checkbox"
                      className="text-gray-800 font-bold text-sm"
                    >
                      Others
                    </Label>
                  </div>
                  {showOthers && (
                    <div className="space-y-2">
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
                        className="bg-white text-black mt-2 text-sm h-10"
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
                        className="bg-white text-black mt-2 text-sm h-10"
                        placeholder="Enter quantity"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label
                htmlFor="edit-note"
                className="text-gray-800 font-bold text-sm"
              >
                Notes
              </Label>
              <Textarea
                id="edit-note"
                value={editFormData.note || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, note: e.target.value })
                }
                className="bg-white text-black border-gray-300 text-sm min-h-[80px]"
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isEditLoading}
              className="w-full sm:w-auto order-2 bg-blue-700 text-white border-blue-700 hover:bg-blue-800 sm:order-1 h-10 sm:h-auto min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={isEditLoading}
              className="bg-blue-700 hover:bg-blue-800 text-white w-full sm:w-auto order-1 sm:order-2 h-10 sm:h-auto min-h-[44px]"
            >
              {isEditLoading ? (
                <div className="flex items-center space-x-2 justify-center">
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
                  className="bg-blue-700 hover:bg-blue-800 text-white w-full sm:w-auto order-3 h-10 sm:h-auto min-h-[44px]"
                >
                  Rebook
                </Button>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPage;
