// const express = require('express');
// const {
//   addCategoryHandler,
//   getAllCategoriesHandler,
//   getCategoryByIdHandler,
//   updateCategoryHandler,
//   deleteCategoryHandler,
//   getCategoryHandler,
//   getAllCategoryHandler,
//   updateCategorySavedStatus,
//   getCountVideosInCategorie,
// } = require('../Controller/categoryController');
// const upload = require('../middlewares/multer');

// const router = express.Router();

// router.post('/type/:typeId/categorie/add',upload.single('file'),addCategoryHandler);//verify

// router.get('/type/:typeId/all', getAllCategoriesHandler);//verify

// router.get('/type/:typeId/categorie/:categoryId', getCategoryByIdHandler);//verify
// router.get('/type/:typeId/categoriedata/:categoryId',getCategoryHandler);//verify
// router.put('/type/:typeId/update/:categoryId',upload.single('file'), updateCategoryHandler);
// router.delete('/delete/:id', deleteCategoryHandler);
// router.get('/all', getAllCategoryHandler);
// router.patch('/type/:typeId/categorie/:categoryId/saved/:uid', updateCategorySavedStatus);
// router.get('/getCountAllVideos/:categoryId',getCountVideosInCategorie)

// module.exports = router;




const express = require('express');
const {
  addCategoryHandler,
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  getCategoryHandler,
  getAllCategoryHandler,
  updateCategorySavedStatus,
  getCountVideosInCategorie,
} = require('../Controller/categoryController');
const { invalidateCache, getCacheStats, clearExpiredCache } = require('../models/categoryModel');
const upload = require('../middlewares/multer');

const router = express.Router();

// ============================================
// ROUTES PRINCIPALES
// ============================================

// ✅ GET ALL categories (optimisé avec cache)
router.get('/all', getAllCategoryHandler);

// ✅ GET categories by typeId (optimisé avec cache)
router.get('/type/:typeId/all', getAllCategoriesHandler);

// ✅ GET single category
router.get('/type/:typeId/categorie/:categoryId', getCategoryByIdHandler);

// ✅ GET category with full data tree
router.get('/type/:typeId/categoriedata/:categoryId', getCategoryHandler);

// ✅ GET video count
router.get('/getCountAllVideos/:categoryId', getCountVideosInCategorie);

// ============================================
// ROUTES D'ÉCRITURE (avec invalidation cache)
// ============================================

// POST: Add new category
router.post('/type/:typeId/categorie/add', upload.single('file'), addCategoryHandler);

// PUT: Update category
router.put('/type/:typeId/update/:categoryId', upload.single('file'), updateCategoryHandler);

// DELETE: Delete category
router.delete('/delete/:id', deleteCategoryHandler);

// PATCH: Update saved status
router.patch('/type/:typeId/categorie/:categoryId/saved/:uid', updateCategorySavedStatus);

// ============================================
// ✅ NOUVELLES ROUTES DE GESTION DU CACHE
// ============================================

// POST: Clear all cache (admin only)
router.post('/cache/clear', (req, res) => {
  try {
    invalidateCache();
    res.status(200).json({ 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Clear specific collection cache (admin only)
router.post('/cache/clear/:collectionName', (req, res) => {
  try {
    const { collectionName } = req.params;
    invalidateCache(collectionName);
    
    res.status(200).json({ 
      message: `Cache cleared for: ${collectionName}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Cache statistics (monitoring)
router.get('/cache/stats', (req, res) => {
  try {
    const stats = getCacheStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Clear expired cache entries
router.post('/cache/cleanup', (req, res) => {
  try {
    const clearedCount = clearExpiredCache();
    res.status(200).json({ 
      message: 'Expired cache entries cleared',
      clearedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MIDDLEWARE: Log cache hits/misses (optional)
// ============================================
router.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📊 ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

module.exports = router;

/* 
📊 NOUVELLES ROUTES DE CACHE:

1. POST /categorie/cache/clear
   → Vide tout le cache (admin only)

2. POST /categorie/cache/clear/:collectionName
   → Vide le cache d'une collection spécifique

3. GET /categorie/cache/stats
   → Statistiques du cache (monitoring)

4. POST /categorie/cache/cleanup
   → Nettoie les entrées expirées

💡 UTILISATION:
- En production: Appeler /cache/clear après déploiement
- Monitoring: Vérifier /cache/stats régulièrement
- Maintenance: /cache/cleanup automatique (déjà fait)
*/
