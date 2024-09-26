const { pool } = require("../databaseConn/database.js");
// const { createNewEnrollmentAlert } = require("../Controllers/Alerts.js");
const axios = require("axios");
const { createNewEnrollmentAlertFunction } = require("./Alerts.js");

const getPatients = async (req, res) => {
  try {
    const { role, id } = req.user; // Assuming role and userId are available in req.user
    
    let query;
    if (role === "Admin") {
      query = `
        SELECT p.*
        FROM patients p
        JOIN admin_patients ap ON p.id = ap.patient_id and ap.admin_id = ${id}
      `;

      if (id === 1) {
        query = "SELECT * FROM patients";
      }
    } else if (role === "Doctor") {
      const doctor_id_query = ` select * from doctors where email = '${req.user.email}'`;
      const result = await pool.execute(doctor_id_query);
      // console.log(result[0].id)
      const doctor_id = result[0].id;
      query = `
        SELECT p.*
        FROM patients p
        JOIN doctor_patients dp ON p.id = dp.patient_id and dp.doctor_id = ${doctor_id}
      `;
    }else if(role==="PSadmin"){
      query = `
        SELECT p.*
        FROM patients p
        JOIN admin_patients ap ON p.id = ap.patient_id and ap.admin_id = ${id}
      `;
    }   
    else {
      return res.status(404).json({
        success: false,
        message: "You are not authorized to access this route",
      });
    }
    const patients = await pool.execute(query);
    // Return the fetched patients
    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      data: "error in fetching patients",
    });
  }
};

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

  if (!name || !aliments || !number || !dob || !registered_date) {
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

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const checkNumberQuery = `SELECT * FROM patients WHERE number = '${numberString}'`;
    const existingNumber = await connection.query(checkNumberQuery);

    if (existingNumber.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        data: "Phone number already exists",
      });
    }

    const query = `
      INSERT INTO patients (name, number, dob, profile_photo, registered_date, program_assigned_to, medical_team, program, push_notification_id)
      VALUES ('${name}','${number}','${dob}','${profile_photo}','${registered_date}','${program_assigned_to}','${medical_team}', '${program}', '${pushNotificationId}')
    `;
    const result = await connection.query(query);
    const patientId = result.insertId;

    // Handle aliments insertion
    await Promise.all(
      aliments.map(async (ailmentId) => {
        const ailmentsQuery = `INSERT INTO ailment_patient (patient_id, ailment_id) VALUES (${patientId},${ailmentId})`;
        await connection.query(ailmentsQuery);
      })
    );

    // Extract and update ailment names
    let updateAilmentNames = "";
    await Promise.all(
      aliments.map(async (ailmentId) => {
        const ailmentsNames = `SELECT name FROM ailments WHERE id = ${ailmentId}`;
        const ailmentName = await connection.query(ailmentsNames);
        const name = ailmentName[0].name;
        updateAilmentNames += name + ", ";
      })
    );

    if (updateAilmentNames.length > 0) {
      updateAilmentNames = updateAilmentNames.slice(0, -2);
    }

    const updatePatientQuery = `
      UPDATE patients
      SET aliments = '${updateAilmentNames}'
      WHERE id = ${patientId}
    `;
    await connection.query(updatePatientQuery);

    const insertPatientIntoDoctorQuery = `INSERT INTO doctor_patients (doctor_id, patient_id) VALUES (? , ?)`;
    const insertPatientIntoAdminQuery = `INSERT INTO admin_patients (admin_id, patient_id) VALUES (? , ?)`;

    await connection.query(insertPatientIntoDoctorQuery, [
      medical_team,
      patientId,
    ]);
    await connection.query(insertPatientIntoAdminQuery, [1, patientId]);

    createNewEnrollmentAlertFunction(patientId);

    await connection.commit();

    res.status(200).json({
      success: true,
      result: true,
      data: "Patient Registered Successfully",
      userId: result.insertId.toString(),
      message:
        "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VybmFtZSI6IkRlZXJhaiIsIlVzZXJJbWFnZSI6IiIsIlVzZXJJRCI6Ijg5IiwiSXNBZHZhbmNlZCI6ImZhbHNlIiwiRGF0ZU9mQmlydGgiOiIxMC8xMC8yMDAzIDEyOjAwOjAwIEFNIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJkMGI2MjBjYi1lNzFlLTRlYWEtYmRjZS1iYTM4MGMzYmExOWUiLCJleHAiOjE3NDIwMjI2NTUsImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0OjcxNzMvIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzE3My8ifQ.Ste1qMw9OgllwGwVKUMUFo3RrFOTFy78VjdEvxoSnQw",
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error Details:", err);
    res.status(500).json({
      success: false,
      data: "Error while Registering Patient",
    });
  } finally {
    connection.release();
  }
};

