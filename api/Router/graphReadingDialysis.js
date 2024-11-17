const {
  AddGraphReading,
  getReadingsByPatientAndQuestion,
  getReadingsByPatientAndQuestionGraph,
  updateGraphReading,
  DeleteGraphReading,
} = require("../Controllers/GraphReadingDialysis");

const router = require("express").Router();
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/add",verifyToken, AddGraphReading);
router.post("/update",verifyToken, updateGraphReading);
router.post("/delete",verifyToken, DeleteGraphReading);
router.get("/get",verifyToken, getReadingsByPatientAndQuestion)
router.get("/getGraph",verifyToken, getReadingsByPatientAndQuestionGraph);

module.exports = router;
