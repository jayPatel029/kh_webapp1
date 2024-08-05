const express = require("express");
const router = express.Router();
const {
  addQuestion,
  removeQuestion,
  fetchQuestions,
  updateQuestion,
  fetchQuestionsByType,
  generalParametersByType,
  dialysisParametersByType,
  generalParametersByTypeWithResponse,
} = require("../Controllers/questionsController");
const { verifyToken } = require("../Helpers/middlewares/roles");

router.post("/",verifyToken, addQuestion);
router.delete("/:id",verifyToken, removeQuestion);
router.get("/",verifyToken, fetchQuestions);
router.put("/:id",verifyToken, updateQuestion);
router.get("/:type",verifyToken, fetchQuestionsByType);
router.get("/generalParameter/fetchQuestions",verifyToken, generalParametersByType);
router.get("/dialysisParameter/:type",verifyToken, dialysisParametersByType);
router.get(
  "/generalParameter/fetchResponse",verifyToken,
  generalParametersByTypeWithResponse
);

module.exports = router;
