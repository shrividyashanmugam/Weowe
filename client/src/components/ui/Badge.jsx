const variants = {
  success: 'bg-green-100 text-green-700',
  danger:  'bg-red-100 text-red-700',
  neutral: 'bg-gray-100 text-gray-600',
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-amber-100 text-amber-700',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
