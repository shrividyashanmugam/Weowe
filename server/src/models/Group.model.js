import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  emoji:       { type: String, default: '👥' },
  description: { type: String },
  status:      { type: String, default: 'active', enum: ['active','settled','archived'] },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role:     { type: String, default: 'member', enum: ['owner','member'] },
    joinedAt: { type: Date, default: Date.now }
  }],
  totalExpenses: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Group', groupSchema)
