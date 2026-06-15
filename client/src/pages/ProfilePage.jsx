import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { userService } from '../services/userService.js'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Loader from '../components/ui/Loader.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const { formatAmount } = useApp()
  const navigate = useNavigate()
  const fileRef = useRef()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    userService.getStats()
      .then(r => setStats(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, phone: user.phone || '', bio: user.bio || '' })
    }
  }, [user])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await userService.uploadAvatar(file)
      updateUser(res.data.data)
      toast.success('Avatar updated!')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const res = await userService.updateProfile(form)
      updateUser(res.data.data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount()
      await logout()
      navigate('/login')
    } catch {
      toast.error('Failed to delete account')
    }
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="card text-center">
          <div className="relative mx-auto mb-4" onClick={() => fileRef.current?.click()}>
            <Avatar src={user?.avatar} name={user?.name} size="xl" className="mx-auto ring-2 ring-primary cursor-pointer" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                <Loader size={24} />
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <h2 className="font-display font-bold text-xl">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          {user?.phone && <p className="text-gray-400 text-sm">{user.phone}</p>}
          <p className="text-xs text-gray-400 mt-2">
            Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : '—'}
          </p>
        </div>

        {stats && (
          <div className="card grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Expenses</p>
              <p className="font-semibold text-sm">{formatAmount(stats.totalExpenses)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Groups</p>
              <p className="font-semibold text-sm">{stats.groups}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Friends</p>
              <p className="font-semibold text-sm">{stats.friends}</p>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="card space-y-4">
          <h3 className="font-display font-semibold text-gray-800">Edit Profile</h3>
          <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Bio</label>
            <textarea className="input-field resize-none" rows={3} maxLength={200}
                      value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/200</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSaveProfile}>Save Changes</Button>
            <Button variant="outline" onClick={() => setForm({ name: user.name, email: user.email, phone: user.phone || '', bio: user.bio || '' })}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-display font-semibold text-gray-800">Change Password</h3>
          <Input label="Current Password" type="password" value={passwordForm.currentPassword}
                 onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} />
          <Input label="New Password" type="password" value={passwordForm.newPassword}
                 onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} />
          <Input label="Confirm New Password" type="password" value={passwordForm.confirmPassword}
                 onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} />
          <Button onClick={handleChangePassword}>Change Password</Button>
        </div>

        <div className="card border-2 border-red-100">
          <h3 className="font-display font-semibold text-danger mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all data.</p>
          <Button variant="danger" onClick={() => setShowDelete(true)}>Delete Account</Button>
        </div>
      </div>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)}
                     onConfirm={handleDeleteAccount} title="Delete Account"
                     message="This action is permanent. All your data will be deleted."
                     confirmText="Delete" variant="danger" typeToConfirm="DELETE" />
    </div>
  )
}
