export function TacticalBorder() {
  return (
    <div className="relative h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent my-8">
      <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 bg-primary rounded-full" />
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-primary rounded-full" />
    </div>
  )
}
