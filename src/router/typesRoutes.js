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

router.post('/add',upload.single('file'),addTypeHandler);
router.delete('/delete/:id', deletetypeAndImageHandler);
router.put('/update/:id',upload.single('file'), updateTypeHandler);
// c optimise ok
router.get('/getTypes',getTypesHandler)
// c optimise ok
router.get('/getAllVideoInType/:typeName',getAllVideoByTypeName)
module.exports = router;
