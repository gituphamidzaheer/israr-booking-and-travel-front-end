"use client"
import React, { useState, useRef, useEffect } from "react"
import { AdminHeader } from "@/components/admin/header"
import { PlusCircle, Trash2, Download, Plus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface LineItem {
  cars: string
  guestName: string
  route: string
  date: string
  time: string
  rate: string
  vat: string
  total: string
}

export default function InvoicePage() {
  const [date, setDate] = useState("")
  const [invoiceNo, setInvoiceNo] = useState("")
  const [companyName] = useState("Valtrans Transportation Systems And Services")
  const [trn, setTrn] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const pdfRef = useRef<jsPDF | null>(null)
  
  const generateNewMetadata = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    setDate(`${day}-${month}-${year}`)
    setInvoiceNo(`${today.getFullYear().toString().slice(-2)}-${Math.floor(10000 + Math.random() * 90000)}`)
    setTrn(`TRN-${Math.floor(100000000000000 + Math.random() * 900000000000000)}`)
  }
  
  useEffect(() => {
    generateNewMetadata()
  }, [])
  
  const [items, setItems] = useState<LineItem[]>([
    { cars: "", guestName: "", route: "", date: "", time: "", rate: "", vat: "", total: "" }
  ])

  const invoiceRef = useRef<HTMLDivElement>(null)

  const handleAddItem = () => {
    setItems([...items, { cars: "", guestName: "", route: "", date: "", time: "", rate: "", vat: "", total: "" }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof LineItem, value: string) => {
    const newItems = [...items]
    newItems[index][field] = value
    
    // Calculate total if rate or vat changes
    if (field === 'rate' || field === 'vat') {
      const rateVal = parseFloat(newItems[index].rate) || 0
      const vatVal = parseFloat(newItems[index].vat) || 0
      newItems[index].total = (rateVal + vatVal).toString()
    }
    
    setItems(newItems)
  }

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0)
  }

  const handlePreparePDF = async () => {
    if (!invoiceRef.current) return
    setIsGenerating(true)
    const toastId = toast.loading("Generating PDF...")
    try {
      // Force scroll to top before capture to avoid cutout issues
      window.scrollTo(0, 0)
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      
      pdfRef.current = pdf
      setIsGenerating(false)
      setIsGenerated(true)
      toast.success("PDF Generated Successfully", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate PDF", { id: toastId })
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!pdfRef.current) return
    const guest = items[0]?.guestName ? items[0].guestName.trim().replace(/\s+/g, '_') + '_' : ''
    pdfRef.current.save(`Fox_Trip_Invoice_${guest}${invoiceNo}.pdf`)
    toast.success("PDF Downloaded")
    resetAfterAction()
  }

  const handleViewPDF = () => {
    if (!pdfRef.current) return
    const blob = pdfRef.current.output("blob")
    const url = URL.createObjectURL(blob)
    const previewWindow = window.open("", "_blank")
    if (previewWindow) {
      previewWindow.location.href = url
    }
    toast.success("PDF Preview opened")
    resetAfterAction()
  }

  const resetAfterAction = () => {
    setIsModalOpen(false)
    setIsGenerated(false)
    setItems([{ cars: "", guestName: "", route: "", date: "", time: "", rate: "", vat: "", total: "" }])
    generateNewMetadata()
  }

  return (
    <div className="w-full flex flex-col h-full bg-gray-50/50 mt-20">
      <div className="px-2 sm:px-4 md:px-6 pb-6 pt-2">
        <AdminHeader title="Invoice Generator" />
        
        <div className="mt-6 flex justify-between items-center bg-white p-8 rounded-lg shadow-sm border">
            <div>
               <h2 className="text-xl font-semibold text-gray-800">Invoices</h2>
               <p className="text-gray-500 text-sm mt-1">Manage and generate your PDF invoices.</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              setIsModalOpen(open)
              if (!open) {
                setIsGenerated(false)
                generateNewMetadata()
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Add Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-white p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold mb-4 text-black">Create Invoice details</DialogTitle>
                </DialogHeader>
                {/* User explicitly requested ONLY line items here, so we keep auto-generated stuff hidden. */}

                <div className="w-full">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-black">Booking Details</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block text-black">Cars</label>
                      <Input value={items[0].cars} onChange={(e) => handleItemChange(0, "cars", e.target.value)} className="bg-white border-gray-300 text-black placeholder-gray-400" placeholder="e.g. S Class" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-black">Guest Name</label>
                      <Input value={items[0].guestName} onChange={(e) => handleItemChange(0, "guestName", e.target.value)} className="bg-white border-gray-300 text-black placeholder-gray-400" placeholder="e.g. Wafaa sal resto" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-black">Route</label>
                      <Input value={items[0].route} onChange={(e) => handleItemChange(0, "route", e.target.value)} className="bg-white border-gray-300 text-black placeholder-gray-400" placeholder="e.g. Dubai" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-black">Date</label>
                      <Input type="date" value={items[0].date} onChange={(e) => handleItemChange(0, "date", e.target.value)} className="bg-white border-gray-300 text-black placeholder-gray-400" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-black">Time</label>
                      <Input type="text" value={items[0].time} onChange={(e) => handleItemChange(0, "time", e.target.value)} className="bg-white border-gray-300 text-black placeholder-gray-400" placeholder="e.g. 10:00 AM" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-black">Rate</label>
                      <Input type="number" value={items[0].rate} onChange={(e) => handleItemChange(0, "rate", e.target.value)} className="bg-white border-gray-300 text-black placeholder-gray-400" placeholder="e.g. 1300" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-black">VAT</label>
                      <Input type="number" value={items[0].vat} onChange={(e) => handleItemChange(0, "vat", e.target.value)} className="bg-white border-gray-300 text-black placeholder-gray-400" placeholder="e.g. 65" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-black">Total</label>
                      <Input value={items[0].total} readOnly className="bg-gray-100 border-gray-300 text-black cursor-not-allowed font-bold" />
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="mt-8 gap-2 flex-wrap">
                  <Button variant="outline" onClick={() => { setIsModalOpen(false); setIsGenerated(false); generateNewMetadata(); }}>Cancel</Button>
                  
                  {!isGenerated ? (
                    <Button onClick={handlePreparePDF} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-8">
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Generate
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleViewPDF} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-8">
                        <Eye className="w-4 h-4" /> View PDF
                      </Button>
                      <Button onClick={handleDownloadPDF} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-8">
                        <Download className="w-4 h-4" /> Download PDF
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>

        {/* Hidden Invoice Preview Container (keeps styling exact and renders offscreen for html2canvas) */}
        <div style={{ position: 'absolute', top: -9999, left: -9999, zIndex: -99, overflow: 'hidden' }}>
            <div 
              id="invoice-preview-container"
              ref={invoiceRef} 
              className="bg-white relative flex flex-col items-center" 
              style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                fontFamily: '"Times New Roman", Times, serif',
                position: 'relative',
                color: '#000'
              }}
            >
              {/* Top part padded */}
              <div className="w-full px-12 pt-2 pb-24 relative z-10 flex flex-col flex-1">
                
                {/* Header Logo */}
                <div className="w-full flex justify-start">
                  <img src="/pdf.jpeg" alt="Fox Trip Logo" className="h-[250px] w-auto max-w-[600px] object-contain object-left" crossOrigin="anonymous" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>

                {/* Title */}
                <div className="w-full text-center mt-[-40px]">
                  <h1 className="text-2xl font-bold tracking-wider">TAX INVOICE</h1>
                </div>

                {/* Date & TRN */}
                <div className="mt-8">
                  <p className="font-bold text-sm tracking-wide">DATE: {date}</p>
                  <p className="font-bold text-lg mt-6 underline underline-offset-4 decoration-1">{trn}</p>
                </div>

                {/* Company & Invoice No Boxes */}
                <div className="mt-4 flex w-full border border-black border-2 h-20 text-sm bg-white">
                  <div className="flex-[2] p-4 font-medium flex items-center border-r-2 border-black">
                    {companyName}
                  </div>
                  <div className="flex-[1] p-2 font-bold flex justify-center">
                    INVOICE NO -{invoiceNo}
                  </div>
                </div>

                {/* Data Table */}
                <div className="mt-8 w-full pb-8">
                  <table className="w-full border-collapse border border-black text-[13px] text-center">
                     <thead>
                       <tr className="border border-black bg-white">
                         <th className="border border-black py-1.5 px-1 font-semibold">sr</th>
                         <th className="border border-black py-1.5 px-1 font-semibold">cars</th>
                         <th className="border border-black py-1.5 px-1 font-semibold">guest name</th>
                         <th className="border border-black py-1.5 px-1 font-semibold">route</th>
                         <th className="border border-black py-1.5 px-1 font-semibold">date</th>
                         <th className="border border-black py-1.5 px-1 font-semibold">time</th>
                         <th className="border border-black py-1.5 px-1 font-semibold text-[#1a1a1a]">rate</th>
                         <th className="border border-black py-1.5 px-1 font-semibold">VAT</th>
                         <th className="border border-black py-1.5 px-1 font-semibold">total</th>
                       </tr>
                     </thead>
                     <tbody>
                       {items.map((item, idx) => (
                         <tr key={idx} className="border border-black bg-white">
                           <td className="border border-black py-1.5 px-1">{idx + 1}</td>
                           <td className="border border-black py-1.5 px-1 whitespace-nowrap">{item.cars}</td>
                           <td className="border border-black py-1.5 px-1">{item.guestName}</td>
                           <td className="border border-black py-1.5 px-1 font-style-italic italic">{item.route}</td>
                           <td className="border border-black py-1.5 px-1">{item.date}</td>
                           <td className="border border-black py-1.5 px-1">{item.time}</td>
                           <td className="border border-black py-1.5 px-1 text-[#1a1a1a]">{item.rate}</td>
                           <td className="border border-black py-1.5 px-1 text-[#1a1a1a]">{item.vat}</td>
                           <td className="border border-black py-1.5 px-1">{item.total}</td>
                         </tr>
                       ))}
                       
                       {/* Fill empty rows to match UI */}
                       {Array.from({ length: Math.max(0, 5) }).map((_, emptyIdx) => (
                         <tr key={`empty-${emptyIdx}`} className="border border-black">
                           <td className="border border-black h-6 px-1">&nbsp;</td>
                           <td className="border border-black h-6 px-1">&nbsp;</td>
                           <td className="border border-black h-6 px-1">&nbsp;</td>
                           <td className="border border-black h-6 px-1">&nbsp;</td>
                           <td className="border border-black h-6 px-1">&nbsp;</td>
                           <td className="border border-black h-6 px-1">&nbsp;</td>
                           <td className="border border-black h-6 px-1">&nbsp;</td>
                           <td className="border border-black h-6 px-1">&nbsp;</td>
                           <td className="border border-black h-6 px-1">&nbsp;</td>
                         </tr>
                       ))}

                       {/* Total Row */}
                       <tr className="border border-black text-[#1a1a1a]">
                         <td colSpan={8} className="border border-black py-1.5 px-1 text-right"></td>
                         <td className="border border-black py-1.5 px-1 bg-white font-medium text-lg font-bold">
                           {calculateGrandTotal()}
                         </td>
                       </tr>
                     </tbody>
                  </table>

                  {/* Prefooter Info */}
                  <div className="mt-14 w-full text-left bg-white relative z-20">
                    <h2 className="text-xl font-medium tracking-wide">Fox trip</h2>
                    <div className="mt-8 text-[11px] leading-tight space-y-0.5 max-w-[300px]">
                      <p>Bank account</p>
                      <p>Bank name -ADCB Abu Dhabi Commercial bank</p>
                      <p>Account number -11488407820001</p>
                      <p>Iban-AE870030011488407820001</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-[50px]"></div>
              </div>

              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none pb-[100px]">
                 <img src="/pdf.jpeg" className="w-[600px] object-contain grayscale" style={{ opacity: 0.08 }} alt="" crossOrigin="anonymous" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>

              {/* Footer exactly matching the layout */}
              <div className="absolute bottom-0 left-0 right-0 w-full z-10 font-sans">
                 <div className="bg-black text-white text-[12px] py-4 w-full flex justify-center items-center">
                   <div className="flex items-center gap-3 w-full justify-center">
                     <span>Mob: 00971502551538</span>
                     <span className="text-[#fbbf24]">|</span>
                     <span>Email: <a href="mailto:foxtripS2020@gmail.com" className="text-white decoration-white underline-offset-2">foxtripS2020@gmail.com</a></span>
                     <span className="text-[#fbbf24]">|</span>
                     <span>Abu Dhabi, UAE</span>
                   </div>
                 </div>
                 <div className="h-4 bg-[#facc15] w-[95%] rounded-tr-xl"></div>
              </div>

            </div>
        </div>
      </div>
    </div>
  )
}
