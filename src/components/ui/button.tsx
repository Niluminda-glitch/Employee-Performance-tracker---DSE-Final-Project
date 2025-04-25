
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-elevation-1",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-elevation-1",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-elevation-1",
        ghost: "hover:bg-accent/30 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-glow-primary",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-elevation-1",
        info: "bg-info text-info-foreground hover:bg-info/90 shadow-sm hover:shadow-elevation-1",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-elevation-1",
        danger: "bg-danger text-danger-foreground hover:bg-danger/90 shadow-sm hover:shadow-elevation-1",
        subtle: "bg-muted/50 text-muted-foreground hover:bg-muted",
        "outline-primary": "border border-primary/50 text-primary hover:bg-primary/10 shadow-sm",
        "outline-success": "border border-success/50 text-success hover:bg-success/10 shadow-sm",
        "outline-info": "border border-info/50 text-info hover:bg-info/10 shadow-sm",
        "outline-warning": "border border-warning/50 text-warning hover:bg-warning/10 shadow-sm",
        "outline-danger": "border border-danger/50 text-danger hover:bg-danger/10 shadow-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        xs: "h-7 rounded-lg px-2 text-xs",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-xs": "h-7 w-7 rounded-lg text-xs",
      },
      rounded: {
        default: "rounded-xl",
        sm: "rounded-lg",
        md: "rounded-xl",
        lg: "rounded-2xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
