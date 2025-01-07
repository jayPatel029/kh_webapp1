const {
  getAlarmOfPatient,
  insertAlarm,
  deleteAlarm,
} = require("../Controllers/app/alarm");
const {
  getDoctorCode,
  getDoctorMessages,
  getUnreadDoctorComments,
  markCommentAsRead,
} = require("../Controllers/app/doctor");
const { login,loginv2 } = require("../Controllers/app/login");
const {
  getAilmentList,
  getProfileDetails,
  updateUserAilment,
  updateToken,
  getAilmentsList,
} = require("../Controllers/app/patient");
const {
  addPrescriptionFromApp,
  getPrescriptionsByIdFromApp,
  fetchPrescriptionComments,
  addPrescriptionComment,
  deletePrescription,
} = require("../Controllers/app/prescription");
const multer = require("multer");
const {
  getRequisitionInApp,
  addRequisitionComment,
  fetchRequisitionComments,
} = require("../Controllers/app/requisition");
const {
  fetchQuestions,
  answerQuestion,
} = require("../Controllers/app/questions");
const {
  fetchUserLabReports,
  addLabReportFromApp,
  addReportComments,
  fetchReportComments,
  deleteLabReport,
} = require("../Controllers/app/reports");
const {
  fetchDailyParameters,
  answerDailyParameters,
  fetchDailyParametersById,
} = require("../Controllers/app/daily_health");
const {
  fetchDialysisParameters,
  answerDialysisParameters,
  fetchDialysisParametersById,
} = require("../Controllers/app/dialysis_health");
const { insertAlert } = require("../Controllers/app/appAlerts.js");
const {
  accountDeletionRequest,
  cancelAccountDeletionRequest,
  isAccountDeletionRequest,
} = require("../Controllers/app/delete_account_request.js");
const { submitUserFeedback } = require("../Controllers/app/feedback.js");
const { sendPushNotification } = require("../Controllers/app/notification.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");
const router = require("express").Router();
const {
  getPatientDietDetails,
  addDietComment,
  fetchDietComments,
} = require("../Controllers/app/diet_details.js");

// Set storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Destination folder for file uploads
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // Use original file name
//   },
// });
const upload = multer({ dest: "uploads/" });

// AUTH
router.post("/getAilmentList", getAilmentList);
router.post("/getAilmentsList", getAilmentsList);
router.post("/getProfileDetails", getProfileDetails);
router.post("/register/getDoctorCode", getDoctorCode);
router.post("/getDoctorMessages", getDoctorMessages);
router.post("/login", login);
router.post("/loginv2",loginv2 );
router.post("/pushTokenUpdate", updateToken);

// UPDATE
router.post("/updateUserAilments", updateUserAilment);
router.get("/getUnreadDoctorCmts",verifyToken,getUnreadDoctorComments);
router.post("/markCommentsAsRead", markCommentAsRead);
// ALARMS
router.post("/alarms/fetchAlarms", getAlarmOfPatient);
router.post("/alarms/insertAlarm", insertAlarm);
router.post("/alarms/deleteAlarm", deleteAlarm);

// PRESCRIPTION
router.post(
  "/prescription/addPrescription",
  upload.single("image"),
  addPrescriptionFromApp
);
router.post("/prescription/fetchPrescription", getPrescriptionsByIdFromApp);
router.post(
  "/prescription/fetchPrescriptionComments",
  fetchPrescriptionComments
);
router.post("/prescription/addPrescriptionComments", addPrescriptionComment);
router.post("/prescription/deletePrescription", deletePrescription);

// REQUISITION
router.post("/requisition/fetchRequisition", getRequisitionInApp);
router.post("/requisition/addRequisitionComments", addRequisitionComment);
router.post("/requisition/fetchRequisitionComments", fetchRequisitionComments);

// PROFILE QUESTIONS
router.post("/questions/getQuestions", fetchQuestions);
router.post("/questions/answerQuestions", answerQuestion);

// LAB REPORTS
router.post("/reports/userLabReports", fetchUserLabReports);
router.post(
  "/report/addLabReport",
  upload.single("image"),
  addLabReportFromApp
);
router.post("/report/addReportComments", addReportComments);
router.post("/report/fetchReportComments", fetchReportComments);
router.post("/report/deleteReport", deleteLabReport);

// DAILY PARAMETERS
router.post("/dailyHealth/getDailyHealthParams", fetchDailyParameters);
router.post(
  "/dailyHealth/submitDailyHealthParams",
  upload.single("image"),
  answerDailyParameters
);
router.post("/dailyHealth/fetchDailyParametersById", fetchDailyParametersById);

// DIALYSIS PARAMETERS
router.post("/dialysisHealth/getDialysisHealthParams", fetchDialysisParameters);
router.post(
  "/dialysisHealth/submitDialysisHealthParams",
  upload.single("image"),
  answerDialysisParameters
);

router.post(
  "/dialysisHealth/fetchDialysisParametersById",
  fetchDialysisParametersById
);
//diet
router.post("/dietdetails/fetchDietComments", fetchDietComments);
router.post("/dietdetails/getPatientDiet", getPatientDietDetails);
router.post("/dietdetails/addDietComment", addDietComment);
// APP ALERTS
router.post("/appAlerts/insertAlert", insertAlert);

// ACCOUNT DELETION
router.post("/isAccountDeletionRequest", isAccountDeletionRequest);
router.post("/deleteUserRequest", accountDeletionRequest);
router.post("/deleteAccountDeletionRequest", cancelAccountDeletionRequest);

// USER FEEDBACK
router.post("/userFeedback", submitUserFeedback);

router.post("/sendPushNotification" , sendPushNotification);

module.exports = router;