const deletePatient = async (req, res, next) => {
  const id = req.params.id;
  try {
    const adminQuery = `DELETE FROM admin_patients WHERE patient_id = ${id}`;
    await pool.query(adminQuery);
    const doctorQuery = `DELETE FROM doctor_patients WHERE patient_id = ${id}`;
    await pool.query(doctorQuery);
    const query = `DELETE FROM patients WHERE id = ${id}`;
    await pool.query(query);
    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      data: "Error while deleting Patient",
    });
  }
};

const getPatientById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const query = `SELECT * FROM patients where id = ${id}`;
    const roles = await pool.query(query);

    //get patient ailments
    const ailmentsQuery = `
      SELECT ailments.name
      FROM patients
      JOIN ailment_patient ON patients.id = ailment_patient.patient_id
      JOIN ailments ON ailment_patient.ailment_id = ailments.id
      WHERE patients.id =${id};
    `;
    const ailmentsList = await pool.query(ailmentsQuery);
    const ailments = ailmentsList.map((item) => item.name);
    res.status(200).json({
      success: true,
      data: { ...roles[0], ailments },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: "Error while fetching patient by ID",
    });
  }
};

const updatePatientProgram = async (req, res, next) => {
  const { id, program_id } = req.body;
  try {
    const query = `
      UPDATE patients
      SET program = '${program_id}'
      WHERE id = '${id}'
    `;
    const query2 =`UPDATE  alerts SET isOpened='1' where patientId =${id} AND category ="New Program Enrollment" `
    await pool.query(query);
    await pool.query(query2);
    res.status(200).json({
      success: true,
      data: "Patient Program Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      data: "Error while updating Patient Program",
    });
  }
};

const updatePatientProfile = async (req, res, next) => {
  const { id, name, number, dob } = req.body;
  try {
    const query = `
      UPDATE patients
      SET name = '${name}', 
          number = '${number}', 
          dob = '${dob}'
       
      WHERE id = '${id}'
    `;

    await pool.query(query);

    res.status(200).json({
      success: true,
      data: "Patient Profile Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      data: "Error while updating Patient Profile",
    });
  }
};

const updatePatientGFR = async (req, res, next) => {
  const { id, eGFR, GFR } = req.body;
  try {
    const query = `
      UPDATE patients
      SET eGFR = '${eGFR}', 
          GFR = '${GFR}'
       
      WHERE id = '${id}'
    `;

    await pool.query(query);

    res.status(200).json({
      success: true,
      data: "Patient Profile Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      data: "Error while updating Patient Profile",
    });
  }
};

const updateDryWeight = async (req, res, next) => {
  const { id, dry_weight } = req.body;
  try {
    const query = `
      UPDATE patients
      SET dry_weight = '${dry_weight}'
       
      WHERE id = '${id}'
    `;

    await pool.query(query);

    res.status(200).json({
      success: true,
      data: "Patient Profile Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      data: "Error while updating Patient Profile",
    });
  }
};

const updatePatientAilment = async (req, res, next) => {
  const { id, aliments } = req.body;

  try {
    // Delete existing entries for the patient
    await pool.query(`DELETE FROM ailment_patient WHERE patient_id = '${id}'`);

    // Create new entries for selected ailments
    const ailmentIds = aliments.map(Number); // Convert ailment IDs to numbers
    const insertQuery = `
      INSERT INTO ailment_patient (patient_id, ailment_id)
      VALUES ${ailmentIds
        .map((ailmentId) => `('${id}', '${ailmentId}')`)
        .join(",")}
    `;
    await pool.query(insertQuery);

    res.status(200).json({
      success: true,
      data: "Patient Profile Updated Successfully",
    });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    res.status(500).json({
      success: false,
      data: "Error while updating Patient Profile",
    });
  }
};

