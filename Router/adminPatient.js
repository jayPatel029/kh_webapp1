const router = require("express").Router();
const { verifyToken } = require("../Helpers/middlewares/roles.js");
const {
  getAdminData,
  addAdminToPatient,
  deleteAssignedAdmin,
} = require("../Controllers/AdminPatient.js");

router.get("/getAdmin/:id",verifyToken, getAdminData);
router.post("/addAdmin/:id",verifyToken, addAdminToPatient);
router.delete("/deleteAdmin/:id",verifyToken, deleteAssignedAdmin);
module.exports = router;
