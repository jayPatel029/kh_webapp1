const { pool } = require("../databaseConn/database.js");
const AddPatient = async (req, res, next) => {
    const {
      name,
      aliments,
      number,
      dob,
      profile_photo,
      registered_date,
      program_assigned_to,
      medical_team,
      program,
      pushNotificationId,
    } = req.body;
  
    if (
      !name ||
      !aliments ||
      !number ||
      !dob ||
      // !profile_photo ||
      !registered_date
      // !program_assigned_to ||
      // !medical_team
    ) {
      return res.status(400).json({
        success: false,
        data: "All fields are required",
      });
    }
    const numberString = number.toString();
    if (numberString.length !== 10) {
      return res.status(400).json({
        success: false,
        data: "Phone number must be of length 10",
      });
    }
}