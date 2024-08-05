const { be } = require("date-fns/locale");
const { pool } = require("../databaseConn/database.js");
const { AddDialysisReadingsAlerts } = require("./DailyReadingsAlerts.js");

const AddGraphReading = async (req, res, next) => {
  const { question_id, user_id, date, readings } = req.body;

  const currentDate = new Date().toISOString().slice(0, 10); // Get current date in 'YYYY-MM-DD' format
  const currentTime = new Date().toISOString().slice(11, 19); // Get current time in 'HH:mm:ss' format
  const serverTimestamp = `${currentDate} ${currentTime}`;

  // Check if the combination of question_id, user_id, and date already exists
  const checkQuery = `
      SELECT * FROM graph_readings_dialysis 
      WHERE question_id = '${question_id}' 
      AND user_id = '${user_id}' 
      AND date = '${date} ${currentTime}' 
    `;

  let result;
  try {
    result = await pool.query(checkQuery);
    // console.log(result.length)
    if (result.length > 0) {
      // If the combination already exists, return error response
      return res.status(201).json({
        success: false,
        data: "Readings for this date already exist",
      });
    }

    // If the combination doesn't exist, proceed with inserting the data
    const insertQuery = `
        INSERT INTO graph_readings_dialysis (question_id, user_id, date, readings)
        VALUES ('${question_id}','${user_id}','${date} ${currentTime}' ,'${readings}')
      `;
    await pool.query(insertQuery);

    const title_query = await pool.execute(
      `
       SELECT title FROM dialysis_readings where id = ${question_id}
      `
    )
    const questionTitle = title_query[0].title;

    const excludedTitles = ["weight before dialysis", "weight after dialysis"];

    // Check if the title is not in the excluded list before creating alerts
    if (!excludedTitles.includes(questionTitle.toLowerCase().trim())) {
      await AddDialysisReadingsAlerts(question_id, user_id, date, readings);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data: "Readings Added Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: "Error while Adding Readings",
    });
  }
};

const getReadingsByPatientAndQuestion = async (req, res, next) => {
  const { question_id, user_id } = req.query;
  // console.log("dialysis readings!!",question_id,user_id)

  try {
    const checkQuery = `SELECT * FROM dialysis_readings where id= ${question_id}`;
    const result = await pool.query(checkQuery);

    if (result[0].title.toLowerCase().includes("interdialytic weight")) {
      const response = await getReadingsInterDialyticsResponse(question_id, user_id);
      return res.status(200).json({
        success: true,
        data: response,
      });

    }
  } catch (error) {
    console.log(error);
  }

  const query = `
    SELECT date,readings FROM graph_readings_dialysis
    WHERE question_id = ${question_id} AND user_id = ${user_id}
  `;

  try {
    const result = await pool.query(query);
    const questions = result;

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching questions",
    });
  }
};

const getReadingsInterDialyticsResponse = async (question_id, user_id) => {
  try {
    // Step 1: Find reading ids for 'weight before dialysis' and 'weight after dialysis'
    const beforeDialysisQuery = `
      SELECT id
      FROM dialysis_readings
      WHERE LOWER(title) = 'weight before dialysis'
    `;
    const afterDialysisQuery = `
      SELECT id
      FROM dialysis_readings
      WHERE LOWER(title) = 'weight after dialysis'
    `;

    const [beforeResult, afterResult] = await Promise.all([
      pool.query(beforeDialysisQuery),
      pool.query(afterDialysisQuery)
    ]);

    const beforeReadingId = beforeResult[0].id;
    const afterReadingId = afterResult[0].id;

    // Step 2: Find responses for 'weight before dialysis' and 'weight after dialysis'
    const beforeResponseQuery = `
      SELECT date, readings
      FROM graph_readings_dialysis
      WHERE question_id = ${beforeReadingId} AND user_id = ${user_id}
      ORDER BY date
    `;
    const afterResponseQuery = `
      SELECT date, readings
      FROM graph_readings_dialysis
      WHERE question_id = ${afterReadingId} AND user_id = ${user_id}
      ORDER BY date
    `;

    const [beforeResponseResult, afterResponseResult] = await Promise.all([
      pool.query(beforeResponseQuery),
      pool.query(afterResponseQuery)
    ]);

    // console.log("beforeResponseResult",beforeResponseResult)
    // console.log("afterResponseResult",afterResponseResult)  

    // Step 3: Calculate interdialytic weight gain
    const interDialyticResponses = [];
    for (let i = 1; i < beforeResponseResult.length; i++) {
      const currentBefore = beforeResponseResult[i];
      const previousAfter = afterResponseResult[i - 1];

      if (previousAfter && currentBefore) {
        const idwg = currentBefore.readings - previousAfter.readings;
        interDialyticResponses.push({
          date: currentBefore.date,
          readings: idwg
        });
      }
    }

    return interDialyticResponses;
  } catch (error) {
    console.error("Error fetching interdialytic responses:", error);
    throw error;
  }
};


module.exports = {
  AddGraphReading,
  getReadingsByPatientAndQuestion,
};
