const express = require('express')
const { admin, db } = require('../Firebase/firebaseAdmin')
const router = express.Router()

// GET /api/admin/users — list all users from Firestore users collection
router.get('/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get()
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      // convert Firestore timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt || null,
      lastLogin: doc.data().lastLogin?.toDate?.()?.toISOString() || doc.data().lastLogin || null,
    }))
    res.json({ success: true, count: users.length, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
