import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:         { type: String, trim: true },
  password:      { type: String, required: true, minlength: 6, select: false },
  avatar:        { type: String, default: null },
  avatarPublicId:{ type: String, default: null },
  bio:           { type: String, maxlength: 200 },
  isPremium:     { type: Boolean, default: false },
  currency:      { type: String, default: 'INR', enum: ['INR','USD','EUR','GBP'] },
  theme:         { type: String, default: 'light', enum: ['light','dark'] },
  language:      { type: String, default: 'en' },
  emailVerified: { type: Boolean, default: false },
  emailVerifyToken: { type: String, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  refreshToken:  { type: String, select: false },
  notificationPrefs: {
    newExpense:   { type: Boolean, default: true },
    payment:      { type: Boolean, default: true },
    groupInvite:  { type: Boolean, default: true },
    weeklySummary:{ type: Boolean, default: false },
  },
  privacy: {
    groupAddPolicy: { type: String, default: 'friends', enum: ['anyone','friends'] },
    balanceVisibility: { type: String, default: 'friends', enum: ['everyone','friends','none'] },
  }
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toJSON = function() {
  const user = this.toObject()
  delete user.password
  delete user.refreshToken
  delete user.emailVerifyToken
  delete user.resetPasswordToken
  return user
}

export default mongoose.model('User', userSchema)
