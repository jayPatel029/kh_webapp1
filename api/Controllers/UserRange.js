const { pool } = require("../databaseConn/database.js");



const setRange = async (req, res, next) => {
    const { question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2 } = req.body;

    try {
        // Check if the row exists
        const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM user_range 
            WHERE question_id = ? AND user_id = ?
        `;
        const checkResult = await pool.query(checkQuery, [question_id, user_id]);
        const rowExists = checkResult[0].count > 0;
        // console.log(checkResult)
        // console.log(rowExists)

        if (rowExists) {
            // Update the existing row
            const updateQuery = `
                UPDATE user_range 
                SET high_range_1 = ?, high_range_2 = ?, low_range_1 = ?, low_range_2 = ?
                WHERE question_id = ? AND user_id = ?
            `;
            await pool.query(updateQuery, [high_range_1, high_range_2, low_range_1, low_range_2, question_id, user_id]);
        } else {
            // Insert a new row
            const insertQuery = `
                INSERT INTO user_range (question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await pool.query(insertQuery, [question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2]);
        }

        res.status(200).json({
            success: true,
            message: 'User range inserted/updated successfully'
        });
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getRange = async (req,res,next)=>{
    const { question_id, user_id } = req.query;

    try {
        const query = `
            SELECT * 
            FROM user_range 
            WHERE question_id = ? AND user_id = ?
        `;
        const result = await pool.query(query, [question_id, user_id]);

        if (result.length > 0) {
            res.status(200).json({
                success: true,
                data: result[0]
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'Range not found'
            });
        }
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getRangeSys = async (req,res,next)=>{
    const { question_id, user_id } = req.query;

    try {
        const query = `
            SELECT * 
            FROM user_range 
            WHERE question_id = ? AND user_id = ?
        `;
        const result = await pool.query(query, [question_id, user_id]);

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

        const queryDia = `
            SELECT * 
            FROM user_range 
            WHERE question_id = ? AND user_id = ?
        `;
        const resultDia = await pool.query(queryDia, [diastolicId, user_id]);

        if (result.length > 0) {
            res.status(200).json({
                success: true,
                systolic: result[0],
                diastolic: resultDia[0]
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'Range not found'
            });
        }
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const setRangeSys = async (req, res, next) => {
    const { question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2,high_range_dia_1, high_range_dia_2, low_range_dia_1, low_range_dia_2 } = req.body;

    try {
        // Check if the row exists
        const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM user_range 
            WHERE question_id = ? AND user_id = ?
        `;
        const checkResult = await pool.query(checkQuery, [question_id, user_id]);
        const rowExists = checkResult[0].count > 0;
        // console.log(checkResult)
        // console.log(rowExists)

        if (rowExists) {
            // Update the existing row
            const updateQuery = `
                UPDATE user_range 
                SET high_range_1 = ?, high_range_2 = ?, low_range_1 = ?, low_range_2 = ?
                WHERE question_id = ? AND user_id = ?
            `;
            await pool.query(updateQuery, [high_range_1, high_range_2, low_range_1, low_range_2, question_id, user_id]);
        } else {
            // Insert a new row
            const insertQuery = `
                INSERT INTO user_range (question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await pool.query(insertQuery, [question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2]);
        }

        //get Diastolic Id
        const questionTitleResult = await pool.query(`SELECT LOWER(title) as title FROM daily_readings WHERE id = ${question_id}`)
        const questionTitle = questionTitleResult[0].title
        const newQuestionTitle = questionTitle.replace(/systolic/i, "diastolic");
        const diastolicQuestionIDQuery = `
            SELECT id FROM daily_readings WHERE LOWER(title) LIKE '%${newQuestionTitle}%'
        `;
        const diastolicQuestionIDResult = await pool.query(diastolicQuestionIDQuery);
        const diastolicId = diastolicQuestionIDResult[0].id;

        // Check if the row exists
        const checkQueryDia = `
            SELECT COUNT(*) AS count 
            FROM user_range 
            WHERE question_id = ? AND user_id = ?
        `;
        const checkResultDia = await pool.query(checkQueryDia, [diastolicId, user_id]);
        const rowExistsDia = checkResultDia[0].count > 0;
        if (rowExistsDia) {
            // Update the existing row
            const updateQuery = `
                UPDATE user_range 
                SET high_range_1 = ?, high_range_2 = ?, low_range_1 = ?, low_range_2 = ?
                WHERE question_id = ? AND user_id = ?
            `;
            await pool.query(updateQuery, [high_range_dia_1, high_range_dia_2, low_range_dia_1, low_range_dia_2, diastolicId, user_id]);
        } else {
            // Insert a new row
            const insertQuery = `
                INSERT INTO user_range (question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await pool.query(insertQuery, [diastolicId, user_id, high_range_dia_1, high_range_dia_2, low_range_dia_1, low_range_dia_2]);
        }

        res.status(200).json({
            success: true,
            message: 'User range inserted/updated successfully'
        });
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getRangeSysDia = async (req,res,next)=>{
    const { question_id, user_id } = req.query;

    try {
        const query = `
            SELECT * 
            FROM user_range_dialysis 
            WHERE question_id = ? AND user_id = ?
        `;
        const result = await pool.query(query, [question_id, user_id]);

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

        const queryDia = `
            SELECT * 
            FROM user_range_dialysis 
            WHERE question_id = ? AND user_id = ?
        `;
        const resultDia = await pool.query(queryDia, [diastolicId, user_id]);

        if (result.length > 0) {
            res.status(200).json({
                success: true,
                systolic: result[0],
                diastolic: resultDia[0]
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'Range not found'
            });
        }
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const setRangeSysDia = async (req, res, next) => {
    const { question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2,high_range_dia_1, high_range_dia_2, low_range_dia_1, low_range_dia_2 } = req.body;

    try {
        // Check if the row exists
        const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM user_range_dialysis 
            WHERE question_id = ? AND user_id = ?
        `;
        const checkResult = await pool.query(checkQuery, [question_id, user_id]);
        const rowExists = checkResult[0].count > 0;
        // console.log(checkResult)
        // console.log(rowExists)

        if (rowExists) {
            // Update the existing row
            const updateQuery = `
                UPDATE user_range_dialysis 
                SET high_range_1 = ?, high_range_2 = ?, low_range_1 = ?, low_range_2 = ?
                WHERE question_id = ? AND user_id = ?
            `;
            await pool.query(updateQuery, [high_range_1, high_range_2, low_range_1, low_range_2, question_id, user_id]);
        } else {
            // Insert a new row
            const insertQuery = `
                INSERT INTO user_range_dialysis (question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await pool.query(insertQuery, [question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2]);
        }

        //get Diastolic Id
        const questionTitleResult = await pool.query(`SELECT LOWER(title) as title FROM dialysis_readings WHERE id = ${question_id}`)
        const questionTitle = questionTitleResult[0].title
        const newQuestionTitle = questionTitle.replace(/systolic/i, "diastolic");
        const diastolicQuestionIDQuery = `
            SELECT id FROM dialysis_readings WHERE LOWER(title) LIKE '%${newQuestionTitle}%'
        `;
        const diastolicQuestionIDResult = await pool.query(diastolicQuestionIDQuery);
        const diastolicId = diastolicQuestionIDResult[0].id;

        // Check if the row exists
        const checkQueryDia = `
            SELECT COUNT(*) AS count 
            FROM user_range_dialysis 
            WHERE question_id = ? AND user_id = ?
        `;
        const checkResultDia = await pool.query(checkQueryDia, [diastolicId, user_id]);
        const rowExistsDia = checkResultDia[0].count > 0;
        if (rowExistsDia) {
            // Update the existing row
            const updateQuery = `
                UPDATE user_range_dialysis 
                SET high_range_1 = ?, high_range_2 = ?, low_range_1 = ?, low_range_2 = ?
                WHERE question_id = ? AND user_id = ?
            `;
            await pool.query(updateQuery, [high_range_dia_1, high_range_dia_2, low_range_dia_1, low_range_dia_2, diastolicId, user_id]);
        } else {
            // Insert a new row
            const insertQuery = `
                INSERT INTO user_range_dialysis (question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await pool.query(insertQuery, [diastolicId, user_id, high_range_dia_1, high_range_dia_2, low_range_dia_1, low_range_dia_2]);
        }

        res.status(200).json({
            success: true,
            message: 'User range inserted/updated successfully'
        });
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}




module.exports = {
    setRange,
    getRange,
    getRangeSys,
    setRangeSys,
    getRangeSysDia,
    setRangeSysDia
}