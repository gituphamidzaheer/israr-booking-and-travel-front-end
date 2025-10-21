'use client'
import { AdminHeader } from "@/components/admin/header"
import { Clock } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const Page = () => {
  const [open, setOpen] = useState(false)
  const [driverName, setDriverName] = useState("")
  const [driverPhone, setDriverPhone] = useState("")
  const [vehicle, setVehicle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [standbyDrivers, setStandbyDrivers] = useState<any[]>([])
  const [actionOpen, setActionOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState("")
  const [actionAvailable, setActionAvailable] = useState(true)
  const [actionDriverName, setActionDriverName] = useState("")
  const [actionDriverPhone, setActionDriverPhone] = useState("")
  const [actionVehicle, setActionVehicle] = useState("")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Fetch standby drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get(`${baseUrl}/standby`)
        setStandbyDrivers(res.data)
      } catch {
        // handle error if needed
      }
    }
    fetchDrivers()
  }, [baseUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await axios.post(`${baseUrl}/standby`, {
        driverName,
        driverPhone,
        vehicle
      })
      setOpen(false)
      setDriverName("")
      setDriverPhone("")
      setVehicle("")
      const refreshed = await axios.get(`${baseUrl}/standby`)
      setStandbyDrivers(refreshed.data)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Network error")
    }
    setLoading(false)
  }

  const handleActionClick = (driver: any) => {
    setSelectedDriver(driver)
    setActionAvailable(driver.isAvailable)
    setActionDriverName(driver.driverName)
    setActionDriverPhone(driver.driverPhone)
    setActionVehicle(driver.vehicle)
    setActionOpen(true)
    setActionError("")
  }

  // PATCH request for isAvailable and fields
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setActionError("")
    try {
      await axios.patch(`${baseUrl}/standby/${selectedDriver.id}`, {
        driverName: actionDriverName,
        driverPhone: actionDriverPhone,
        vehicle: actionVehicle,
        isAvailable: actionAvailable
      })
      setActionOpen(false)
      // Refresh list
      const res = await axios.get(`${baseUrl}/standby`)
      setStandbyDrivers(res.data)
    } catch (err: any) {
      setActionError(err?.response?.data?.message || "Network error")
    }
    setActionLoading(false)
  }

  return (
    <div className="w-full">
      <div className="px-2 sm:px-4 md:px-6 pb-6">
        <AdminHeader title="standby" />
        <div className="flex justify-between items-center mt-24">
          <Button onClick={() => setOpen(true)} variant="default" className="text-white">Add New Standby</Button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Standby Driver</DialogTitle>
              <DialogDescription>Fill the form to add a new standby driver.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-white">Driver Name</label>
                <Input value={driverName} onChange={e => setDriverName(e.target.value)} required className="bg-white text-black" />
              </div>
              <div>
                <label className="block mb-1 text-white">Driver Phone</label>
                <Input value={driverPhone} onChange={e => setDriverPhone(e.target.value)} required className="bg-white text-black" />
              </div>
              <div>
                <label className="block mb-1 text-white">Vehicle</label>
                <Input value={vehicle} onChange={e => setVehicle(e.target.value)} required className="bg-white text-black" />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <DialogFooter>
                <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Standby"}</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {/* Standby drivers list */}
        <div className="mt-8 space-y-4">
          {standbyDrivers.map(driver => (
            <div
              key={driver.id}
              className={`flex items-center justify-between rounded-lg p-4 shadow
                ${driver.isAvailable ? "bg-green-100" : "bg-red-100"}`}
            >
              <div>
                <div className="font-bold text-lg text-black">{driver.driverName}</div>
                <div className="text-gray-700">Phone: {driver.driverPhone}</div>
                <div className="text-gray-700">Vehicle: {driver.vehicle}</div>
              </div>
              <Button variant="secondary" onClick={() => handleActionClick(driver)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
        {/* Action Modal */}
        <Dialog open={actionOpen} onOpenChange={setActionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Availability</DialogTitle>
              <DialogDescription>
                Change availability and details for <span className="font-bold">{selectedDriver?.driverName}</span>
              </DialogDescription>
            </DialogHeader>
            {/* Editable input fields for selected driver */}
            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-white">Driver Name</label>
                <Input value={actionDriverName} onChange={e => setActionDriverName(e.target.value)} required className="bg-white text-black" />
              </div>
              <div>
                <label className="block mb-1 text-white">Driver Phone</label>
                <Input value={actionDriverPhone} onChange={e => setActionDriverPhone(e.target.value)} required className="bg-white text-black" />
              </div>
              <div>
                <label className="block mb-1 text-white">Vehicle</label>
                <Input value={actionVehicle} onChange={e => setActionVehicle(e.target.value)} required className="bg-white text-black" />
              </div>
              <div className="flex items-center gap-2">
                <label>Available</label>
                <Switch checked={actionAvailable} onCheckedChange={setActionAvailable} />
              </div>
              {actionError && <div className="text-red-500 text-sm">{actionError}</div>}
              <DialogFooter>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading ? "Updating..." : "Update"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
       
      </div>
    </div>
  )
}

export default Page
