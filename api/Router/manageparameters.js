const router = require("express").Router();

const { addReading } = require("../Controllers/ManageParameters");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/addReading",verifyToken, addReading);

module.exports = router;
