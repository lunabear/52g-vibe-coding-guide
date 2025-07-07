import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-light">52</span>
            </div>
            <p className="text-lg font-light text-gray-900">52g Innovation</p>
          </div>
          <p className="text-sm text-gray-400 font-extralight">
            Copyright © 52g. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}