import mongoose from 'mongoose'

const settlementSchema = new mongoose.Schema({
  from:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:  { type: Number, required: true, min: 0.01 },
  note:    { type: String },
  group:   { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
  status:  { type: String, default: 'pending', enum: ['pending','completed'] },
  paidAt:  { type: Date },
}, { timestamps: true })

export default mongoose.model('Settlement', settlementSchema)
