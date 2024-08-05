const router = require("express").Router();
const {
  getPrivateData,
  register,
  login,
  changePassword,
} = require("../Controllers/Auth.js");

router.post("/register", register);
router.post("/login", login);
router.get("/private", getPrivateData);
router.post("/changePassword", changePassword);

module.exports = router;
