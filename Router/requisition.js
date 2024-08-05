const router = require("express").Router();

const {
  getRequisition,
  // getRequisitions,
  addRequisition,
  updateRequisition,
  deleteRequisition,
  getRequisitionById,
} = require("../Controllers/Requisition.js");
const { verifyToken } = require("../Helpers/middlewares/roles.js");

router.get("/getRequisition/:id",verifyToken, getRequisition);
router.post("/add",verifyToken, addRequisition);
router.put("/:id",verifyToken, updateRequisition);
router.delete("/:id",verifyToken, deleteRequisition);
router.get("/byId/:id",verifyToken, getRequisitionById);

module.exports = router;
