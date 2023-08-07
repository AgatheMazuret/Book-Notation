const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')
const stuffCtrl = require('../controllers/stuff');

router.get("/",auth, stuffCtrl.getAllThings)
router.post("/",auth, multer, stuffCtrl.createThing);
router.put("/",auth, multer, stuffCtrl.modifyThing);
router.delete("/",auth, stuffCtrl.deleteThing);
router.get("/",auth, stuffCtrl.getOneThing);


module.exports = router;