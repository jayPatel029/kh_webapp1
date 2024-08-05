const router = require('express').Router();

// Importing the controller
const {AddDailyReadingsAlertsAPI,AddDialysisReadingsAlertsAPI,updateIsRead} = require("../Controllers/DailyReadingsAlerts.js");

const { verifyToken } = require("../Helpers/middlewares/roles.js");

// Routes
router.post('/AddDailyReadingsAlerts',verifyToken, AddDailyReadingsAlertsAPI);
router.post('/AddDialysisReadingsAlerts',verifyToken, AddDialysisReadingsAlertsAPI);
router.post('/updateIsRead',verifyToken, updateIsRead);

module.exports = router;