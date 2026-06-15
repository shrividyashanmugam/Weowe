export default function Card({ children, className = '', hover, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-card p-6 transition-all duration-200
        ${hover ? 'hover:-translate-y-1 hover:shadow-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
