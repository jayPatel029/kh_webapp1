const { pool } = require("../../databaseConn/database.js");

const submitUserFeedback = async (req, res) => {
  console.log("submit user feedbacl");
  const { userID, feedbackText } = req.body;
  const type = "patient";
  const category = "New Feedback";
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const alertQuery = `INSERT INTO alerts (type, category, patientId, date) VALUES ('${type}', '${category}', ${userID}, '${date}')`;

  try {
    // Inserting into alerts table
    const response = await pool.query(alertQuery);

    // Fetching patient details
    const patientQuery = `SELECT * FROM patients WHERE id = ${userID};`;
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
          feedbackText,
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
    console.error("Error while processing feddback", error);
    res.status(500).json({ error: "Error while processing feddback" });
  }
};

module.exports = {
  submitUserFeedback,
};
