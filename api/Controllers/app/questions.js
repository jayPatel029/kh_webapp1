const { pool } = require("../../databaseConn/database.js");

const fetchQuestions = async (req, res) => {
  try {
    // Fetch questions related to the 'Generic Profile'
    const genericQuestionsQuery =
      "SELECT * FROM questions WHERE ailment_name_en = 'Generic Profile'";
    const genericQuestions = await pool.execute(genericQuestionsQuery);

    // Fetch ailments related to the user ID
    const { userId } = req.body;
    const ailmentsQuery = `SELECT * FROM ailment_patient WHERE patient_id = ${userId}`;
    const ailments = await pool.execute(ailmentsQuery);

    let transformedData = {};

    // Process questions for 'Generic Profile'
    transformedData["Generic Profile"] = {
      ailmentID: 0, // Adjust the ailmentID as needed
      ailmentName: "Generic Profile",
      questions: genericQuestions.map((question) => ({
        questionID: question.id,
        question: question.name,
        questionType: question.type,
        answer: "",
        option: question.options || "",
      })),
    };

    // Iterate over each ailment
    await Promise.all(
      ailments.map(async (ailment) => {
        const { ailment_id } = ailment;

        // Fetch ailment_name_en based on ailment_id
        const ailmentNameQuery = `SELECT name FROM ailments WHERE id = ${ailment_id}`;
        const ailmentNameResult = await pool.execute(ailmentNameQuery);
        const ailmentName = ailmentNameResult[0].name;

        // Fetch questions based on ailment name
        const questionsQuery = `SELECT * FROM questions WHERE ailment_name_en = '${ailmentName}'`;
        const questions = await pool.execute(questionsQuery);

        // Add questions to transformedData
        transformedData[ailmentName] = {
          ailmentID: ailment_id,
          ailmentName: ailmentName,
          questions: questions.map((question) => ({
            questionID: question.id,
            question: question.name,
            questionType: question.type,
            answer: "",
            option: question.options || "",
          })),
        };
      })
    );

    const finalData = Object.values(transformedData);

    res.status(200).json({
      result: true,
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const answerQuestion = async (req, res) => {
  console.log("answer question request");
  try {
    const { userID, answers } = req.body;
    for (var i of answers) {
      const res = await pool.query(
        `INSERT INTO user_responses (question_id, user_id, response) VALUES ('${i["questionID"]}', '${userID}', '${i["answer"]}');`
      );
    }
    res.status(200).json({
      result: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  fetchQuestions,
  answerQuestion,
};
