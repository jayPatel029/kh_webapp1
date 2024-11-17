const { pool } = require("../databaseConn/database.js");

const insertKfreDetails = async (req, res, next) => {
    const { patient_id, eGFR, Phosphorous, Bicarbonate, Albumin, Calcium, Albumin_to_Creatinine_Ratio, lab_id, kfre } = req.body;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    console.log("eGFR:", eGFR);
    const insertQuery = `
      INSERT INTO kfre_details (
        patient_id, 
        eGFR, 
        Phosphorous, 
        Bicarbonate, 
        Albumin, 
        Calcium, 
        Albumin_to_Creatinine_Ratio, 
        lab_id, 
        kfre,
        date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  
    const updatePatientQuery = `
      UPDATE patients
      SET kefr = ? ,eGFR=?
      WHERE id = ?;
    `;
  
    try {
      // Insert the new kfre_details record
      const result = await pool.query(insertQuery, [
        patient_id,
        eGFR,
        Phosphorous,
        Bicarbonate,
        Albumin,
        Calcium,
        Albumin_to_Creatinine_Ratio,
        lab_id,
        kfre,
        date,
      ]);
  
      // Update the kfre value in the patient table
      await pool.query(updatePatientQuery, [kfre, eGFR,patient_id]);
        const id= parseInt(result.insertId);
      res.status(201).json({
        success: true,
        message: "Record inserted and patient kfre updated successfully",
        data: { id: id },
      });
    } catch (error) {
      console.error("Error inserting data into kfre_details or updating patient:", error);
      res.status(500).json({
        success: false,
        error: "Error inserting data into kfre_details or updating patient",
      });
    }
  };
  
exports.addKfreDetails = insertKfreDetails;  