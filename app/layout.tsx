import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hotel Car Booking System",
  description: "Professional hotel car booking management system",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} w-full min-h-screen`}>
        <div className="w-full min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
