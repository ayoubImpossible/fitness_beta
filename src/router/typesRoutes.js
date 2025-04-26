const express = require('express');
const {
  addTypeHandler,
  deletetypeHandler,
  updateTypeHandler,
  deletetypeAndImageHandler,
  getTypesHandler,
  getAllVideoByTypeName,
} = require('../Controller/TypesSportController');
const upload = require('../middlewares/multer');

const router = express.Router();

router.post('/add',upload.single('file'),addTypeHandler);//verify
router.delete('/delete/:id', deletetypeAndImageHandler);
router.put('/update/:id',upload.single('file'), updateTypeHandler);
router.get('/getTypes',getTypesHandler)
router.get('/getAllVideoInType/:typeName',getAllVideoByTypeName)
module.exports = router;
