import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, ArrowRight } from "lucide-react"


export default function HomePage() {
  return (
    <div className="min-h-screen relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/images/car.jpg)' }}>
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Hotel Car Booking System
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Professional car booking management for hotels and vendors. 
              Streamline your transportation services with our comprehensive platform.
            </p>
            
            <Link href="/login">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Book now 
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