const updateAdminTeam = async (req, res, next) => {
  const patientId = req.params.id;
  const { userId } = req.body;
  try {
    // Fetch the current assigned program list for the patient
    const fetchQuery = `SELECT program_assigned_to FROM patients WHERE id = ?`;
    const result = await pool.query(fetchQuery, [patientId]);
    const currentProgram = result[0].program_assigned_to;

    const updatedAdminTeam = currentProgram
      ? `${currentProgram},${userId}`
      : userId;

    const updateQuery = `
      UPDATE patients
      SET program_assigned_to = '${updatedAdminTeam}'
      WHERE id = '${patientId}'
    `;

    await pool.query(updateQuery);

    res.status(200).json({
      success: true,
      data: "Patient Profile Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      data: "Error while updating Patient Profile",
    });
  }
};

const updateMedicalTeam = async (req, res, next) => {
  const patientId = req.params.id;
  const { userId } = req.body;

  try {
    const fetchQuery = `SELECT medical_team FROM patients WHERE id = ?`;
    const result = await pool.query(fetchQuery, [patientId]);
    const currentMedicalTeam = result[0].medical_team;

    const updatedMedicalTeam = currentMedicalTeam
      ? `${currentMedicalTeam},${userId}`
      : userId;

    const updateQuery = `
      UPDATE patients
      SET medical_team = '${updatedMedicalTeam}'
      WHERE id = '${patientId}'
    `;

    await pool.query(updateQuery);

    res.status(200).json({
      success: true,
      data: "Patient Profile Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      data: "Error while updating Patient Profile",
    });
  }
};

const getPatientMedicalTeam = async (req, res, next) => {
  try {
    const query = `SELECT * FROM doctors JOIN doctor_patients ON doctors.id = doctor_patients.doctor_id where doctor_patients.patient_id = ${req.params.id}`;
    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: "Error while fetching patient medical team",
    });
  }
};

const getPatientAdminTeam = async (req, res, next) => {
  try {
    const query = `SELECT * FROM users JOIN admin_patients ON users.id = admin_patients.admin_id where admin_patients.patient_id = ${req.params.id}`;
    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: "Error while fetching patient admin team",
    });
  }
};

const getNamebyId = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const query = `SELECT * FROM patients where id = ${req.params.id}`;
    const reponse = await pool.query(query);
    console.log(reponse);
    const name = reponse[0].name;
    res.status(200).json({
      success: true,
      data: name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: "Error while fetching patient name",
    });
  }
};

const getPatientAilments = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const query = `SELECT aliments FROM patients WHERE id = ${patientId}`;
    const result = await pool.query(query);

    // Extract the aliments from the query result
    const aliments = result[0].aliments
      .split(",")
      .map((aliment) => aliment.trim());

    res.status(200).json({
      success: true,
      data: aliments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: "Error while fetching patient ailments",
    });
  }
};

const removeAdminFromPatient = async (req, res, next) => {
  const { patientId } = req.params;
  const { userId } = req.body;

  try {
    // Fetch the current assigned program list for the patient
    const fetchQuery = `SELECT program_assigned_to FROM patients WHERE id = '${patientId}'`;
    const result = await pool.query(fetchQuery);
    const currentProgram = result[0]?.program_assigned_to;

    if (!currentProgram) {
      return res.status(404).json({
        success: false,
        message: "Patient or program_assigned_to property not found",
      });
    }

    // Split the current program_assigned_to string into an array
    const programArray = currentProgram.split(",");

    // Remove the user ID from the array
    const updatedProgram = programArray.filter((id) => id !== userId).join(",");

    // Update the patient's program_assigned_to field with the updated list
    const updateQuery = `
      UPDATE patients
      SET program_assigned_to = '${updatedProgram}'
      WHERE id = '${patientId}'
    `;

    await pool.query(updateQuery);

    res.status(200).json({
      success: true,
      message: "User removed from patient's program successfully",
    });
  } catch (error) {
    console.error("Error removing user from patient's program:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while removing user from patient's program",
    });
  }
};

module.exports = {
  getPatients,
  AddPatient,
  updatePatientProgram,
  deletePatient,
  getPatientById,
  getPatientMedicalTeam,
  getNamebyId,
  updatePatientProfile,
  updatePatientAilment,
  getPatientAdminTeam,
  updatePatientGFR,
  updateDryWeight,
  getPatientAilments,
  updateMedicalTeam,
  updateAdminTeam,
  removeAdminFromPatient,
};
