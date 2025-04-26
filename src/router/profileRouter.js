const express = require('express');
const { updateProfile } = require('../Controller/EditProfile');
const upload = require('../middlewares/multer');

const router = express.Router();

router.put("/updateProfile/:uid", upload.single("file"), updateProfile);

module.exports = router;
