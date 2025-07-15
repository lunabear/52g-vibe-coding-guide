import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8 custom:py-10">
        <div className="flex flex-col custom:flex-row items-center custom:items-start justify-between gap-6">
          <div className="flex items-center text-center custom:items-start custom:text-left leading-7 flex-col gap-y-0">
            <Image src="/assets/logo-52g.png" alt="푸터 로고" width={50} height={50} className="h-7 w-auto" />
            <p className="mt-2 font-bold text-gray-700 text-base">5pen 2nnovation GS</p>
            <p className="mt-4 text-gray-500 text-sm">Copyright © 52g. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}