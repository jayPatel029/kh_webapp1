const { pool } = require("../../databaseConn/database.js");

const isAccountDeletionRequest = async (req, res) => {
  // console.log("get is delete account request");
  const { userID } = req.body;

  const query = `SELECT *  FROM ALERTS WHERE patientId = ${userID} and category = 'Account Deletion'`;
  try {
    const resp = await pool.query(query);
    if (resp.length > 0) {
      res.status(200).json({
        result: true,
        message: "Successful",
      });
    }else{
      res.status(200).json({
        result: false,
        message: "Not found",
      });
		}
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Failed to get alert",
    });
  }
};

const accountDeletionRequest = async (req, res) => {
  console.log("delete account request");
  const { userID, reasonText } = req.body;
  const type = "patient";
  const category = "Account Deletion";
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const alertQuery = `INSERT INTO alerts (type, category, patientId, date) VALUES ('${type}', '${category}', ${userID}, '${date}')`;

  try {
    // Inserting into alerts table
    const response = await pool.query(alertQuery);

    // Fetching patient details
    const patientQuery = `SELECT * FROM patients WHERE id = ${parseInt(
      userID
    )};`;
    const resp = await pool.query(patientQuery);

    if (resp.length > 0) {
      const patientemail = resp[0]["name"];
      const patientnumber = resp[0]["number"];
      const contactusDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const contactusQuery = `INSERT INTO contactus (phoneno, message, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?);`;

      try {
        // Inserting into contactus table
        await pool.query(contactusQuery, [
          patientnumber,
          reasonText,
          patientemail,
          contactusDate,
          contactusDate,
        ]);
        res.status(200).json({
          result: true,
          message: "Successful",
        });
      } catch (contactusError) {
        // Error inserting into contactus
        console.error("Error while inserting into contactus:", contactusError);
        res.status(500).json({ error: "Error while inserting into contactus" });
      }
    } else {
      // Patient does not exist
      res.status(404).json({ error: "Patient does not exist" });
    }
  } catch (error) {
    // Error inserting into alerts or fetching patient details
    console.error("Error while processing account deletion request:", error);
    res
      .status(500)
      .json({ error: "Error while processing account deletion request" });
  }
};
const cancelAccountDeletionRequest = async (req, res) => {
  console.log("cancel delete account request");
  const { userID } = req.body;

  const query = `DELETE FROM ALERTS WHERE patientId = ${userID} and category = 'Account Deletion'`;
  try {
    await pool.query(query);
    res.status(200).json({
      result: true,
      message: "Successful",
    });
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Failed to remove alert",
    });
  }
};

module.exports = {
  accountDeletionRequest,
  cancelAccountDeletionRequest,
	isAccountDeletionRequest
};
