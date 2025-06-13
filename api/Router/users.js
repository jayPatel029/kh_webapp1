const router = require("express").Router();
const {
  getUsers,
  getUsersbyRole,
  getTotalUsers,
  getUserbyEmail,
  updateUser,
  deleteUser,
  getTotalUsersThisWeek,
  isDoctor,
  getUsersAssignedToPatient,
  getDoctorsAssignedToPatient,
  getidbyEmail,
  getUserbyEmailDoctor,
  getTotalUsersThisWeekPSadmin,
  getUsersAdmins,
} = require("../Controllers/Users.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.get("/",verifyToken, getUsers);
router.get("/byRole/:role",verifyToken, getUsersbyRole);
router.get("/admins",verifyToken, getUsersAdmins);
router.get("/total",verifyToken, getTotalUsers);
router.get("/totalThisWeek",verifyToken, getTotalUsersThisWeek);
router.get("/totalThisWeekSub",verifyToken, getTotalUsersThisWeekPSadmin);
router.get("/email/:email", getUserbyEmail);
router.put("/:email", updateUser);
router.delete("/:email", deleteUser);
router.get("/isDoctor",verifyToken, isDoctor);
router.get("/assignedToPatient/:id",verifyToken, getUsersAssignedToPatient);
router.get("/docAssignedToPatient/:id",verifyToken, getDoctorsAssignedToPatient);
router.post("/byEmail/id",verifyToken, getidbyEmail);
router.get("/email/doctor/:email", getUserbyEmailDoctor);
module.exports = router;
