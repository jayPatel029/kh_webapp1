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
    if (result.length > 0) {
      return res.status(201).json({
        success: false,
        data: "Readings for this date already exist",
      });
    }

    // Proceed with fetching the title of the question
    const titleQuery = await pool.execute(
      `SELECT title FROM dialysis_readings WHERE id = ${question_id}`
    );
    const questionTitle = titleQuery[0].title;

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
    const interId=`
    SELECT id
    FROM dialysis_readings
    WHERE LOWER(title) = 'interDialysisGraph'
    `
    const [beforeResult, afterResult,inter] = await Promise.all([
      pool.query(beforeDialysisQuery),
      pool.query(afterDialysisQuery),
      pool.query(interId)
    ]);

    const beforeReadingId = beforeResult[0].id;
    const afterReadingId = afterResult[0].id;
    const interReadingId=inter[0].id

    // Step 2: Get the responses for 'weight before dialysis' and 'weight after dialysis'
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
    const otherDates =`
    select date from graph_readings_dialysis where  user_id = ${user_id} AND question_id!=${interReadingId} AND  question_id != ${beforeReadingId} AND  question_id != ${afterReadingId} group by date`

    const [beforeResponseResult, afterResponseResult, remaining] = await Promise.all([
      pool.query(beforeResponseQuery),
      pool.query(afterResponseQuery),
      pool.query(otherDates)
    ]);

    // Step 3: Create a map of dates and their corresponding before/after readings
    const dateMap = {};
    
    // Add "before" readings to the dateMap
    beforeResponseResult.forEach(before => {
      const date = new Date(before.date).toISOString().split('T')[0];
      dateMap[date] = { before: before.readings, after: null };  // Initialize 'after' as null
    });

    // Add "after" readings to the dateMap
    afterResponseResult.forEach(after => {
      const date = new Date(after.date).toISOString().split('T')[0];
      if (dateMap[date]) {
        dateMap[date].after = after.readings;
      } else {
        dateMap[date] = { before: null, after: after.readings };  // Initialize 'before' as null
      }
    });
    for(let i=0;i<remaining.length;i++){
      const date = new Date(remaining[i].date).toISOString().split('T')[0];
      dateMap[date] = { before: null, after: null };  // Initialize 'before' as null
    }
    const interDialyticResponses = [];
    let previousDate = null;

    // Step 4: Calculate interdialytic weight gain
    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const { before, after } = dateMap[currentDate];

      if (i === 0) {
        // Skip the first day, since no calculation is possible
        interDialyticResponses.push({
          date: currentDate,
          readings: 'No calculation for first day'
        });
      } else {
        const previousDateData = dateMap[sortedDates[i - 1]];

        if (!before) {
          // Case 1: No "Before" reading for the current day
          interDialyticResponses.push({
            date: currentDate,
            readings: 'Reading Not found (Before missing)'
          });
        } else if (!previousDateData.after) {
          // Case 2: No "After" reading for the previous day
          interDialyticResponses.push({
            date: currentDate,
            readings: 'Reading Not found (After missing for previous day)'
          });
        } else {
          // Case 3: Both "Before" reading for current day and "After" reading for previous day exist
          const idwg = before - previousDateData.after;
          interDialyticResponses.push({
            date: currentDate,
            readings: idwg
          });
        }
      }

      previousDate = currentDate; // Update the previousDate for the next iteration
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
