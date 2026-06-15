import { useState } from 'react'
import { FiCheck, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'

const FREE_FEATURES = [
  { text: 'Basic expense splitting', included: true },
  { text: 'Up to 5 groups', included: true },
  { text: '3-month expense history', included: true },
  { text: 'Basic reports', included: true },
  { text: 'Export reports', included: false },
  { text: 'Advanced analytics', included: false },
  { text: 'Priority support', included: false },
]

const PREMIUM_FEATURES = [
  { text: 'Everything in Free', included: true },
  { text: 'Unlimited groups', included: true },
  { text: 'Full expense history', included: true },
  { text: 'Advanced analytics', included: true },
  { text: 'Export to PDF/CSV', included: true },
  { text: 'Priority support', included: true },
  { text: 'Custom categories', included: true },
  { text: 'Multi-currency', included: true },
]

const FAQ = [
  { q: 'Can I switch back to Free?', a: 'Yes, you can downgrade anytime. Your data stays intact.' },
  { q: 'Is my data safe?', a: 'We use industry-standard encryption to protect your financial data.' },
  { q: 'What payment methods?', a: 'All major credit/debit cards and UPI are accepted.' },
]

export default function PremiumPage() {
  const { user } = useAuth()
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="space-y-8">
      <div className="rounded-3xl p-8 text-center text-white"
           style={{ background: 'linear-gradient(135deg, #1A6B6B 0%, #2E8B8B 50%, #0f4a4a 100%)' }}>
        <h1 className="font-display font-bold text-3xl mb-2">Upgrade to WeOwe Premium 💎</h1>
        <p className="text-white/80">Unlock unlimited groups, advanced analytics, and priority support.</p>
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setAnnual(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${!annual ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}>
            Monthly
          </button>
          <button onClick={() => setAnnual(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${annual ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}>
            Annual (Save 30%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="card border-2 border-gray-200">
          <h3 className="font-display font-semibold text-gray-800">Free Forever</h3>
          <p className="text-3xl font-display font-bold mt-2">₹0</p>
          <ul className="space-y-3 mt-6">
            {FREE_FEATURES.map(f => (
              <li key={f.text} className="flex items-center gap-2 text-sm">
                {f.included ? <FiCheck className="text-green-500" size={16} /> : <FiX className="text-gray-300" size={16} />}
                <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" fullWidth className="mt-6" disabled>Current Plan</Button>
        </div>

        <div className="card border-2 border-primary scale-105 shadow-hover relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </span>
          <h3 className="font-display font-semibold text-gray-800">WeOwe Premium</h3>
          <p className="text-3xl font-display font-bold mt-2 text-primary">
            {annual ? '₹2,499/year' : '₹299/month'}
          </p>
          <ul className="space-y-3 mt-6">
            {PREMIUM_FEATURES.map(f => (
              <li key={f.text} className="flex items-center gap-2 text-sm">
                <FiCheck className="text-green-500" size={16} />
                <span className="text-gray-700">{f.text}</span>
              </li>
            ))}
          </ul>
          <Button fullWidth className="mt-6">
            {user?.isPremium ? 'Current Plan' : 'Upgrade Now →'}
          </Button>
        </div>
      </div>

      <div className="card max-w-3xl mx-auto">
        <h3 className="font-display font-semibold text-gray-800 mb-4">FAQ</h3>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left p-4 font-medium text-sm text-gray-800 flex justify-between">
                {item.q}
                <span>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <p className="px-4 pb-4 text-sm text-gray-600">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
