const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const { verifyToken } = require("../middleware/VerifyToken");
const uploadController = require("../controllers/UploadController");

router.post("/single", verifyToken, upload.single("image"), uploadController.uploadImage);
router.post("/multiple", verifyToken, upload.array("images", 10), uploadController.uploadMultipleImages);

module.exports = router;
