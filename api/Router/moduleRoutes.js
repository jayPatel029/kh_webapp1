const express = require('express');
const router = express.Router();

const moduleController = require('../Controllers/moduleConnection');


router.post('/connectDoctor', moduleController.connectDoctor);


router.post('/connectPatient', moduleController.connectPatient);

router.get('/getPresc', moduleController.getPatientPrescriptions);

router.get('/getLabR', moduleController.getPatientLabReports);

router.get('/getVitals', moduleController.getPatientVitals);

module.exports = router;