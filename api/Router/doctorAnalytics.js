const router = require("express").Router();
const { getPatientByAge, getPatientByGender, getAppointmentsByDate, getPercentageReturn, getAdherenceMedicine } = require("../Controllers/DoctorAnalytics.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.get("/getPatientsByAge",verifyToken,getPatientByAge);
router.get("/getPatientsByGender",verifyToken,getPatientByGender);
router.get("/getPatientsByDoctorId",verifyToken,getAppointmentsByDate);
router.get("/getPercentageReturn",verifyToken,getPercentageReturn);
router.get("/getAdherenceMedicine",verifyToken,getAdherenceMedicine);

module.exports = router;
