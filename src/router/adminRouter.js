const express = require('express')
const { admin, db, auth } = require('../Firebase/firebaseAdmin')
const router = express.Router()
const { getAdminVideosLibrary, deleteAdminVideo, updateAdminVideo, getAdminFullTree } = require('../Controller/AdminController');

// GET /api/admin/videos — Enhanced library for admin
router.get('/videos', getAdminVideosLibrary);
router.delete('/videos', deleteAdminVideo);
router.put('/videos', updateAdminVideo);
router.get('/categories/tree', getAdminFullTree);

// GET /api/admin/users — list all users from Auth and Firestore
router.get('/users', async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers();
    const authUsers = listUsersResult.users.map(u => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
      provider: u.providerData?.[0]?.providerId || 'email',
      createdAt: u.metadata.creationTime,
      lastLogin: u.metadata.lastSignInTime,
    }));

    const snapshot = await db.collection('users').get();
    const firestoreUsers = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const uid = data.uid || doc.id;
      firestoreUsers[uid] = data;
    });

    const users = authUsers.map(au => {
      const fu = firestoreUsers[au.uid] || {};
      const displayName = fu.fullName || fu.full_name || fu.name || fu.displayName || fu.display_name || fu.userName || fu.username || au.displayName || '—';
      
      const autoDiscoveredUrl = Object.values(fu).find(val => 
        typeof val === 'string' && val.startsWith('http') && (val.includes('firebase') || val.includes('googleusercontent') || val.includes('storage'))
      );

      let photoURL = 
        fu.profileImageUrl || fu.profile_image_url || 
        fu.imageUrl || fu.image_url || 
        fu.imageUser || fu.image_user || 
        fu.userImage || fu.user_image || 
        fu.image || fu.photoURL || fu.photo_url || 
        autoDiscoveredUrl || 
        au.photoURL || null;
      
      if (photoURL && (typeof photoURL !== 'string' || !photoURL.startsWith('http'))) {
        photoURL = null;
      }

      return {
        ...au,
        ...fu,
        uid: au.uid, 
        displayName,
        photoURL,
        createdAt: fu.createdAt?.toDate?.()?.toISOString() || fu.createdAt || au.createdAt || null,
      };
    });

    users.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error in /users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/stats — Dashboard Analytics
router.get('/stats', async (req, res) => {
  try {
    const listUsers = await admin.auth().listUsers();
    const totalUsers = listUsers.users.length;
    
    // 7-day Growth Chart
    const days = {};
    const now = new Date();
    for(let i=6; i>=0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days[dateStr] = 0;
    }

    listUsers.users.forEach(user => {
      const dateStr = new Date(user.metadata.creationTime).toISOString().split('T')[0];
      if (days[dateStr] !== undefined) {
        days[dateStr]++;
      }
    });

    const activeGrowth = Object.entries(days).map(([date, count]) => ({
      date: date.split('-').slice(1).join('/'),
      count
    }));

    // Top Programs by Engagement (likedBy + savedBy)
    const programsSnap = await db.collection('construire').get();
    const topProgramsRaw = programsSnap.docs.map(doc => {
      const data = doc.data();
      const combined = [...new Set([...(data.likedBy || []), ...(data.savedBy || [])])];
      return { id: doc.id, name: data.name, likes: combined.length, rawData: data };
    }).sort((a, b) => b.likes - a.likes).slice(0, 3);

    // Fetch ALL program videos once to avoid "FAILED_PRECONDITION" (index required) error
    const allProgramVidsSnap = await db.collectionGroup('videos').get();
    const videoMap = {}; // programId -> first video image
    allProgramVidsSnap.forEach(vdoc => {
      const vdata = vdoc.data();
      if (vdata.programId && !videoMap[vdata.programId]) {
        videoMap[vdata.programId] = vdata.imageUrl || vdata.image;
      }
    });

    const topPrograms = topProgramsRaw.map(p => ({
      id: p.id,
      name: p.name,
      likes: p.likes
    }));

    // Top Videos by Engagement (likedBy + savedBy)
    // We already have allProgramVidsSnap, so let's use it for topVideos too!
    const topVideos = allProgramVidsSnap.docs.map(doc => {
      const data = doc.data();
      const combined = [...new Set([...(data.likedBy || []), ...(data.savedBy || [])])];
      return {
        id: doc.id,
        titre: data.titre || data.name || 'Untitled Video',
        image: data.imageUrl || data.image || null,
        saves: combined.length
      };
    }).sort((a, b) => b.saves - a.saves).slice(0, 3);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeGrowth,
        topPrograms,
        topVideos
      }
    });
  } catch (error) {
    console.error('Error in /stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router
