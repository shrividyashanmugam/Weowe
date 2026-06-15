import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

function PasswordStrength({ password }) {
  const len = password?.length || 0
  let label = 'Weak', color = 'bg-red-400', width = '33%'
  if (len >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    label = 'Strong'; color = 'bg-green-400'; width = '100%'
  } else if (len >= 6) {
    label = 'Medium'; color = 'bg-yellow-400'; width = '66%'
  }
  if (!len) return null
  return (
    <div className="mt-1">
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width }} />
      </div>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await registerUser({ name: data.name, email: data.email, phone: data.phone, password: data.password })
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12"
           style={{ background: 'linear-gradient(135deg, #1A6B6B 0%, #2E8B8B 50%, #0f4a4a 100%)' }}>
        <h1 className="font-display font-bold text-white text-4xl mb-4">💰 WeOwe</h1>
        <p className="text-white/80 text-lg">Join thousands splitting expenses smarter.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-wbg">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8">
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-1">Create Account</h2>
          <p className="text-gray-500 text-sm mb-6">Start splitting expenses with friends</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input placeholder="Full Name" className="input-field pl-11" {...register('name')} />
              {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" placeholder="Email" className="input-field pl-11" {...register('email')} />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="flex gap-2">
              <span className="input-field flex items-center px-4 bg-gray-50 text-gray-500 text-sm w-20">+91</span>
              <input placeholder="Phone Number" className="input-field flex-1" {...register('phone')} />
            </div>

            <div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showPass ? 'text' : 'password'} placeholder="Password" className="input-field pl-11 pr-11"
                       {...register('password')} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" placeholder="Confirm Password" className="input-field pl-11 pr-11"
                     {...register('confirmPassword')} />
              {password && confirmPassword === password && (
                <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
              )}
              {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" className="mt-0.5 accent-primary" {...register('terms')} />
              I agree to the Terms of Service and Privacy Policy
            </label>
            {errors.terms && <p className="text-danger text-xs">{errors.terms.message}</p>}

            <Button type="submit" fullWidth loading={loading}>Create Account</Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
