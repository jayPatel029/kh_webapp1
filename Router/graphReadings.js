const { 
AddGraphReading, 
getReadingsByPatientAndQuestion, 
getReadingsByPatientAndQuestionSysAndDys, 
AddGraphReadingSys, 
getSystolicId,
getReadingsByPatientAndQuestionSysAndDysDialysis, 
AddGraphReadingSysDia,
getSystolicIdDia,
} = require("../Controllers/GraphReadings");

const router = require("express").Router();
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/add",verifyToken, AddGraphReading);
router.post("/add/sys",verifyToken, AddGraphReadingSys);
router.get("/get",verifyToken, getReadingsByPatientAndQuestion);
router.get("/get/sys",verifyToken, getReadingsByPatientAndQuestionSysAndDys);
router.get("/get/sysid/:diastolicTitle",verifyToken,getSystolicId)

router.get("/get/dia/sys",verifyToken, getReadingsByPatientAndQuestionSysAndDysDialysis);
router.post("/add/dia/sys",verifyToken, AddGraphReadingSysDia);
router.get("/get/dia/sysid/:diastolicTitle",verifyToken,getSystolicIdDia)

module.exports = router;
