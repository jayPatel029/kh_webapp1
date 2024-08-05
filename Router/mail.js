const {     sendMail, VerifyOtp } = require('../Controllers/Mail');
const router = require('express').Router();

router.post('/sentotp',sendMail)
router.post('/verifyOtp',VerifyOtp)

module.exports = router;