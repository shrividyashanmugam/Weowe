import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12"
           style={{ background: 'linear-gradient(135deg, #1A6B6B 0%, #2E8B8B 50%, #0f4a4a 100%)' }}>
        <h1 className="font-display font-bold text-white text-4xl mb-4">💰 WeOwe</h1>
        <p className="text-white/80 text-lg mb-8">Split Expenses, Not Friendships.</p>
        <div className="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <p className="text-white font-semibold mb-2">Dinner at Pind Balluchi</p>
          <p className="text-white/70 text-sm">₹2,400 split among 6 friends</p>
        </div>
        <ul className="space-y-3 text-white/80 text-sm">
          <li>✓ Split expenses equally or by custom amounts</li>
          <li>✓ Track group trips and shared bills</li>
          <li>✓ Settle up with simplified debt calculations</li>
        </ul>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-wbg">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8">
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-1">Welcome Back 👋</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to manage shared expenses</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" placeholder="Email address" className="input-field pl-11"
                       {...register('email')} />
              </div>
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
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
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded accent-primary" /> Remember me
              </label>
              <a href="#" className="text-sm text-secondary hover:underline">Forgot Password?</a>
            </div>

            <Button type="submit" fullWidth loading={loading}>Sign In</Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <hr className="flex-1 border-gray-200" />
            <span className="text-gray-400 text-xs">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
