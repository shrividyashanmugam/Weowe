export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 border-b border-gray-100 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-xl
            ${active === tab.id ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
