const router = require("express").Router();

const {
  addDailyReading,
  getDailyReadings,
  getDialysisReadings,
  addDialysisReading,
  modifyDailyReadingRange,
  modifyDialysisReadingRange,
  postBulkDailyReadings,
  deleteDailyReading,
  deleteDialysisReading,
  updateDailyReading,
  updateDialysisReading,
  getAllUserReadingsByPid
} = require("../Controllers/readings");
const { verifyToken } = require("../Helpers/middlewares/roles");

router.get("/getDailyReadings",verifyToken, getDailyReadings);
router.post("/addDailyReadings",verifyToken, addDailyReading);
router.post("/modifyDailyReadingsRange",verifyToken, modifyDailyReadingRange);
router.get("/getDialysisReadings",verifyToken, getDialysisReadings);
router.post("/addDialysisReadings",verifyToken, addDialysisReading);
router.post("/modifyDialysisReadingsRange",verifyToken, modifyDialysisReadingRange);
router.post("/postBulkDailyReadings",verifyToken, postBulkDailyReadings);
router.delete("/deleteDailyReading/:id",verifyToken, deleteDailyReading);
router.delete("/deleteDialysisReading/:id",verifyToken, deleteDialysisReading);
router.put("/updateDailyReading",verifyToken, updateDailyReading);
router.put("/updateDialysisReading",verifyToken, updateDialysisReading);
router.get("/getAllUserReadingsByPid/:pid",verifyToken, getAllUserReadingsByPid);

module.exports = router;