import mongoose from 'mongoose'

const splitSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:  { type: Number, required: true },
  percent: { type: Number },
  isPaid:  { type: Boolean, default: false },
})

const expenseSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  amount:      { type: Number, required: true, min: 0.01 },
  category:    {
    type: String, default: 'Others',
    enum: ['Food','Travel','Shopping','Entertainment','Housing','Health','Others']
  },
  date:        { type: Date, default: Date.now },
  description: { type: String },
  group:       { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
  paidBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitMethod: { type: String, default: 'equal', enum: ['equal','percentage','exact'] },
  splits:      [splitSchema],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

expenseSchema.index({ group: 1, createdAt: -1 })
expenseSchema.index({ paidBy: 1, createdAt: -1 })
expenseSchema.index({ 'splits.user': 1 })

export default mongoose.model('Expense', expenseSchema)
