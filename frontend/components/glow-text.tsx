import type { ReactNode } from "react"

interface GlowTextProps {
  children: ReactNode
  variant?: "primary" | "secondary"
  className?: string
}

export function GlowText({ children, variant = "primary", className = "" }: GlowTextProps) {
  const variantClass = variant === "secondary" ? "glow-cyan" : "glow-text"
  return <span className={`${variantClass} ${className}`}>{children}</span>
}
