const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  insertDietDetails,
  getPatientDietDetails,
  deleteDietDetails,
  insertDietDetailsAdmin,
  getPatientDietDetailsAdmin,
} = require("../Controllers/DietDetails.js");

const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/insertDietDetails", upload.single("image"), insertDietDetails);
router.post("/insertDietDetailsAdmin",verifyToken, insertDietDetailsAdmin);
router.post("/getPatientDietDetails",verifyToken, getPatientDietDetails);
router.get("/getPatientDietDetailsAdmin/:id",verifyToken, getPatientDietDetailsAdmin);
router.delete("/deleteDietDetails/:id",verifyToken, deleteDietDetails);

module.exports = router;
