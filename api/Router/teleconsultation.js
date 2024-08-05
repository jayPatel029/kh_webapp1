const router = require('express').Router();
const { verifyToken} = require("../Helpers/middlewares/roles.js");
const {
    bookAppointment,
    getAllAppointments
}
= require('../Controllers/Teleconsultation.js')

router.post("/bookAppointment",verifyToken,bookAppointment)
router.get("/getAllAppointmentsById",verifyToken,getAllAppointments)

module.exports = router;