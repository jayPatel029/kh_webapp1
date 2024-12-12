const router = require("express").Router();
const { get } = require("http");
const {
  getPatients,
  AddPatient,
  updatePatientProgram,
  deletePatient,
  getPatientById,
  getPatientMedicalTeam,
  getPatientAdminTeam,
  getNamebyId,
  updatePatientProfile,
  updatePatientAilment,
  updatePatientGFR,
  updateDryWeight,
  getPatientAilments,
  updateMedicalTeam,
  updateAdminTeam,
  removeAdminFromPatient,
  getDeletdPatients,
} = require("../Controllers/Patient.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");
const { downloadLog } = require("../Controllers/log.js");

router.get("/getPatients", verifyToken, getPatients);
router.get("/getDeletdPatients", verifyToken, getDeletdPatients);
router.post("/AddPatient", AddPatient);
router.put("/updateProgram", updatePatientProgram);
router.get("/getPatient/:id", getPatientById);
router.get("/getMedicalTeam/:id", getPatientMedicalTeam);
router.get("/getAdminTeam/:id", getPatientAdminTeam);
router.delete("/deletePatient/:id", deletePatient);
router.get("/getName/:id", getNamebyId);
router.put("/updatePatient", updatePatientProfile);
router.put("/updateAilments", updatePatientAilment);
router.put("/updateGFR", updatePatientGFR);
router.put("/updateDryWeight", updateDryWeight);
router.get("/getAilments/:id", getPatientAilments);
router.put("/updateMedical/:id", updateMedicalTeam);
router.put("/updateAdmin/:id", updateAdminTeam);
router.delete("/removeAdmin/:id", removeAdminFromPatient);
router.get("/patientLog", downloadLog);

module.exports = router;
