const router = require("express").Router();

const {
  deletePrescription,
  addPrescriptionById,
  getPrescriptionsById,
  addComment,
} = require("../Controllers/Prescription.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.delete("/deletePrescription/:id",verifyToken, deletePrescription);
router.post("/addPrescription",verifyToken, addPrescriptionById);
router.get("/getPrescription/:id",verifyToken, getPrescriptionsById);
router.post("/addComment/:id",verifyToken, addComment);

module.exports = router;
