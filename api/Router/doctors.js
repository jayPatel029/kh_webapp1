const router = require("express").Router();
const {
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  getDoctorNamebyId,
  getDoctorIdbyEmail,
  getDoctorsForChat
} = require("../Controllers/doctors");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/",verifyToken, createDoctor);
router.get("/getDoctors",verifyToken, getDoctors);
router.get("/getDoctorsChat/:pid",verifyToken, getDoctorsForChat);
router.put("/:id",verifyToken, updateDoctor);
router.delete("/:id",verifyToken, deleteDoctor);
router.get("/name/:id",verifyToken, getDoctorNamebyId);
router.post("/byEmail/id",verifyToken, getDoctorIdbyEmail);

module.exports = router;
