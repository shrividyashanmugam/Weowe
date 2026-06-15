const sizes = { sm: 'w-6 h-6', md: 'w-9 h-9', lg: 'w-12 h-12', xl: 'w-24 h-24' }

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const url = src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'user'}`
  return (
    <img
      src={url}
      alt={name || 'Avatar'}
      className={`${sizes[size]} rounded-full object-cover bg-gray-100 ring-2 ring-transparent hover:ring-primary/20 transition-all ${className}`}
    />
  )
}
