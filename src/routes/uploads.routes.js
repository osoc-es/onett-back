const express = require("express");
const router = express.Router();
const upload_controller = require("../controllers/uploads.controller");
const multerUploader = require('../multerConfig.js');
//TEST ROUTE
router.get("/test", upload_controller.test);
router.post("/file", multerUploader.single('file'), upload_controller.uploadFile);

module.exports  = router;
