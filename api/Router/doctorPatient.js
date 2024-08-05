const router = require("express").Router();
const {
  getDoctorData,
  deleteAssignedDoctor,
  addDoctorToPatient,
} = require("../Controllers/DoctorPatient.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.get("/getDoctor/:id",verifyToken, getDoctorData);
router.post("/addDoctor/:id",verifyToken, addDoctorToPatient);
router.delete("/deleteDoctor/:id",verifyToken, deleteAssignedDoctor);
module.exports = router;
