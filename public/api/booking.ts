import { config } from '@/lib/config'

export interface Booking {
  id?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  date: string
  roomNo?: string
  passengerName: string
  guest_phoneno?: string
  pickupAdress: string
  destination: string
  time: string
  flightNumber?: string
    sClass: number
    vClass: number
    others: {
      vehicleType: string;
      quantity: number;
    },
    type?: string;
    quantity?: number;
  bookingType: string
  status?: string
  note?: string
  bookBy: string
  comment?: string
  fare: string | number
  noOfVehicle?: string
  extraCharge?: number
  totalFare?: number
  driverName?: string
  driverNumber?: string
  isUpdated?: boolean
  numberOfPassengers:string
  voucherNumber?:string
}

export interface BookingResponse {
  success: boolean
  data?: Booking | Booking[]
  message?: string
}

export class BookingAPI {
  private static baseUrl = `${config.baseUrl}`

  // Add this public method
  public static getBaseUrl() {
    return this.baseUrl;
  }

  static async createBooking(bookingData: Omit<Booking, 'id'>): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(bookingData),
      })

      // Handle 204 No Content response as success
      if (response.status === 204) {
        return { success: true, message: 'Booking created successfully' }
      }

      const data = await response.json()
      return { success: response.ok, data, message: data.message }
    } catch (error) {
      console.error('Create booking error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async getBookingById(id: number): Promise<BookingResponse> {
    try {
      const hotelId = localStorage.getItem('id');

      const response = await fetch(`${this.baseUrl}/bookings/hotel/${id}`, {
  });

      const data = await response.json();
      return { 
        success: response.ok, 
        data: Array.isArray(data) ? data[0] : data, // Handle array response
        message: data.message 
      };
    } catch (error) {
      console.error('Get booking error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }

  static async getBookingsByHotel(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/hotel/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return { 
        success: response.ok, 
        data: Array.isArray(data) ? data[0] : data, // Handle array response
        message: data.message 
      };
    } catch (error) {
      console.error('Get booking by hotel error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }

  static async updateBooking(id: number, bookingData: Partial<Booking>): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()
      return { success: response.ok, data, message: data.message }
    } catch (error) {
      console.error('Update booking error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }
static async updateHotelBooking(id: number, bookingData: Partial<Booking>): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/by/hotel/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()
      return { success: response.ok, data, message: data.message }
    } catch (error) {
      console.error('Update booking error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }
  static async deleteBooking(id: number): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      return { success: response.ok, message: data.message }
    } catch (error) {
      console.error('Delete booking error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async getAllBookings(hotelId?: string): Promise<BookingResponse> {
    try {
      let url = `${this.baseUrl}/bookings/all/hotel/${hotelId}`;
      if (hotelId) {
        url = `${this.baseUrl}/bookings/all/hotel/${hotelId}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return { success: response.ok, data, message: data.message };
    } catch (error) {
      console.error('Get bookings error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }

  private static getToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || ''
    }
    return ''
  }
}


