const { pool } = require("../databaseConn/database.js");

const saveResponses = async (req, res, next) => {
  const user_id = req.body.user_id;
  const response = req.body.response;
  const question_id = req.body.question_id;

  try {
    // Check if the response already exists
    const checkQuery = `
      SELECT * FROM user_responses 
      WHERE question_id = '${question_id}' AND user_id = '${user_id}'
    `;
    const existingResponse = await pool.query(checkQuery);

    if (existingResponse.length > 0) {
      // Response already exists, update it
      const updateQuery = `
        UPDATE user_responses 
        SET response = '${response}' 
        WHERE question_id = '${question_id}' AND user_id = '${user_id}'
      `;
      await pool.query(updateQuery);

      res.status(200).json({
        success: true,
        data: "Response Updated Successfully",
      });
    } else {
      // Response does not exist, insert a new entry
      const insertQuery = `
        INSERT INTO user_responses (question_id, user_id, response)
        VALUES ('${question_id}','${user_id}','${response}')
      `;
      await pool.query(insertQuery);

      res.status(200).json({
        success: true,
        data: "Response Inserted Successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      data: "Error while Registering Response",
    });
  }
};

const fetchUserResponse = async (req, res, next) => {
  const user_id = req.query.user_id;
  const question_id = req.query.question_id;
  const query = `
        SELECT * from user_responses 
        WHERE question_id=${question_id} and user_id =${user_id}
    `;
  try {
    const response = await pool.query(query);
    await pool.query(query);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      data: "Error while Registering Response",
    });
  }
  //   res.send(req.query.user_id);
};

module.exports = {
  saveResponses,
  fetchUserResponse,
};
