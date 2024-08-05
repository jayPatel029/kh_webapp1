const router = require("express").Router();
const {
  saveResponses,
  fetchUserResponse,
} = require("../Controllers/UserResponses.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");


router.post("/save",verifyToken, saveResponses);
router.get("/getResponses",verifyToken, fetchUserResponse);
module.exports = router;
