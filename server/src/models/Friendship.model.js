import mongoose from 'mongoose'

const friendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:    { type: String, default: 'pending', enum: ['pending','accepted','rejected','blocked'] },
}, { timestamps: true })

friendshipSchema.index({ requester: 1, receiver: 1 }, { unique: true })

export default mongoose.model('Friendship', friendshipSchema)
