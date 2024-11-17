const { da } = require("date-fns/locale");
const { pool } = require("../databaseConn/database.js");

const getAdminData = async (req, res, next) => {
  const patient_id = req.params.id;

  try {
    const query = `
      SELECT *
      FROM admin_patients dp
      INNER JOIN users u ON dp.admin_id = u.id
      WHERE dp.patient_id = ?;
    `;
    const result = await pool.query(query, [patient_id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No admin found for the given patient ID",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const addAdminToPatient = async (req, res, next) => {
  const patient_id = req.params.id;
  const { admin_id } = req.body;

  try {
    // Check if the admin_id and patient_id combination already exists
    const checkQuery = `
      SELECT * FROM admin_patients WHERE admin_id = ? AND patient_id = ?
    `;
    const checkResult = await pool.query(checkQuery, [admin_id, patient_id]);

    if (checkResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Admin is already assigned to this patient",
      });
    }
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    // Insert the admin_id and patient_id into the admin_patients table
    const insertQuery = `
      INSERT INTO admin_patients (admin_id, patient_id,date) VALUES (?, ?,?)
    `;
    await pool.query(insertQuery, [admin_id, patient_id, date]);

    res.status(201).json({
      success: true,
      message: "Admin assigned to patient successfully",
    });
  } catch (error) {
    console.error("Error adding admin to patient:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteAssignedAdmin = async (req, res, next) => {
  const patient_id = req.params.id;
  const { admin_id } = req.body;

  try {
    const checkQuery = `
      SELECT * FROM admin_patients WHERE admin_id = ? AND patient_id = ?
    `;
    const checkResult = await pool.query(checkQuery, [admin_id, patient_id]);

    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin is not assigned to this patient",
      });
    }

    const deleteQuery = `
      DELETE FROM admin_patients WHERE admin_id = ? AND patient_id = ?
    `;
    await pool.query(deleteQuery, [admin_id, patient_id]);

    res.status(200).json({
      success: true,
      message: "Assigned admin deleted from patient successfully",
    });
  } catch (error) {
    console.error("Error deleting assigned admin from patient:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAdminData,
  addAdminToPatient,
  deleteAssignedAdmin,
};
