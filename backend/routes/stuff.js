const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const stuffCtrl = require('../controllers/stuff');

router.get("/",auth, stuffCtrl.getAllThings)
router.post("/",auth, dtuffCtrl.createThing);
router.put("/",auth, stuffCtrl.modifyThing);
router.delete("/",auth, stuffCtrl.deleteThing);
router.get("/",auth, stuffCtrl.getOneThing);


module.exports = router;