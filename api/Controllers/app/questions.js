const { pool } = require("../../databaseConn/database.js");
/*
!changes here!!
changed line 10 and 44 
in db tbale patients the col. name is "name" not "ailment_name_en"

*/


// const fetchQuestions = async (req, res) => {
//   try {
//     // Fetch questions related to the 'Generic Profile'
//     const genericQuestionsQuery =
//       "SELECT * FROM questions WHERE name = 'Generic Profile'";
//     const genericQuestions = await pool.execute(genericQuestionsQuery);

//     // Fetch ailments related to the user ID
//     const { userId } = req.body;
//     const ailmentsQuery = `SELECT * FROM ailment_patient WHERE patient_id = ${userId}`;
//     const ailments = await pool.execute(ailmentsQuery);

//     let transformedData = {};

//     // Process questions for 'Generic Profile'
//     transformedData["Generic Profile"] = {
//       ailmentID: 0, // Adjust the ailmentID as needed
//       ailmentName: "Generic Profile",
//       questions: genericQuestions.map((question) => ({
//         questionID: question.id,
//         question: question.name,
//         questionType: question.type,
//         answer: "",
//         option: question.options || "",
//       })),
//     };

//     // Iterate over each ailment
//     await Promise.all(
//       ailments.map(async (ailment) => {
//         const { ailment_id } = ailment;

//         // Fetch ailment_name_en based on ailment_id
//         const ailmentNameQuery = `SELECT name FROM ailments WHERE id = ${ailment_id}`;
//         const ailmentNameResult = await pool.execute(ailmentNameQuery);
//         const ailmentName = ailmentNameResult[0].name;

//         // Fetch questions based on ailment name
//         const questionsQuery = `SELECT * FROM questions WHERE name = '${ailmentName}'`;
//         const questions = await pool.execute(questionsQuery);

//         // Add questions to transformedData
//         transformedData[ailmentName] = {
//           ailmentID: ailment_id,
//           ailmentName: ailmentName,
//           questions: questions.map((question) => ({
//             questionID: question.id,
//             question: question.name,
//             questionType: question.type,
//             answer: "",
//             option: question.options || "",
//           })),
//         };
//       })
//     );

//     const finalData = Object.values(transformedData);

//     res.status(200).json({
//       result: true,
//       data: finalData,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



const fetchQuestions = async (req, res) => {
  try {
    // generic_questions..ailemntsId==0
    const genericQuestionsQuery = `
      SELECT q.id, q.name, q.type, q.options 
      FROM questions q
      INNER JOIN question_ailments qa ON q.id = qa.question_id
      WHERE qa.ailment_id = 0`;
    const genericQuestions = await pool.execute(genericQuestionsQuery);

    const { userId } = req.body;
    const ailmentsQuery = `SELECT ailment_id FROM ailment_patient WHERE patient_id = ${userId}`;
    const ailments = await pool.execute(ailmentsQuery);

    let transformedData = {};

    transformedData["Generic Profile"] = {
      ailmentID: 0,  
      ailmentName: "Generic Profile", 
      questions: genericQuestions.map((question) => ({
        questionID: question.id,
        question: question.name,
        questionType: question.type,
        answer: "",
        option: question.options || "",
      })),
    };

 
    await Promise.all(
      ailments.map(async (ailment) => {
        const { ailment_id } = ailment;

        let ailmentName = "";
        if (ailment_id !== 0) {
          const ailmentNameQuery = `SELECT name FROM ailments WHERE id = ${ailment_id}`;
          const ailmentNameResult = await pool.execute(ailmentNameQuery);
          ailmentName = ailmentNameResult[0]?.name || `Ailment ${ailment_id}`;  
        } else {
          ailmentName = "Generic Profile"; 
        }

        const questionsQuery = `
          SELECT q.id, q.name, q.type, q.options
          FROM questions q
          INNER JOIN question_ailments qa ON q.id = qa.question_id
          WHERE qa.ailment_id = ${ailment_id}`;
        const questions = await pool.execute(questionsQuery);

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

    console.log(finalData);

    res.status(200).json({
      result: true,
      data: finalData,
    });
  } catch (error) {
    console.log(error);
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
