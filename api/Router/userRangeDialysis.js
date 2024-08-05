const { setRange, getRange } = require("../Controllers/UserRangeDialysis");
const router = require("express").Router();
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/setRange", verifyToken,setRange);
router.get("/getRange",verifyToken, getRange);

module.exports = router;
