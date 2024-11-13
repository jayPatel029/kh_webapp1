const jwt = require("jsonwebtoken");
const { pool } = require("../databaseConn/database.js");
const {
  Question,
  QuestionTranslation,
  QuestionAilments,
} = require("../Models/questions");
const { Ailment } = require("../Models/ailment.js");

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      decoded.email,
    ]);

    if (users.role !== "Admin") {
      return res.status(403).json({ message: "User is not an admin" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { ailment, type, name, options, translations } = req.body;
    const question = await Question.create({
      type,
      name,
      options,
    });
    const ailmentsInserted = await ailment.map((al) => {
      if (al !== null) {
        QuestionAilments.create({
          question_id: question.id,
          ailment_id: al,
        });
      }
    });
    const translationsInserted = Object.entries(translations).map(
      ([language, translation]) => ({
        question_id: question.id,
        language_id: parseInt(language),
        name: translation,
      })
    );
    await QuestionTranslation.bulkCreate(translationsInserted);
    res.status(201).json({ message: "Question added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeQuestion = async (req, res) => {
  try {
    await QuestionTranslation.destroy({
      where: {
        question_id: req.params.id,
      },
    });
    await QuestionAilments.destroy({
      where: {
        question_id: req.params.id,
      },
    });
    await Question.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Question removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchQuestions = async (req, res) => {
  try {
    const result = await Question.findAll({
      include: [
        {
          model: QuestionTranslation,
        },
        {
          model: QuestionAilments,
          include: [
            {
              model: Ailment,
            },
          ],
        },
      ],
    });

    const filtered_result = result.map((ques) => {
      const ailments = ques.question_ailments.map((ailment) => {
        return { name: ailment.ailment.name, id: ailment.ailment.id };
      });
      delete ques.dataValues.question_ailments;
      return {
        ...ques.dataValues,
        ailments,
      };
    });
    res.json(filtered_result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { ailment, type, name, options, translations } = req.body;
    const question = await Question.update(
      {
        type,
        name,
        options,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    await QuestionAilments.destroy({
      where: {
        question_id: req.params.id,
      },
    });
    await QuestionTranslation.destroy({
      where: {
        question_id: req.params.id,
      },
    });
    const ailmentsInserted = await QuestionAilments.create({
      question_id: question.id,
      ailment_id: ailment,
    });
    const translationsInserted = Object.entries(translations).map(
      ([language, translation]) => ({
        dr_id: newReading.id,
        language_id: parseInt(language),
        title: translation,
      })
    );
    res.status(200).json({ message: "Question updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchQuestionsByType = async (req, res) => {
  const ailment = req.params.type;
  try {
    const questions = await pool.execute(
      `SELECT * FROM questions WHERE ailment_name_en='${ailment}';`
    );
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generalParametersByType = async (req, res)=>{
  try {
    const patientId=req.query.user
    if(!patientId){
      res.status(500).json("enter valid patient id!")
      return
    }
    const query1=`
    SELECT DISTINCT dr.*
    FROM daily_readings dr
    JOIN daily_reading_ailments dra ON dr.id = dra.dr_id
    JOIN ailment_patient ap ON dra.ailmentID = ap.ailment_id
    JOIN doctor_patients dp ON ap.patient_id = dp.patient_id
    WHERE dp.patient_id = ${patientId}
    AND dr.id IN (
        SELECT dailyReadingId
        FROM doctor_daily_readings
    );
    `
    

    var dailyReadingsResult = await pool.query(query1, [patientId]);

    const query2 = `select * from daily_readings where showUser =${patientId}`
    var customParams = await pool.query(query2);

    dailyReadingsResult=[...dailyReadingsResult,...customParams];

    for (const dailyReading of dailyReadingsResult) {
      const questionId = dailyReading.id;   
      const countQuery = `
          SELECT COUNT(*) AS response_count
          FROM graph_readings
          WHERE question_id = ${questionId} AND user_id = ${patientId};
      `;
  
      // Assuming pool.query returns a Promise
      const responseCountResult = await pool.query(countQuery);
      const responseCount = responseCountResult[0].response_count;
  
      dailyReading.responseCount = Number(responseCount);
  }

    res.status(200).json(dailyReadingsResult);
    
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" });
  }

}



const dialysisParametersByType = async (req, res)=>{
  try {
    const patientId=req.query.user
    if(!patientId){
      res.status(500).json("enter valid patient id!")
      return
    }
    const query1=`
    SELECT DISTINCT dr.*
    FROM dialysis_readings dr
    JOIN dialysis_reading_ailments dra ON dr.id = dra.dr_id
    JOIN ailment_patient ap ON dra.ailmentID = ap.ailment_id
    JOIN doctor_patients dp ON ap.patient_id = dp.patient_id
    WHERE dp.patient_id = ${patientId}
    AND dr.id IN (
        SELECT dialysisReadingId
        FROM doctor_dialysis_readings
    ) ORDER BY dr.isGraph DESC;
    `

    var dialysis_readings = await pool.query(query1, [patientId]);
    const query2 = `select * from dialysis_readings where showUser =${patientId}`
    var customParams = await pool.query(query2);

    dialysis_readings=[...dialysis_readings,...customParams];

    for (const dialysisReading of dialysis_readings) {
      const questionId = dialysisReading.id;   
      const countQuery = `
          SELECT COUNT(*) AS response_count
          FROM graph_readings_dialysis
          WHERE question_id = ${questionId} AND user_id = ${patientId};
      `;
  
      // Assuming pool.query returns a Promise
      const responseCountResult = await pool.query(countQuery);
      const responseCount = responseCountResult[0].response_count;
  
      dialysisReading.responseCount = Number(responseCount);
  }
    res.status(200).json(dialysis_readings);
    
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" });
  }

}

const generalParametersByTypeWithResponse = async (req, res) => {
  const ailment = req.query.ailment;
  const user = req.query.user_id;
  try {
    // Fetch questions for the specified user
    const questionsQuery = `
      SELECT * FROM questions;
    `;
    const questionsRows = await pool.execute(questionsQuery);
    // console.log(questionsRows)

    const questions = questionsRows.map((row) => ({
      ...row,
      response: "", // Initialize an empty string to store the response for each question
    }));

    // Fetch responses for each question
    for (const question of questions) {
      const responseQuery = `
        SELECT response FROM user_responses 
        WHERE question_id=${question.id} AND user_id=${user};
      `;
      const responseRows = await pool.execute(responseQuery);
      if (responseRows.length > 0) {
        // If response exists, append it to the corresponding question
        question.response = responseRows[0].response;
      }
    }

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: error.message,
    });
  }
};

module.exports = {
  addQuestion,
  removeQuestion,
  fetchQuestions,
  updateQuestion,
  fetchQuestionsByType,
  generalParametersByType,
  dialysisParametersByType,
  generalParametersByTypeWithResponse,
};
