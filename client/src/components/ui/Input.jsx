export default function Input({ label, error, icon, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          className={`input-field ${icon ? 'pl-11' : ''} ${error ? 'border-danger' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
}
