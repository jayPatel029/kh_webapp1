const router = require('express').Router();

const {getAlerts,
     getAlertbyType,
    createDoctorMessageToAdminAlert,
    createNewEnrollmentAlert,
    createNewProgramEnrollmentAlert,
    createNewPrescriptionAlarmAlert,
    createPrescriptionDisapprovedAlarmAlert,
    createChangeInProgramAlert,
    createNewLabReportAlert,
    createNewRequisitionAlert,
    createDeleteAccountAlert, 
    createPrescriptionNotViewedAlert,approveOrDisapprovePrescription,getAlertbyId,
    deleAlertbyID,
    apporoveAlert,
    approveAllAlerts,
    dissapproveAlert,
    dissapproveAllAlerts,
    createNewPrescriptionAlert,
    updateIsReadAlert,
    createContactUsAlert
} = require('../Controllers/Alerts.js');
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.get('/',verifyToken, getAlerts);
router.get('/byType/:type',verifyToken, getAlertbyType);
router.post('/doctorMessageToAdmin',verifyToken, createDoctorMessageToAdminAlert);
router.post('/newEnrollment',verifyToken, createNewEnrollmentAlert);
router.post('/newProgramEnrollment',verifyToken, createNewProgramEnrollmentAlert);
router.post('/newPrescriptionAlarm',verifyToken, createNewPrescriptionAlarmAlert);
router.post('/prescriptionDisapprovedAlarm',verifyToken, createPrescriptionDisapprovedAlarmAlert);
router.post('/changeInProgram',verifyToken, createChangeInProgramAlert);
router.post('/newLabReport',verifyToken, createNewLabReportAlert);
router.post('/newRequisition',verifyToken, createNewRequisitionAlert);
router.post('/deleteAccount',verifyToken, createDeleteAccountAlert);
router.post('/prescriptionNotViewed',verifyToken, createPrescriptionNotViewedAlert);
router.put('/approveOrDisapprovePrescription',verifyToken, approveOrDisapprovePrescription);
router.get('/byId/:id',verifyToken, getAlertbyId);
router.delete('/delete/:id',verifyToken, deleAlertbyID);
router.put('/approveAlert',verifyToken, apporoveAlert);
router.put('/approveAllAlerts',verifyToken, approveAllAlerts);
router.put('/disapproveAlert',verifyToken, dissapproveAlert);
router.put('/disapproveAllAlerts',verifyToken, dissapproveAllAlerts);
router.post('/newPrescription',verifyToken, createNewPrescriptionAlert);
router.post('/contactUs',verifyToken, createContactUsAlert);
router.put('/updateIsRead',verifyToken, updateIsReadAlert);



module.exports = router;