const { pool } = require("../databaseConn/database.js");
const { AddDailyReadingsAlerts,AddDialysisReadingsAlerts } = require("./DailyReadingsAlerts.js");

const AddGraphReadingold = async (req, res, next) => {
    const {
        question_id,
        user_id,
        date,
        readings
    } = req.body;

    // Check if the combination of question_id, user_id, and date already exists
    const checkQuery = `
      SELECT * FROM graph_readings 
      WHERE question_id = '${question_id}' 
      AND user_id = '${user_id}' 
      AND date = '${date}'
    `;

    try {
        const result = await pool.query(checkQuery);
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
        INSERT INTO graph_readings (question_id, user_id, date, readings)
        VALUES ('${question_id}','${user_id}','${date}','${readings}')
      `;
        await pool.query(insertQuery);
        await AddDailyReadingsAlerts(question_id, user_id, date, readings);

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

const AddGraphReading = async (req, res, next) => {
    const {
        question_id,
        user_id,
        date: providedDate,
        readings
    } = req.body;

    // Generate server timestamp
    const currentDate = new Date().toISOString().slice(0, 10); // Get current date in 'YYYY-MM-DD' format
    const currentTime = new Date().toISOString().slice(11, 19); // Get current time in 'HH:mm:ss' format
    const serverTimestamp = `${currentDate} ${currentTime}`;

    try {
        // Check if the combination of question_id, user_id, and date already exists
        const checkQuery = `
            SELECT * FROM graph_readings 
            WHERE question_id = '${question_id}' 
            AND user_id = '${user_id}' 
            AND date = '${providedDate} ${currentTime}' 
        `;

        const result = await pool.query(checkQuery);
        if (result.length > 0) {
            // If the combination already exists, return error response
            return res.status(201).json({
                success: false,
                data: "Readings for this date already exist",
            });
        }

        // If the combination doesn't exist, proceed with inserting the data
        const insertQuery = `
            INSERT INTO graph_readings (question_id, user_id, date, readings)
            VALUES ('${question_id}', '${user_id}', '${providedDate} ${currentTime}', '${readings}')
        `;
        await pool.query(insertQuery);
        await AddDailyReadingsAlerts(question_id, user_id, providedDate, readings);

        // excluding for readings example
        // const title_query = await pool.execute(
        //     `
        //      SELECT title FROM dialysis_readings where id = ${question_id}
        //     `
        //   )
        //   const questionTitle = title_query[0].title;
      
        //   const excludedTitles = ["weight before dialysis", "weight after dialysis"];
      
        //   // Check if the title is not in the excluded list before creating alerts
        //   if (!excludedTitles.includes(questionTitle.toLowerCase().trim())) {
        //     await AddDialysisReadingsAlerts(question_id, user_id, date, readings);
        //   }

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

const updateGraph = async (req, res, next) => {
    const {id,
        value
    } = req.body;


    try {
        // Check if the combination of question_id, user_id, and date already exists
        const updateQuery = ` UPDATE graph_readings SET readings = '${value}' WHERE id=${id}`;
        const result = await pool.query(updateQuery);
        return res.status(200).json({
            success: true,
            data: "Readings updates Successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: "Error while Adding Readings",
        });
    }
};

const deleteGraph = async (req, res, next) => {
    const {
        id
    } = req.body;

    try {
        // Check if the combination of question_id, user_id, and date already exists
        const deleteQuery = ` DELETE FROM graph_readings where id=${id}`;
        const result = await pool.query(deleteQuery);
        return res.status(200).json({
            success: true,
            data: "Readings Deleted Successfully",
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

    const query = `
    SELECT date,readings,id FROM graph_readings
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

const getReadingsByPatientAndQuestionSysAndDys = async (req, res, next) => {
    const { question_id, user_id } = req.query;

    const query = `
    SELECT date,readings FROM graph_readings
    WHERE question_id = ${question_id} AND user_id = ${user_id}
  `;

    try {
        const result = await pool.query(query);
        const questions = result;
        const questionTitleResult = await pool.query(`SELECT LOWER(title) as title FROM daily_readings WHERE id = ${question_id}`)
        const questionTitle = questionTitleResult[0].title
        // console.log(questionTitle)
        const newQuestionTitle = questionTitle.replace(/systolic/i, "diastolic");

        // Find the id of the question with the newQuestionTitle
        const diastolicQuestionIDQuery = `
            SELECT id FROM daily_readings WHERE LOWER(title) LIKE '%${newQuestionTitle}%'
        `;
        const diastolicQuestionIDResult = await pool.query(diastolicQuestionIDQuery);
        const diastolicId = diastolicQuestionIDResult[0].id;

        const diastolicQuery = `
            SELECT date,readings FROM graph_readings
            WHERE question_id = ${diastolicId} AND user_id = ${user_id}
        `;
        const diastolicReadings = await pool.query(diastolicQuery);
        // console.log(diastolicReadings)
        // Combine systolic and diastolic readings
        const combinedReadings = questions.map(systolic => {
            const correspondingDiastolic = diastolicReadings.find(diastolic => {
                const systolicDateStr = systolic.date.toISOString();
                const diastolicDateStr = diastolic.date.toISOString();
                return systolicDateStr === diastolicDateStr;
            });
            // console.log("Systolic:", systolic);
            // console.log("Corresponding Diastolic:", correspondingDiastolic);
            return {
                date: systolic.date,
                systolic: systolic.readings,
                diastolic: correspondingDiastolic ? correspondingDiastolic.readings : null
            };
        });

        res.status(200).json({
            success: true,
            data: combinedReadings,
        });
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({
            success: false,
            error: "Error fetching questions",
        });
    }


}

const AddGraphReadingSys = async (req, res, next) => {
    const {
        question_id,
        user_id,
        date,
        readings,
        readingsDia
    } = req.body;
        if(readingsDia == null){
            return res.status(500).json({
                success: false,
                data: "Diastolic Readings cannot be empty",
            });
        }
    const currentDate = new Date().toISOString().slice(0, 10); // Get current date in 'YYYY-MM-DD' format
    const currentTime = new Date().toISOString().slice(11, 19); // Get current time in 'HH:mm:ss' format
    const serverTimestamp = `${currentDate} ${currentTime}`;


    // Check if the combination of question_id, user_id, and date already exists
    const checkQuery = `
      SELECT * FROM graph_readings 
      WHERE question_id = '${question_id}' 
      AND user_id = '${user_id}' 
      AND date = '${date} ${currentTime}' 
    `;

    try {
        const result = await pool.query(checkQuery);
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
        INSERT INTO graph_readings (question_id, user_id, date, readings)
        VALUES ('${question_id}','${user_id}','${date} ${currentTime}','${readings}')
      `;

        const questionTitleResult = await pool.query(`SELECT LOWER(title) as title FROM daily_readings WHERE id = ${question_id}`)
        const questionTitle = questionTitleResult[0].title
        // console.log(questionTitle)
        const newQuestionTitle = questionTitle.replace(/systolic/i, "diastolic");

        // Find the id of the question with the newQuestionTitle
        const diastolicQuestionIDQuery = `
          SELECT id FROM daily_readings WHERE LOWER(title) LIKE '%${newQuestionTitle}%'
      `;
        const diastolicQuestionIDResult = await pool.query(diastolicQuestionIDQuery);
        const diastolicId = diastolicQuestionIDResult[0].id;

        const insertQueryDia = `
        INSERT INTO graph_readings (question_id, user_id, date, readings)
        VALUES ('${diastolicId}','${user_id}','${date} ${currentTime}' ,'${readingsDia}')
      `;

        await pool.query(insertQuery);
        await pool.query(insertQueryDia);

        await AddDailyReadingsAlerts(question_id, user_id, date, readings);
        await AddDailyReadingsAlerts(diastolicId, user_id, date, readingsDia);

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

const getSystolicId = async (req, res) => {
    try {
        // Extract the diastolic title from request parameters
        const diastolicTitle = req.params.diastolicTitle;

        // Convert the diastolic title to lowercase
        const questionTitle = diastolicTitle.toLowerCase();

        // Replace "diastolic" with "systolic" in the title
        const newQuestionTitle = questionTitle.replace(/diastolic/i, "systolic");

        // Query to retrieve the ID of the systolic question based on the modified title
        const systolicQuestionIDQuery = `
            SELECT id FROM daily_readings WHERE LOWER(title) LIKE '%${newQuestionTitle}%'
        `;

        // Execute the query
        const systolicQuestionIDResult = await pool.query(systolicQuestionIDQuery);

        // Extract the systolic ID from the query result
        const systolicId = systolicQuestionIDResult[0].id;

        // Send the systolic ID as a JSON response
        res.status(200).json(systolicId);
    } catch (error) {
        // Handle any errors
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// dialysis section
const getReadingsByPatientAndQuestionSysAndDysDialysis = async (req, res, next) => {
    const { question_id, user_id } = req.query;

    const query = `
    SELECT date,readings FROM graph_readings_dialysis
    WHERE question_id = ${question_id} AND user_id = ${user_id}
  `;

    try {
        const result = await pool.query(query);
        const questions = result;
        const questionTitleResult = await pool.query(`SELECT LOWER(title) as title FROM dialysis_readings WHERE id = ${question_id}`)
        const questionTitle = questionTitleResult[0].title
        // console.log(questionTitle)
        const newQuestionTitle = questionTitle.replace(/systolic/i, "diastolic");

        // Find the id of the question with the newQuestionTitle
        const diastolicQuestionIDQuery = `
            SELECT id FROM dialysis_readings WHERE LOWER(title) LIKE '%${newQuestionTitle}%'
        `;
        const diastolicQuestionIDResult = await pool.query(diastolicQuestionIDQuery);
        const diastolicId = diastolicQuestionIDResult[0].id;

        const diastolicQuery = `
            SELECT date,readings FROM graph_readings_dialysis
            WHERE question_id = ${diastolicId} AND user_id = ${user_id}
        `;
        const diastolicReadings = await pool.query(diastolicQuery);
        // console.log(diastolicReadings)
        // Combine systolic and diastolic readings
        const combinedReadings = questions.map(systolic => {
            const correspondingDiastolic = diastolicReadings.find(diastolic => {
                const systolicDateStr = systolic.date.toISOString();
                const diastolicDateStr = diastolic.date.toISOString();
                return systolicDateStr === diastolicDateStr;
            });
            // console.log("Systolic:", systolic);
            // console.log("Corresponding Diastolic:", correspondingDiastolic);
            return {
                date: systolic.date,
                systolic: systolic.readings,
                diastolic: correspondingDiastolic ? correspondingDiastolic.readings : null
            };
        });

        res.status(200).json({
            success: true,
            data: combinedReadings,
        });
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({
            success: false,
            error: "Error fetching questions",
        });
    }


}

const AddGraphReadingSysDia = async (req, res, next) => {
    const {
        question_id,
        user_id,
        date,
        readings,
        readingsDia
    } = req.body;

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

    try {
        const result = await pool.query(checkQuery);
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
        VALUES ('${question_id}','${user_id}','${date} ${currentTime}','${readings}')
      `;

        const questionTitleResult = await pool.query(`SELECT LOWER(title) as title FROM dialysis_readings WHERE id = ${question_id}`)
        const questionTitle = questionTitleResult[0].title
        // console.log(questionTitle)
        const newQuestionTitle = questionTitle.replace(/systolic/i, "diastolic");

        // Find the id of the question with the newQuestionTitle
        const diastolicQuestionIDQuery = `
          SELECT id FROM dialysis_readings WHERE LOWER(title) LIKE '%${newQuestionTitle}%'
      `;
        const diastolicQuestionIDResult = await pool.query(diastolicQuestionIDQuery);
        const diastolicId = diastolicQuestionIDResult[0].id;

        const insertQueryDia = `
        INSERT INTO graph_readings_dialysis (question_id, user_id, date, readings)
        VALUES ('${diastolicId}','${user_id}','${date} ${currentTime}','${readingsDia}')
      `;

        await pool.query(insertQuery);
        await pool.query(insertQueryDia);

        await AddDialysisReadingsAlerts(question_id, user_id, date, readings);
        await AddDialysisReadingsAlerts(diastolicId, user_id, date, readingsDia);

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

const getSystolicIdDia = async (req, res) => {
    try {
        // Extract the diastolic title from request parameters
        const diastolicTitle = req.params.diastolicTitle;

        // Convert the diastolic title to lowercase
        const questionTitle = diastolicTitle.toLowerCase();

        // Replace "diastolic" with "systolic" in the title
        const newQuestionTitle = questionTitle.replace(/diastolic/i, "systolic");

        // Query to retrieve the ID of the systolic question based on the modified title
        const systolicQuestionIDQuery = `
            SELECT id FROM dialysis_readings WHERE LOWER(title) LIKE '%${newQuestionTitle}%'
        `;

        // Execute the query
        const systolicQuestionIDResult = await pool.query(systolicQuestionIDQuery);

        // Extract the systolic ID from the query result
        const systolicId = systolicQuestionIDResult[0].id;

        // Send the systolic ID as a JSON response
        res.status(200).json(systolicId);
    } catch (error) {
        // Handle any errors
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports = {
    AddGraphReading,
    getReadingsByPatientAndQuestion,
    getReadingsByPatientAndQuestionSysAndDys,
    AddGraphReadingSys,
    getSystolicId,
    getReadingsByPatientAndQuestionSysAndDysDialysis,
    AddGraphReadingSysDia,
    getSystolicIdDia,
    updateGraph,
    deleteGraph
};


