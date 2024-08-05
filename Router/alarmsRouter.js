const router = require("express").Router();

const {
  insertAlarm,
  getAllAlarms,
  deleteAlarm,
  updateAlarm,
  getAlarmbyId,
  getAlarmbyPatientId,
  updateReason,
  answerAlarm,
} = require("../Controllers/Alarms");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/",verifyToken, insertAlarm);
router.get("/",verifyToken, getAllAlarms);
router.delete("/:id",verifyToken, deleteAlarm);
router.put("/:id",verifyToken, updateAlarm);
router.get("/byId/:id",verifyToken, getAlarmbyId);
router.get("/byPatientId/:id",verifyToken, getAlarmbyPatientId);
router.put("/updateReason/:id",verifyToken, updateReason);
router.post("/answerAlarm",verifyToken, answerAlarm);

module.exports = router;
