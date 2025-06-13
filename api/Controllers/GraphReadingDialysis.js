const { be } = require("date-fns/locale");
const { pool } = require("../databaseConn/database.js");
const { AddDialysisReadingsAlerts } = require("./DailyReadingsAlerts.js");
const { UpdatePatientCondition } = require("./readings.js");

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
    if (result.length > 0) {
      return res.status(201).json({
        success: false,
        data: "Readings for this date already exist",
      });
    }

    // Proceed with fetching the title and condition of the question
    const titleQuery = await pool.execute(
      `SELECT title, \`condition\` FROM dialysis_readings WHERE id = ${question_id}`
    );
    const questionTitle = titleQuery[0].title;
    const questionCondition = titleQuery[0].condition;

    // If title is 'weight after dialysis', check if 'weight before dialysis' is recorded for the same date
    if (questionTitle.toLowerCase().trim() === "weight after dialysis") {
      const beforeWeightQuery = `
        SELECT * FROM graph_readings_dialysis 
        WHERE user_id = '${user_id}' 
        AND date = '${date} ${currentTime}' 
        AND question_id IN (
          SELECT id FROM dialysis_readings 
          WHERE title = 'weight before dialysis'
        )
      `;
      const beforeWeightResult = await pool.query(beforeWeightQuery);

      // Log if "weight before dialysis" is missing
      
    }

    // Insert the reading into the database
    const insertQuery = `
        INSERT INTO graph_readings_dialysis (question_id, user_id, date, readings)
        VALUES ('${question_id}', '${user_id}', '${date} ${currentTime}', '${readings}')
      `;
    await pool.query(insertQuery);

    const excludedTitles = ["weight before dialysis", "weight after dialysis"];
    if (!excludedTitles.includes(questionTitle.toLowerCase().trim())) {
      await AddDialysisReadingsAlerts(question_id, user_id, date, readings);
    }

    // Get all readings for the current date to determine patient condition
    const currentDateReadingsQuery = `
      SELECT dr.condition 
      FROM graph_readings_dialysis grd
      JOIN dialysis_readings dr ON grd.question_id = dr.id
      WHERE grd.user_id = '${user_id}' 
      AND DATE(grd.date) = '${currentDate}'
      AND dr.condition IS NOT NULL
    `;
    const currentDateReadings = await pool.query(currentDateReadingsQuery);
    
    // Extract conditions from readings
    const paramConditions = currentDateReadings.map(reading => reading.condition);
    // Add current reading's condition if it exists
    if (questionCondition) {
      paramConditions.push(questionCondition);
    }

    // Update patient condition based on all readings
    if (paramConditions.length > 0) {
      console.log("conditions are", paramConditions, user_id);
      const conditionUpdateResult = await UpdatePatientCondition(user_id, paramConditions);
      console.log("Condition update result:", conditionUpdateResult);
    }

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

const updateGraphReading = async (req, res, next) => {
  const { id,value } = req.body;

  // Get the current time for updating the timestamp
  
  // Check if the combination of question_id, user_id, and date exists
  const checkQuery = `
      SELECT * FROM graph_readings_dialysis 
      WHERE id = '${id}'
    `;

  try {
    const result = await pool.query(checkQuery);

    if (result.length === 0) {
      // If the combination doesn't exist, return error response
      return res.status(404).json({
        success: false,
        data: "No readings found for the provided date, user, and question",
      });
    }

    // Update the reading if the record exists
    const updateQuery = `
      UPDATE graph_readings_dialysis 
      SET readings = '${value}'
      WHERE id = '${id}'
    `;

    await pool.query(updateQuery);

    // Fetch the title to check for alert condition
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: "Readings Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: "Error while updating readings",
    });
  }
};

