const router = require("express").Router();
const {
  getLabReportByPatient,
  getLabReports,
  addLabReport,
  deleteLabReport,
  getLabReportById,
  uploadBulkLabReportIndividual,
  fetchLabReadings,
  fetchLabReadingsResponse,
  addLabReadings,
  getRange
} = require("../Controllers/LabReports.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.get("/LabReadings",verifyToken,fetchLabReadings)
router.get("/responses",verifyToken,fetchLabReadingsResponse)
router.post("/addLabReading",verifyToken,addLabReadings)
router.get("/range",verifyToken,getRange)

router.get("/getLabReports/:id",verifyToken, getLabReports);
// router.get("/:patient",verifyToken, getLabReportByPatient);
router.post("/add",verifyToken, addLabReport);
router.delete("/:id",verifyToken, deleteLabReport);
router.get("/getLabReport/:id",verifyToken, getLabReportById);
router.delete("/deleteLabReport/:id",verifyToken, deleteLabReport);
router.post("/addBulkIndividual",verifyToken, uploadBulkLabReportIndividual);
router.get("/LabReadings",verifyToken,fetchLabReadings)



module.exports = router;
