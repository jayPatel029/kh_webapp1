const router = require('express').Router();
const { pushNotifs } = require('../Controllers/PushNotifs.js');

router.post('/pushNotifs', pushNotifs);

module.exports = router;