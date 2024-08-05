const router = require('express').Router();
const {getAdminAlerts,getDoctorAlerts, getSuperAdminExtraAlerts} = require("../Controllers/SortAlerts.js")
const {sendEmails} = require("../cronjob/AlertEmail.js")
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.get("/:admin_id", verifyToken,getAdminAlerts)
router.get("/superAdminAlerts/:admin_id", verifyToken,getSuperAdminExtraAlerts)
router.get("/doctor/:doctor_id", verifyToken,getDoctorAlerts)
router.get("/emails/sendEmails", verifyToken, sendEmails)


module.exports = router;