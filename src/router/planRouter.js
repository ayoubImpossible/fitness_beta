const express = require('express');
const {
  addPlanHandler,
  getPlansHandler,
  deletePlanByIdHandler,
 
} = require('../Controller/PlansController');
const { deletePlanById } = require('../models/PlansModel');


const router = express.Router();
router.post('/add/:userId', addPlanHandler);
router.get('/all/:userId', getPlansHandler);
router.delete('/delete/:id', deletePlanByIdHandler);
module.exports = router;
