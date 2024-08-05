const { setRange, getRange, getRangeSys, setRangeSys,getRangeSysDia,setRangeSysDia } = require('../Controllers/UserRange');
const router = require('express').Router();
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/setRange",verifyToken, setRange)
router.post("/setRange/sys",verifyToken, setRangeSys)
router.get("/getRange",verifyToken, getRange)
router.get("/getRange/sys",verifyToken, getRangeSys)
router.get("/getRange/dia/sys",verifyToken, getRangeSysDia)
router.post("/setRange/dia/sys",verifyToken, setRangeSysDia)


module.exports = router;