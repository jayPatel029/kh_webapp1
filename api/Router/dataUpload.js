const express = require("express");
const multer = require("multer");
const uploadController = require("../Controllers/dataUpload");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), uploadController.uploadFile);
router.post("/files", upload.array("files"), uploadController.uploadFiles);

module.exports = router;