const DeleteGraphReading = async (req, res, next) => {
  const { id} = req.body;

  // Check if the record exists before attempting to delete it
  const checkQuery = `
      SELECT * FROM graph_readings_dialysis 
      where id = '${id}'
    `;

  try {
    const result = await pool.query(checkQuery);

    if (result.length === 0) {
      // If the record doesn't exist, return a 404 error response
      return res.status(404).json({
        success: false,
        data: "No readings found for the provided date, user, and question",
      });
    }

    // If the record exists, proceed to delete it
    const deleteQuery = `
      DELETE FROM graph_readings_dialysis 
      WHERE id = '${id}'
    `;

    await pool.query(deleteQuery);

    // Return a success response
    return res.status(200).json({
      success: true,
      data: "Readings Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: "Error while deleting readings",
    });
  }
};



const getReadingsByPatientAndQuestionGraph= async(req,res,next)=>{
  const { question_id, user_id } = req.query;
  // console.log("dialysis readings!!",question_id,user_id)

  try {
    const checkQuery = `SELECT * FROM dialysis_readings where id= ${question_id}`;
    const result = await pool.query(checkQuery);
    console.log("res",result[0].title)
    if (result[0].title.toLowerCase().includes("inter")) {
      const response = await getReadingsInterDialyticsResponseGraph(question_id, user_id);
      console.log("Response fromm",response)
      return res.status(200).json({
        success: true,
        data: response,
      });

    }
  } catch (error) {
    console.log(error);
  }

  const query = `
    SELECT date,readings,id FROM graph_readings_dialysis
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
}

const getReadingsByPatientAndQuestion = async (req, res, next) => {
  const { question_id, user_id } = req.query;
  // console.log("dialysis readings!!",question_id,user_id)

  try {
    const checkQuery = `SELECT * FROM dialysis_readings where id= ${question_id}`;
    const result = await pool.query(checkQuery);
    console.log("res",result[0].title)
    if (result[0].title.toLowerCase().includes("weight")) {
      const response = await getReadingsInterDialyticsResponse(question_id, user_id);
      console.log("Response fromm",response)
      return res.status(200).json({
        success: true,
        data: response,
      });

    }
  } catch (error) {
    console.log(error);
  }
  console.log()
  const query = `
    SELECT date,readings,id FROM graph_readings_dialysis
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
      SELECT date, readings,id
      FROM graph_readings_dialysis
      WHERE question_id = ${question_id} AND user_id = ${user_id}
      ORDER BY date
    `;


    const [beforeResponseResult] = await Promise.all([
      pool.query(beforeResponseQuery),
      
    ]);

    const interDialyticResponses = [];

    // Step 3: Calculate interdialytic weight gain
    for (let i = 0; i < beforeResponseResult.length; i++) {
      const currentBefore = beforeResponseResult[i];
      
      // Normalize the dates to compare only the date part (YYYY-MM-DD)
      const currentBeforeDate = new Date(currentBefore.date).toISOString().split('T')[0];
     

      if (currentBefore ) {
        const idwg = currentBefore.readings;
        interDialyticResponses.push({
          id:currentBefore.id,
          date: currentBeforeDate,
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

const getReadingsInterDialyticsResponseGraph = async (question_id, user_id) => {
  try {
    // Step 1: Get the reading IDs for 'weight before dialysis' and 'weight after dialysis'
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
    const interId = `
      SELECT id
      FROM dialysis_readings
      WHERE LOWER(title) = 'inter dialysis weight'
    `;
    const [beforeResult, afterResult, inter] = await Promise.all([
      pool.query(beforeDialysisQuery),
      pool.query(afterDialysisQuery),
      pool.query(interId)
    ]);

    const beforeReadingId = beforeResult[0].id;
    const afterReadingId = afterResult[0].id;
    const interReadingId = inter[0].id;

    // Step 2: Get all dialysis readings for the user
    const allDialysisReadingsQuery = `
      SELECT date, readings, question_id
      FROM graph_readings_dialysis
      WHERE user_id = ${user_id}
      ORDER BY date
    `;

    const allReadings = await pool.query(allDialysisReadingsQuery);

    // Create a map of dates and their corresponding readings
    const dateMap = {};
    const dialysisDates = new Set();

    // First, collect all dates where dialysis readings exist
    allReadings.forEach(reading => {
      const date = new Date(reading.date).toISOString().split('T')[0];
      dialysisDates.add(date);
      
      if (!dateMap[date]) {
        dateMap[date] = {
          before: null,
          after: null,
          hasOtherReadings: false
        };
      }

      if (reading.question_id === beforeReadingId) {
        dateMap[date].before = reading.readings;
      } else if (reading.question_id === afterReadingId) {
        dateMap[date].after = reading.readings;
      } else if (reading.question_id !== interReadingId) {
        dateMap[date].hasOtherReadings = true;
      }
    });

    const interDialyticResponses = [];
    const sortedDates = Array.from(dialysisDates).sort((a, b) => new Date(a) - new Date(b));

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const currentData = dateMap[currentDate];

      // Case 1: First day - can't calculate IDWG
      if (i === 0) {
        if (!currentData.before && !currentData.after) {
          if (currentData.hasOtherReadings) {
            interDialyticResponses.push({
              date: currentDate,
              readings: 'No weight reading found',
              error: 'Both before and after readings missing but other dialysis readings exist'
            });
          } else {
            interDialyticResponses.push({
              date: currentDate,
              readings: 'DT has failed to enter one/mul reading',
              error: 'No dialysis readings found for this date'
            });
          }
        } else if (!currentData.before) {
          interDialyticResponses.push({
            date: currentDate,
            readings: 'Previous "weight before" reading missing',
            error: 'Weight before dialysis is missing'
          });
        } else if (!currentData.after) {
          interDialyticResponses.push({
            date: currentDate,
            readings: 'Previous "weight after" reading missing',
            error: 'Weight after dialysis is missing'
          });
        } else {
          interDialyticResponses.push({
            date: currentDate,
            readings: 'First day - No previous reading for comparison',
            error: 'Cannot calculate IDWG for first day'
          });
        }
        continue;
      }

      // For subsequent days
      const previousDate = sortedDates[i - 1];
      const previousData = dateMap[previousDate];

      // Case 2: Both before and after readings missing
      if (!currentData.before && !currentData.after) {
        if (currentData.hasOtherReadings) {
          interDialyticResponses.push({
            date: currentDate,
            readings: 'No weight reading found',
            error: 'Both before and after readings missing but other dialysis readings exist'
          });
        } else {
          interDialyticResponses.push({
            date: currentDate,
            readings: 'DT has failed to enter one/multiple reading', // this alert to doc
            error: 'No dialysis readings found for this date'
          });
        }
        continue;
      }

      // Case 3: Only before reading is present
      if (currentData.before && !currentData.after) {
        if (!previousData.after) {
          interDialyticResponses.push({
            date: currentDate,
            readings: 'Previous "weight after dialysis" reading is missing',
            error: 'Cannot calculate IDWG - Previous weight after dialysis is missing'
          });
        } else {
          // We can plot this point since we have both current before and previous after
          const idwg = currentData.before - previousData.after;
          interDialyticResponses.push({
            date: currentDate,
            readings: idwg,
            error: 'After reading missing for current date'
          });
        }
        continue;
      }

      // Case 4: Only after reading is present
      if (!currentData.before && currentData.after) { // send DT alert for this case to doc
        interDialyticResponses.push({
          date: currentDate,
          readings: 'This session\'s "weight before dialysis" reading is missing',
          error: 'Weight before dialysis is missing'
        });
        continue;
      }

      // Case 5: Both readings present but previous after is missing
      if (currentData.before && currentData.after && !previousData.after) {
        interDialyticResponses.push({
          date: currentDate,
          readings: 'Previous "weight after dialysis" reading is missing',
          error: 'Cannot calculate IDWG - Previous weight after dialysis is missing'
        });
        continue;
      }

      // Case 6: All required readings present - calculate IDWG
      const idwg = currentData.before - previousData.after;
      interDialyticResponses.push({
        date: currentDate,
        readings: idwg
      });
    }

    return interDialyticResponses;
  } catch (error) {
    console.error("Error fetching interdialytic responses:", error);
    throw error;
  }
};




module.exports = {
  AddGraphReading,
  updateGraphReading,
  DeleteGraphReading,
  getReadingsByPatientAndQuestion,
  getReadingsByPatientAndQuestionGraph,
};
