const router = require("express").Router();
const { get } = require("http");
const {
  getPatientData,
  getPatientAllData,
  canDoctorExport,
  PdfText,
  addLabTestCSV,
  canRecieveUpdates,
} = require("../Controllers/PatientData.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.get("/export/:id",verifyToken, getPatientData);
router.get("/export",verifyToken, getPatientAllData);
router.get("/canexport",verifyToken, canDoctorExport);
router.get("/canReceive",verifyToken, canRecieveUpdates);
router.get("/extractTextFromPdf",verifyToken,PdfText)
router.post("/extractTextFromCsv",verifyToken,addLabTestCSV)

module.exports = router;
