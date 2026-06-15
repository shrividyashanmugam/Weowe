import { FiLoader } from 'react-icons/fi'

const variants = {
  primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:-translate-y-0.5 hover:shadow-hover',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  danger:  'bg-danger text-white hover:opacity-90',
  ghost:   'text-primary hover:bg-wbg',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
}

export default function Button({
  variant = 'primary', size = 'md', loading, icon, fullWidth, disabled, children, className = '', ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? <FiLoader className="animate-spin" size={18} /> : icon}
      {children}
    </button>
  )
}
