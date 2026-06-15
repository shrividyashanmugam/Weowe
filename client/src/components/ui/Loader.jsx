import { FiLoader } from 'react-icons/fi'

export default function Loader({ size = 32, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <FiLoader className="animate-spin text-primary" size={size} />
    </div>
  )
}
