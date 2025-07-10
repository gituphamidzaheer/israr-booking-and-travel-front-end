import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/images/login.png)" }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            <div className="mt-6 mb-7">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-transparent bg-clip-text mb-2 flex items-baseline flex-wrap sm:flex-nowrap">
                ASRAR
                <span className="text-xl sm:text-2xl md:text-3xl font-medium ml-2 sm:ml-3 bg-gradient-to-r from-blue-500 to-blue-600 text-transparent bg-clip-text whitespace-nowrap">
                  Travel and Tourism
                </span>
              </h1>
              <p className="text-sm md:text-base font-semibold text-gray-300 ">
                Member of International Air Transport Association
              </p>
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Booking Portal
              </h1>
            </div>

            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Asrar Travel and Tourism Air Transport Association
            </p>

            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Book now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="w-full py-4 text-white/80 text-lg text-center">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-center">
            <p>© 2025 Copyrights by Asrar Travel UAE. All Rights Reserved</p>
            <span>|</span>
            <p>Developed By: Hamid Zaheer | Phone: +92317579457</p>
          </div>
        </div>
      </div>
    </div>
  );
}
