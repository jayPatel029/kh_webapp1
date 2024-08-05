const router = require("express").Router();
const {
  getAilments,
  getAilmentbyName,
  addAilment,
  deleteAilment,
  updateAilment,
  getAilmentsByLanguage,
} = require("../Controllers/Ailment.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.get("/",verifyToken, getAilments);
router.get("/:lang",verifyToken, getAilmentsByLanguage);
router.get("/getAilmentByName/:name",verifyToken, getAilmentbyName);
router.post("/addAilment",verifyToken, addAilment);
router.delete("/deleteAilment/:id",verifyToken, deleteAilment);
router.put("/updateAilment/:id",verifyToken, updateAilment);

module.exports = router;
