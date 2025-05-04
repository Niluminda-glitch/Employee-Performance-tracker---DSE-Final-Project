
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-purple-100/70 bg-card text-card-foreground " +
      "transition-all duration-300 relative overflow-hidden " +
      "hover:shadow-elevation-2 hover:border-purple-200/80 " +
      "group shadow-elevation-1 " +
      "backdrop-blur-md bg-white/90 " +
      "outline outline-2 outline-offset-0 " + // Increased outline width
      "outline-gradient-purple " + // New gradient outline class
      "hover:outline-gradient-purple-intense " + // Hover effect for outline
      "hover:shadow-glow-purple", // Added glow effect on hover
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6 pb-4 border-b border-purple-100/50 " +
      "group-hover:border-purple-200/80 transition-colors bg-gradient-to-r from-transparent via-purple-50/30 to-transparent",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight " +
      "text-gradient-enhanced transition-colors",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "px-6 py-4 space-y-4 relative z-10", 
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-4 border-t border-purple-100/50 " +
      "group-hover:border-purple-200/80 transition-colors bg-gradient-to-r from-transparent via-purple-50/30 to-transparent",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
