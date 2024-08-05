const router = require('express').Router();
const {getRoles,addRole,getRoleByName, getUserRole, updateRole,deleteRole,isDoctor} = require("../Controllers/Roles.js")
const { verifyToken } = require("../Helpers/middlewares/roles.js");
router.get("/",verifyToken, getRoles)
router.post("/",verifyToken, addRole)
router.get("/byName/:role_name",verifyToken, getRoleByName)
router.put("/byName/:role_name",verifyToken, updateRole)
router.get("/identifyrole/",verifyToken, getUserRole)
router.delete("/byName/:role_name",verifyToken, deleteRole)
router.get("/isDoctor/",verifyToken, isDoctor)


module.exports = router;