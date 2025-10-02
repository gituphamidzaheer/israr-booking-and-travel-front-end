import { VendorHeader } from "@/components/vendor/header"
import { Clock } from "lucide-react"

const Page = () => {
  return (
    <div className="w-full">
          <div className="px-2 sm:px-4 md:px-6 pb-6">
            <VendorHeader title="standby" />
       
      <div className="flex flex-col items-center justify-center h-[100vh]"               >
        <Clock className="w-16 h-16 text-gray-400 mb-4" />
      <span className="text-2xl font-semibold text-gray-500">Coming soon</span>
      </div>
    </div>
    </div>
  )
}


export default Page
