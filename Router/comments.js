const router = require('express').Router();

const { getComments,
    addComment,
    getPatientComments,
    getDoctorComments,
updateReadTable} = require('../Controllers/Comment.js');
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post('/getComments',verifyToken, getComments);
router.post('/addComment',verifyToken, addComment);
router.post('/getPatientComments',verifyToken, getPatientComments);
router.post('/getDoctorComments',verifyToken, getDoctorComments);
router.post('/updateReadTable',verifyToken, updateReadTable);

module.exports = router;