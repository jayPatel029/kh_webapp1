const express = require('express');
const router = express.Router();
const {
  getChatId,
  getAllChats,
  sendMessage,
  getMessages,
  getAllByEMailChats, getSWChats, getSWMessages
} = require('../Controllers/Chat.js');
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post('/getId',verifyToken, getChatId);
router.get('/:pid',verifyToken, getAllChats);
router.get('/admin/:pid',verifyToken, getAllByEMailChats);
router.post('/message/',verifyToken, sendMessage);
router.get('/message/:chatId',verifyToken, getMessages);
router.get('/messageSW/:chatId',verifyToken, getSWMessages);
router.post('/adminSW/:pid',verifyToken, getSWChats);


module.exports = router;
