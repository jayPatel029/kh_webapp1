const router = require("express").Router();
const {
  insertContactUs,
  getAllContactUs,
  getContactUsById,
  deleteContactUs,
} = require("../Controllers/contactus.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/",verifyToken, insertContactUs);
router.get("/",verifyToken, getAllContactUs);
router.get("/:id",verifyToken, getContactUsById);
router.delete("/:id",verifyToken, deleteContactUs);

module.exports = router;
