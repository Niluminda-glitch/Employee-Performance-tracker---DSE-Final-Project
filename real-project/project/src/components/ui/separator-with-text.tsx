
import * as React from "react"
import { cn } from "@/lib/utils"

export interface SeparatorWithTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
}

const SeparatorWithText = React.forwardRef<HTMLDivElement, SeparatorWithTextProps>(
  ({ className, text, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex items-center py-4", className)}
      {...props}
    >
      <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <span className="mx-4 px-3 py-1 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 border border-gray-100">{text}</span>
      <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </div>
  )
)
SeparatorWithText.displayName = "SeparatorWithText"

export { SeparatorWithText }
