import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './src/models/User.model.js'
import Group from './src/models/Group.model.js'
import Expense from './src/models/Expense.model.js'
import Friendship from './src/models/Friendship.model.js'
import Notification from './src/models/Notification.model.js'

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('🌱 Connected to MongoDB...')

  await Promise.all([
    User.deleteMany({}), Group.deleteMany({}),
    Expense.deleteMany({}), Friendship.deleteMany({}),
    Notification.deleteMany({})
  ])
  console.log('🗑️  Cleared existing data')

  const password = await bcrypt.hash('password123', 12)

  const users = await User.insertMany([
    { name:'Anika Sharma',  email:'anika@weoowe.com',   phone:'+91 98765 43210', password, emailVerified:true },
    { name:'Preethi Kumar', email:'preethi@weoowe.com', phone:'+91 87654 32109', password, emailVerified:true },
    { name:'Pavi Shankar',  email:'pavi@weoowe.com',    phone:'+91 76543 21098', password, emailVerified:true },
    { name:'Shrividya R',   email:'shri@weoowe.com',    phone:'+91 65432 10987', password, emailVerified:true },
    { name:'Arjun Mehta',   email:'arjun@weoowe.com',   phone:'+91 54321 09876', password, emailVerified:true },
    { name:'Kavya Nair',    email:'kavya@weoowe.com',   phone:'+91 43210 98765', password, emailVerified:true },
    { name:'Rohit Das',     email:'rohit@weoowe.com',   phone:'+91 32109 87654', password, emailVerified:true },
    { name:'Sneha Patel',   email:'sneha@weoowe.com',   phone:'+91 21098 76543', password, emailVerified:true },
  ])
  console.log(`✅ Created ${users.length} users`)

  const friendships = users.slice(1).map(u => ({
    requester: users[0]._id, receiver: u._id, status: 'accepted'
  }))
  await Friendship.insertMany(friendships)

  const goaGroup = await Group.create({
    name: 'Goa Trip 2025', emoji: '✈️',
    description: 'Our amazing Goa vacation!',
    owner: users[0]._id,
    members: users.slice(0,6).map((u,i) => ({
      user: u._id, role: i === 0 ? 'owner' : 'member'
    })),
    totalExpenses: 24500
  })

  const officeGroup = await Group.create({
    name: 'Office Team', emoji: '💼',
    owner: users[0]._id,
    members: users.slice(0,4).map((u,i) => ({
      user: u._id, role: i === 0 ? 'owner' : 'member'
    })),
    totalExpenses: 12800
  })

  const collegeGroup = await Group.create({
    name: 'College Friends', emoji: '🎓',
    status: 'settled',
    owner: users[0]._id,
    members: users.slice(0,5).map((u,i) => ({
      user: u._id, role: i === 0 ? 'owner' : 'member'
    })),
    totalExpenses: 8600
  })
  console.log('✅ Created 3 groups')

  const expenses = [
    { title:'Dinner at Pind Balluchi', amount:2400, category:'Food',
      date: new Date('2025-01-12'), paidBy: users[1]._id, group: goaGroup._id,
      splits: users.slice(0,6).map(u => ({ user:u._id, amount:400 })) },
    { title:'Cab to Airport', amount:1800, category:'Travel',
      date: new Date('2025-01-10'), paidBy: users[0]._id, group: goaGroup._id,
      splits: users.slice(0,6).map(u => ({ user:u._id, amount:300 })) },
    { title:'Hotel Checkout', amount:9600, category:'Housing',
      date: new Date('2025-01-14'), paidBy: users[2]._id, group: goaGroup._id,
      splits: users.slice(0,6).map(u => ({ user:u._id, amount:1600 })) },
    { title:'Water Sports', amount:4200, category:'Entertainment',
      date: new Date('2025-01-13'), paidBy: users[3]._id, group: goaGroup._id,
      splits: users.slice(0,6).map(u => ({ user:u._id, amount:700 })) },
    { title:'Team Lunch', amount:3200, category:'Food',
      date: new Date('2025-01-15'), paidBy: users[0]._id, group: officeGroup._id,
      splits: users.slice(0,4).map(u => ({ user:u._id, amount:800 })) },
    { title:'Office Supplies', amount:1500, category:'Others',
      date: new Date('2025-01-16'), paidBy: users[3]._id, group: officeGroup._id,
      splits: users.slice(0,4).map(u => ({ user:u._id, amount:375 })) },
    { title:'Grocery Run', amount:850, category:'Food',
      date: new Date('2025-01-18'), paidBy: users[0]._id, group: null,
      splits: [{ user:users[0]._id, amount:425 }, { user:users[1]._id, amount:425 }] },
    { title:'Movie Night', amount:600, category:'Entertainment',
      date: new Date('2025-01-19'), paidBy: users[0]._id, group: null,
      splits: [{ user:users[0]._id, amount:200 }, { user:users[4]._id, amount:200 }, { user:users[5]._id, amount:200 }] },
  ]

  await Expense.insertMany(expenses.map(e => ({ ...e, createdBy: e.paidBy, splitMethod: 'equal' })))
  console.log(`✅ Created ${expenses.length} expenses`)

  await Notification.insertMany([
    { user: users[0]._id, type: 'expense_added',    isRead: false,
      message: 'Preethi added "Dinner at Pind Balluchi" ₹2,400 to Goa Trip',
      metadata: { groupId: goaGroup._id } },
    { user: users[0]._id, type: 'payment_received', isRead: false,
      message: 'Pavi is settling ₹500 with you' },
    { user: users[0]._id, type: 'friend_request',   isRead: true,
      message: 'Arjun Mehta sent you a friend request' },
    { user: users[0]._id, type: 'settlement',        isRead: true,
      message: 'College Friends group is fully settled!' },
  ])

  console.log('✅ Created notifications')
  console.log('\n🎉 Seed complete!')
  console.log('📧 Login with: anika@weoowe.com / password123')
  await mongoose.disconnect()
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1) })
