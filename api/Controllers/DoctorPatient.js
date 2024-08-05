const { pool } = require("../databaseConn/database.js");

const getDoctorData = async (req, res, next) => {
  const patient_id = req.params.id;

  try {
    const query = `
      SELECT *
      FROM doctor_patients dp
      INNER JOIN doctors u ON dp.doctor_id = u.id
      WHERE dp.patient_id = ?;
    `;
    const result = await pool.query(query, [patient_id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No doctors found for the given patient ID",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const addDoctorToPatient = async (req, res, next) => {
  const patient_id = req.params.id;
  const { doctor_id } = req.body;

  try {
    // Check if the doctor_id and patient_id combination already exists
    const checkQuery = `
      SELECT * FROM doctor_patients WHERE doctor_id = ? AND patient_id = ?
    `;
    const checkResult = await pool.query(checkQuery, [doctor_id, patient_id]);

    if (checkResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: "doctor is already assigned to this patient",
      });
    }

    // Insert the doctor_id and patient_id into the doctor_patients table
    const insertQuery = `
      INSERT INTO doctor_patients (doctor_id, patient_id) VALUES (?, ?)
    `;
    await pool.query(insertQuery, [doctor_id, patient_id]);

    res.status(201).json({
      success: true,
      message: "doctor assigned to patient successfully",
    });
  } catch (error) {
    console.error("Error adding doctor to patient:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteAssignedDoctor = async (req, res, next) => {
  const patient_id = req.params.id;
  const { doctor_id } = req.body;

  try {
    const checkQuery = `
            DELETE FROM doctor_patients
            WHERE doctor_id = ? AND patient_id = ?;
        `;
    const checkResult = await pool.query(checkQuery, [doctor_id, patient_id]);

    if (checkResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching doctor-patient relationship found",
      });
    }

    const deleteQuery = `
      DELETE FROM doctor_patients WHERE doctor_id = ? AND patient_id = ?
    `;
    await pool.query(deleteQuery, [doctor_id, patient_id]);

    res.status(200).json({
      success: true,
      message: "Assigned doctor deleted from patient successfully",
    });
  } catch (error) {
    console.error("Error deleting assigned doctor from patient:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDoctorData,
  addDoctorToPatient,
  deleteAssignedDoctor,
};
