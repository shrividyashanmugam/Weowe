export default function Select({ label, error, options = [], className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select className={`input-field ${error ? 'border-danger' : ''} ${className}`} {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
}
