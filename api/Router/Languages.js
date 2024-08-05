const router = require("express").Router();
const {
  insertLanguage,
  getAllLanguages,
  updateLanguage,
  deleteLanguage
} = require("../Controllers/Languages");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.post("/",verifyToken, insertLanguage);
router.get("/",verifyToken, getAllLanguages);
router.put("/:id",verifyToken, updateLanguage);
router.delete("/:id",verifyToken, deleteLanguage);
module.exports = router;
