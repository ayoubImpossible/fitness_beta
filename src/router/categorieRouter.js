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
const upload = require('../middlewares/multer');

const router = express.Router();

router.post('/type/:typeId/categorie/add',upload.single('file'),addCategoryHandler);//verify
router.get('/type/:typeId/all', getAllCategoriesHandler);//verify
router.get('/type/:typeId/categorie/:categoryId', getCategoryByIdHandler);//verify
router.get('/type/:typeId/categoriedata/:categoryId',getCategoryHandler);//verify
router.put('/type/:typeId/update/:categoryId',upload.single('file'), updateCategoryHandler);
router.delete('/delete/:id', deleteCategoryHandler);
router.get('/all', getAllCategoryHandler);
router.patch('/type/:typeId/categorie/:categoryId/saved/:uid', updateCategorySavedStatus);
router.get('/getCountAllVideos/:categoryId',getCountVideosInCategorie)

module.exports = router;
