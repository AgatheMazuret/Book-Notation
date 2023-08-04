const express = require('express');
const router = express.Router();
const Thing = require("../models/Things");

router.post("/", dtuffCtrl.createThing);
router.put("/", stuffCtrl.modifyThing);
router.delete("/", stuffCtrl.deleteThing);
router.get("/", stuffCtrl.getOneThing);
router.get("/", stuffCtrl.getAllThings)

module.exports = router;