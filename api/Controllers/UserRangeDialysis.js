const { pool } = require("../databaseConn/database.js");

// const setRange = async (req, res, next) => {
//     const { question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2 } = req.body;

//     try {
//         const query = `
//     IF EXISTS (SELECT 1 FROM user_range WHERE question_id = ? AND user_id = ?)
//     BEGIN
//         UPDATE user_range
//         SET high_range_1 = ?, high_range_2 = ?, low_range_1 = ?, low_range_2 = ?
//         WHERE question_id = ? AND user_id = ?;
//     END
//     ELSE
//     BEGIN
//         INSERT INTO user_range (question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2)
//         VALUES (?, ?, ?, ?, ?, ?);
//     END
//     `;

//         await pool.query(query, [question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2]);

//         res.status(200).json({
//             success: true,
//             message: 'User range inserted/updated successfully'
//         });
//     } catch (error) {
//         console.error('Error executing SQL query:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error'
//         });
//     }
// }

const setRange = async (req, res, next) => {
  const {
    question_id,
    user_id,
    high_range_1,
    high_range_2,
    low_range_1,
    low_range_2,
  } = req.body;

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
      await pool.query(updateQuery, [
        high_range_1,
        high_range_2,
        low_range_1,
        low_range_2,
        question_id,
        user_id,
      ]);
    } else {
      // Insert a new row
      const insertQuery = `
                INSERT INTO user_range_dialysis (question_id, user_id, high_range_1, high_range_2, low_range_1, low_range_2)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
      await pool.query(insertQuery, [
        question_id,
        user_id,
        high_range_1,
        high_range_2,
        low_range_1,
        low_range_2,
      ]);
    }

    res.status(200).json({
      success: true,
      message: "User range inserted/updated successfully",
    });
  } catch (error) {
    console.error("Error executing SQL query:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getRange = async (req, res, next) => {
  const { question_id, user_id } = req.query;

  try {
    const query = `
            SELECT * 
            FROM user_range_dialysis 
            WHERE question_id = ? AND user_id = ?
        `;
    const result = await pool.query(query, [question_id, user_id]);

    if (result.length > 0) {
      res.status(200).json({
        success: true,
        data: result[0],
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Range not found",
      });
    }
  } catch (error) {
    console.error("Error executing SQL query:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  setRange,
  getRange,
};
