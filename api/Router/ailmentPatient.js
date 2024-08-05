const router = require("express").Router();
const { verifyToken } = require("../Helpers/middlewares/roles.js");


const { fetchAilmentId } = require("../Controllers/ailmentPatient.js");

router.get("/:id",verifyToken, fetchAilmentId);
module.exports = router;
