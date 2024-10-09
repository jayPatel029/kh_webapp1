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
router.delete("/delete",verifyToken, DeleteGraphReading);
router.get("/get",verifyToken, getReadingsByPatientAndQuestionGraph);
router.get("/getGraph",verifyToken, getReadingsByPatientAndQuestionGraph);

module.exports = router;
