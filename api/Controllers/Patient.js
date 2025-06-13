const { pool } = require("../databaseConn/database.js");
// const { createNewEnrollmentAlert } = require("../Controllers/Alerts.js");
const axios = require("axios");
const { createNewEnrollmentAlertFunction } = require("./Alerts.js");
const { logChange } = require("./log.js");
const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const getPatients = async (req, res) => {
  try {
    const { role, id } = req.user; // Assuming role and userId are available in req.user
    console.log("fetching patients for", role);
    let query;
    if (role === "Admin") {
      query = `
        SELECT p.*
        FROM patients p
        JOIN admin_patients ap ON p.id = ap.patient_id and ap.admin_id = ${id} and p.name <> '';
      `;

      if (id === 1) {
        query = `SELECT * FROM patients WHERE name <> '';`;
      }
    } else if (role === "Doctor" || role === "Medical Staff" || role === "Dialysis Technician") {
      const doctor_id_query = ` select * from doctors where email = '${req.user.email}'`;
      const result = await pool.execute(doctor_id_query);
      // console.log(result[0].id)
      const doctor_id = result[0].id;
      query = `
        SELECT p.*
        FROM patients p
        JOIN doctor_patients dp ON p.id = dp.patient_id and dp.doctor_id = ${doctor_id} and p.name <> '';
      `;
    } else if (role === "PSadmin" || role != "") { // ! removed DT role from here 
      query = `
        SELECT p.*
        FROM patients p
        JOIN admin_patients ap ON p.id = ap.patient_id and ap.admin_id = ${id} and p.name <> '';
      `;
    } else {
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

const getDeletdPatients = async (req, res) => {
  try {
    const query = `SELECT * FROM patients WHERE name = ''`;
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

// new addition added new cols and dynamic jwt!
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
    address,
    pincode,
    state,
  } = req.body;

  if (
    !name ||
    !aliments ||
    !number ||
    !dob ||
    !registered_date ||
    !address ||
    !pincode ||
    !state
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

  const checkNumberQuery = `SELECT * FROM patients WHERE number = '${numberString}'`;
  const existingNumber = await pool.query(checkNumberQuery);
  if (existingNumber.length > 0) {
    return res.status(400).json({
      success: false,
      data: "Phone number already exists",
    });
  }

  const query = `
    INSERT INTO patients 
    (name, number, dob, profile_photo, registered_date, program_assigned_to, medical_team, program, push_notification_id, address, pincode, state) 
    VALUES 
    ('${name}', '${number}', '${dob}', '${profile_photo}', '${registered_date}', '${program_assigned_to}', '${medical_team}', '${program}', '${pushNotificationId}', '${address}', '${pincode}', '${state}')
    `;

  try {
    const result = await pool.query(query);
    const patientId = result.insertId;

    aliments.map(async (ailmentId) => {
      const ailmentsQuery = `INSERT INTO ailment_patient (patient_id, ailment_id) VALUES (${patientId}, ${ailmentId})`;
      await pool.query(ailmentsQuery);
    });

    let updateAilmentNames = "";
    await Promise.all(
      aliments.map(async (ailmentId) => {
        const ailmentsNames = `SELECT name FROM ailments WHERE id = ${ailmentId}`;
        const ailmentName = await pool.query(ailmentsNames);
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
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    await pool.query(updatePatientQuery);
    const insertPatientIntoDoctorQuery = `INSERT INTO doctor_patients (doctor_id, patient_id) VALUES (?, ?)`;
    const insertPatientIntoAdminQuery = `INSERT INTO admin_patients (admin_id, patient_id,date) VALUES (?, ?,?)`;
    await pool.query(insertPatientIntoDoctorQuery, [medical_team, patientId]);
    await pool.query(insertPatientIntoAdminQuery, [1, patientId, date]);
    const isAdvance = program === "Advanced" ? 1 : 0;
    const payload = {
      name,
      number,
      id: patientId.toString(), // Convert BigInt to string
      pushNotificationId: pushNotificationId || null,
      isAdvance,
    };
    const token = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: "24h",
      issuer: "https://localhost:7173/",
    });
    // Respond with success
    res.status(200).json({
      success: true,
      result: true,
      data: "Patient Registered Successfully",
      userId: patientId.toString(), // Convert BigInt to string
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      data: "Error while Registering Patient",
    });
  }
};
const deletePatient = async (req, res, next) => {
  const id = req.params.id;
  const query = `Select number from patients where id = ${id}`;
  let number = await pool.execute(query);
  number = number[0].number;

  try {
    const contactUsQuery = `Update ContactUs Set email="", phoneno="" WHERE phoneno = '${number}'`;
    await pool.query(contactUsQuery);
    const adminQuery = `DELETE FROM admin_patients WHERE patient_id = ${id}`;
    await pool.query(adminQuery);
    const doctorQuery = `DELETE FROM doctor_patients WHERE patient_id = ${id}`;
    await pool.query(doctorQuery);
    const query = `UPDATE  patients Set name="",number="",profile_photo="" WHERE id = ${id}`;
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
    const query2 = `UPDATE  alerts SET isOpened='1' where patientId =${id} AND category ="New Program Enrollment" `;
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
  const { id, name, number, dob, address, state, pincode, changeBy } = req.body;
  const newDetails = req.body;

  try {
    const [oldDetails] = await pool.execute(
      `SELECT * FROM patients WHERE id = ?`,
      [id]
    );

    // Compare and log each field
    for (const field in newDetails) {
      if (field === "changeBy") continue;
      if (field === "id") continue;
      if (
        newDetails[field] !== oldDetails[field] &&
        newDetails[field] !== changeBy
      ) {
        const pName = `select name from patients where id = ${id}`;
        const patientName = await pool.execute(pName);
        const numberQ = `select number from patients where id = ${id}`;
        const patientNumber = await pool.execute(numberQ);
        await logChange(
          id,
          field,
          patientName[0].name,
          patientNumber[0].number,
          oldDetails[field],
          newDetails[field],
          changeBy
        );
      }
    }
    const query = `
      UPDATE patients
      SET name = '${name}', 
          number = '${number}', 
          dob = '${dob}',
          address = '${address}',
          state = '${state}',
          pincode = '${pincode}'
       
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
  const { changeBy } = req.body;
  try {
    // Delete existing entries for the patient
    console.log("updating pat ailmetns: ", aliments);
    // Create new entries for selected ailments
    const oldDetails = await pool.execute(
      `SELECT * from ailment_patient where patient_id = ?`,
      [id]
    );
    const oldAilments = oldDetails.map((item) => item.ailment_id);
    const newAilments = aliments.map(Number);

    let ailmentNames = [];

    for (let i of newAilments) {
      const ailmentQ = `SELECT name FROM ailments WHERE id = ${i}`;

      const res = await pool.query(ailmentQ);
      const rows = res.rows || res;

      console.log("ailname query", rows);
      if (rows.length > 0) {
        ailmentNames.push(rows[0].name);
      }
    }

    const ailNames = ailmentNames.join(", ");
    console.log("will upadate this in the pat table:", ailNames);

    await pool.query(
      `UPDATE patients SET aliments = '${ailNames}' WHERE id = ${id}`
    );

    if (
      oldAilments.length !== newAilments.length ||
      oldAilments.some((ailment) => !newAilments.includes(ailment))
    ) {
      await logChange(
        id,
        "ailments",
        oldAilments.join(", "),
        newAilments.join(", "),
        changeBy
      );
    }

    console.log(oldAilments, newAilments);
    await pool.query(`DELETE FROM ailment_patient WHERE patient_id = '${id}'`);
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
    const data = reponse;
    res.status(200).json({
      success: true,
      data: data,
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
  getDeletdPatients,
};
