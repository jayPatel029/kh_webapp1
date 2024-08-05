const {
  AddGraphReading,
  getReadingsByPatientAndQuestion,
} = require("../Controllers/GraphReadingDialysis");

const router = require("express").Router();
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/add",verifyToken, AddGraphReading);
router.get("/get",verifyToken, getReadingsByPatientAndQuestion);

module.exports = router;
