import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     {
    type: String,
    enum: ['expense_added','payment_received','friend_request','group_invite','settlement','reminder'],
    required: true
  },
  message:  { type: String, required: true },
  isRead:   { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
