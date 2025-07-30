"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-center"
      theme="light"
      className="toaster group"
      expand={false}
      richColors={false}
      closeButton={false}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-[0_4px_12px_rgb(0,0,0,0.08)] group-[.toaster]:rounded-xl group-[.toaster]:min-h-[52px] group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-gray-500 group-[.toast]:text-[13px] group-[.toast]:mt-1 group-[.toast]:font-light group-[.toast]:leading-relaxed",
          title: "group-[.toast]:text-[15px] group-[.toast]:font-normal group-[.toast]:text-gray-900 group-[.toast]:leading-snug",
          actionButton:
            "group-[.toast]:bg-gray-900 group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-[13px] group-[.toast]:font-normal group-[.toast]:hover:bg-gray-800 group-[.toast]:transition-all group-[.toast]:duration-200",
          cancelButton:
            "group-[.toast]:bg-gray-50 group-[.toast]:text-gray-700 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-[13px] group-[.toast]:font-normal group-[.toast]:hover:bg-gray-100 group-[.toast]:transition-all group-[.toast]:duration-200",
          error:
            "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-100",
          success:
            "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-100",
          warning:
            "group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-900 group-[.toaster]:border-amber-100",
          info:
            "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster } 