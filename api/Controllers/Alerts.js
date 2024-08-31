const { Json } = require("sequelize/lib/utils");
const { pool } = require("../databaseConn/database.js");

const getAlerts = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM alerts");
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};
const getAlertbyCategory = async(req,res)=>{
  try{
    const query = "SELECT * FROM alerts WHERE category = 'New Program Enrollment' AND isOpened=0";
    const response = await pool.execute(query);
    
    res.status(200).json(response)
  }
  catch(error){
    console.log(error)

  }
}


const getAlertbyType = async (req, res) => {
  const { type } = req.params;
  try {
    // console.log("getAlertbyType function called with type : ", type);
    const query = `SELECT * FROM alerts WHERE type = '${type}' order by date desc`;
    const response = await pool.execute(query);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAlertbyId = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM alerts WHERE id = ${id}`;
    const response = await pool.execute(query);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

//doctor alert
const createDoctorMessageToAdminAlert = async (req, res) => {
  const { chatId, message, pid } = req.body;
  const type = "doctor";
  const category = `Doctor Message to Admin -"${message}"`;
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");
  const query = `INSERT INTO alerts (type, category, chatId,date,patientId) VALUES ('${type}', '${category}', ${chatId},'${date}',${pid})`;
  try {
    await pool.query(query);
    res.status(200).json({
      message: "Alert created",
      result: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating alert",
      result: false,
    });
  }
};

//patient alert
const createNewEnrollmentAlert = async (req, res) => {
  const type = "patient";
  const category = "New Enrollment";
  const { patientId } = req.body;
  console.log("received patientId in function :", patientId);
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");
  const query = `INSERT INTO alerts (type, category, patientId,date) VALUES ('${type}', '${category}', ${patientId},'${date}')`;
  try {
    const response = await pool.query(query);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

const createNewEnrollmentAlertFunction = async (patientId) => {
  const type = "patient";
  const category = "New Enrollment";
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const query = `INSERT INTO alerts (type, category, patientId, date) VALUES ('${type}', '${category}', ${patientId}, '${date}')`;

  try {
    const response = await pool.query(query);
    console.log("New Enrollment Alert created", response.insertId);
    return response[0];
  } catch (error) {
    console.log(error);
  }
};

//patient alert
const createNewProgramEnrollmentAlert = async (req, res) => {
  console.log(req.body);
  const type = "patient";
  const category = "New Program Enrollment";
  const { patientId, programName } = req.body;
  
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const selectQuery= `SELECT programName  from alerts where patientId = ${patientId} AND category ="New Program Enrollment" AND isOpened=0 `
  const ans=await pool.execute(selectQuery)
  console.log(ans,"auwg")
  
  if(ans[0]){
    return res.status(200).json({
      message: "An alert already exists and is not opened.",
      result: false,
    });
  }
  const query = `INSERT INTO alerts (type, category, patientId, programName, date) VALUES ('${type}', '${category}', ${patientId},'${programName}','${date}')`;
  try {
    await pool.query(query);
    res.status(200).json({
      message: "Successful",
      result: true,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

//neel (combined one)
const createProgramAlert = async (req, res) => {
  const { patientId, programName, category } = req.body;
  const type = "patient";
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");

  // Ensure category is provided, otherwise default to "New Program Enrollment"
  const alertCategory = category || "New Program Enrollment";

  const query = `INSERT INTO alerts (type, category, patientId, programName, date) 
                 VALUES ('${type}', '${alertCategory}', ${patientId}, '${programName}', '${date}')`;
  try {
    await pool.query(query);
    res.status(200).json({
      message: "Successful",
      result: true,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

//patient alert
const createNewPrescriptionAlarmAlert = async (req, res) => {
  try {
    console.log("createNewPrescriptionAlarmAlert");
    console.log(req.body);
    const type = "patient";
    const category = "New Prescription Alarm";
    const { alarmId } = req.body;
    const getAlarmQuery = `SELECT * FROM alarm WHERE id = ${alarmId}`;
    const alarm = await pool.query(getAlarmQuery);
    const patientId = alarm[0].patientid;
    console.log(alarm[0]);
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    console.log(date);
    const query = `INSERT INTO alerts (type, category, alarmId, patientId, date) VALUES ('${type}', '${category}', ${alarmId},${patientId},'${date}')`;
    const response = await pool.query(query);
    console.log(response);
    res.status(200).json("Alert created");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

//doctor alert
const createPrescriptionDisapprovedAlarmAlert = async (req, res) => {
  const type = "doctor";
  const category = "Prescription Disapproved ";
  const getAlarmQuery = `SELECT * FROM alarm WHERE id = ${alarmId}`;
  const alarm = await pool.query(getAlarmQuery);
  const patientId = alarm[0].patientid;
  console.log(alarm[0]);
  const { alarmId } = req.body;
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const query = `INSERT INTO alerts (type, category, alarmId, patientId, date) VALUES ('${type}', '${category}', ${alarmId},${patientId},'${date}')`;
  try {
    const response = await pool.query(query);
    res.status(200).json("Alert created");
  } catch (error) {
    res.status(500).json(error);
  }
};

// ONLY FOR APP?
const createChangeInProgramAlert = async (req, res) => {
  const type = "patient";
  const category = "Change In Program";
  const { patientId, programName } = req.body;
  const date = "2024-03-16";
  const query = `INSERT INTO alerts (type, category, patientId,programName,date) VALUES ('${type}', '${category}', ${patientId},'${programName}','${date}')`;
  try {
    await pool.query(query);
    res.status(200).json({
      message: "Successful",
      result: true,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const createNewLabReportAlert = async (req, res) => {
  const type = "patient";
  const category = "New Lab Report";
  const { labReportId, patient_id } = req.body;
  console.log(labReportId);
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");
  const query = `INSERT INTO alerts (type, category, labReportId,date,patientId) VALUES ('${type}', '${category}', ${labReportId},'${date}',${patient_id})`;
  try {
    const response = await pool.query(query);
    res.status(200).json("Alert created");
  } catch (error) {
    res.status(500).json(error);
  }
};

//no need for alert
const createNewRequisitionAlert = async (req, res) => {
  const type = "patient";
  const category = "New Requisition";
  const { requisitionId, patientId } = req.body;
  console.log(requisitionId);
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");
  const query = `INSERT INTO alerts (type, category, requisitionId,date,patientId) VALUES ('${type}', '${category}', ${requisitionId},'${date}',${patientId})`;
  try {
    const response = await pool.query(query);
    res.status(200).json("Alert created");
  } catch (error) {
    res.status(500).json(error);
  }
};

const createDeleteAccountAlert = async (req, res) => {
  const type = "patient";
  const category = "Delete Account";
  const { patientId } = req.body;
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");
  const query = `INSERT INTO alerts (type, category, patientId,date) VALUES ('${type}', '${category}', '${patientId}','${date}')`;
  try {
    const response = await pool.query(query);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

const createContactUsAlert = async (req, res) => {
  const type = "patient";
  const category = "Contact Us";
  const { patientId } = req.body;
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");
  console.log(patientId);
  const query = `INSERT INTO alerts (type, category, patientId,date) VALUES ('${type}', '${category}', '${patientId}','${date}')`;
  try {
    const response = await pool.query(query);
    res.status(200).json({
      success: true,
      data: "Alert Added Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const createPrescriptionNotViewedAlert = async (req, res) => {
  const type = "patient";
  const category = "Prescription Not Viewed";
  const { alarmId } = req.body;
  const date = new Date().toLocaleString();
  const query = `INSERT INTO alerts (type, category, alarmId,date) VALUES ('${type}', '${category}', ${alarmId},'${date}')`;
  try {
    const response = await pool.query(query);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
};

const dissapproveAlert = async (req, res) => {
  const { id, alarmId, reason } = req.body;
  // update reason and status of the alarm
  const query = `UPDATE alarm SET status = 'Rejected', reason = '${reason}' WHERE id = ${alarmId}`;
  const getAlarm = `SELECT * FROM alarm WHERE id = ${alarmId}`;
  const alarm = await pool.query(getAlarm);
  const patientId = alarm[0].patientid;
  // delete the alert and create a new alert for the patient
  const deleteAlertQuery = `DELETE FROM alerts WHERE id = ${id}`;
  const type = "doctor";
  const category = "Prescription Disapproved";
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");
  const query2 = `INSERT INTO alerts (type, category, alarmId,date, patientId) VALUES ('${type}', '${category}', ${alarmId},'${date}',${patientId})`;

  try {
    const response = await pool.execute(query);
    const res2 = await pool.execute(deleteAlertQuery);
    const res3 = await pool.execute(query2);
    res.status(200).json("Alert disapproved");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const approveOrDisapprovePrescription = async (req, res) => {
  const { alarmId, status, patientId } = req.body;
  // console.log(alarmId);
  // console.log(status);
  // console.log(patientId)
  const query = `UPDATE alarm SET status = '${status}' WHERE id = ${alarmId}`;
  // create a new alert if the prescription is disapproved
  if (status === "Rejected") {
    const type = "doctor";
    const category = "Prescription Disapproved";
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const query = `INSERT INTO alerts (type, category, alarmId,date,patientId) VALUES ('${type}', '${category}', ${alarmId},'${date}',${patientId})`;
    try {
      const response = await pool.query(query);
    } catch (error) {
      console.log(error);
    }
  }
  try {
    const response = await pool.query(query);
    res.status(200).json("Prescription reviewed");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const dissapproveAllAlerts = async (req, res) => {
  const { presId, reason } = req.body;
  const query = `UPDATE alarm SET status = 'Rejected', reason = '${reason}' WHERE prescriptionid = ${presId}`;
  const deleteAlertsQuery = `DELETE FROM alerts WHERE alarmId IN (SELECT id FROM alarm WHERE prescriptionid = ${presId})`;
  const getAlarmQuery = `SELECT * FROM alarm WHERE prescriptionid = ${presId}`;
  const alarms = await pool.query(getAlarmQuery);
  const type = "patient";
  const category = "Prescription Disapproved";
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");

  try {
    const response = await pool.execute(query);
    const res2 = await pool.execute(deleteAlertsQuery);
    alarms.forEach(async (alarm) => {
      const query2 = `INSERT INTO alerts (type, category, alarmId,date,patientId) VALUES ('${type}', '${category}', ${alarm.id},'${date}',${alarm.patientid})`;
      const res3 = await pool.execute(query2);
    });
    res.status(200).json("Alerts disapproved");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const apporoveAlert = async (req, res) => {
  const { id, alarmId } = req.body;
  const query = `UPDATE alarm SET status = 'Approved' WHERE id = ${alarmId}`;
  // delete the alert and create a new alert for the patient
  const deleteAlertQuery = `DELETE FROM alerts WHERE id = ${id}`;
  const getAlarm = `SELECT * FROM alarm WHERE id = ${alarmId}`;
  const alarm = await pool.query(getAlarm);
  const patientId = alarm[0].patientid;
  const type = "patient";
  const category = "Prescription Approved";
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");
  const query2 = `INSERT INTO alerts (type, category, alarmId,date,patientId) VALUES ('${type}', '${category}', ${alarmId},'${date}',${patientId})`;

  try {
    const response = await pool.execute(query);
    const res2 = await pool.execute(deleteAlertQuery);
    const res3 = await pool.execute(query2);
    console.log("Alert approved");
    res.status(200).json("Alert approved");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const deleAlertbyID = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `DELETE FROM alerts WHERE id = ${id}`;
    const response = await pool.execute(query);
    res.status(200).json("Alert deleted");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const approveAllAlerts = async (req, res) => {
  const { presId } = req.body;
  const query = `UPDATE alarm SET status = 'Approved' WHERE prescriptionid = ${presId}`;
  const deleteAlertsQuery = `DELETE FROM alerts WHERE alarmId IN (SELECT id FROM alarm WHERE prescriptionid = ${presId})`;
  const getAlarmQuery = `SELECT * FROM alarm WHERE prescriptionid = ${presId}`;
  const alarms = await pool.query(getAlarmQuery);
  const type = "patient";
  const category = "Prescription Approved";
  const date = new Date().toLocaleString().slice(0, 19).replace("T", " ");

  try {
    const response = await pool.execute(query);
    const res2 = await pool.execute(deleteAlertsQuery);
    alarms.forEach(async (alarm) => {
      const query2 = `INSERT INTO alerts (type, category, alarmId,date) VALUES ('${type}', '${category}', ${alarm.id},'${date}')`;
      const res3 = await pool.execute(query2);
    });
    res.status(200).json("Alerts approved");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const createNewPrescriptionAlert = async (prescriptionId, patientId) => {
  try {
    const type = "patient";
    const category = "New Prescription";
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const query = `INSERT INTO alerts (type, category, prescriptionId,date,patientId) VALUES ('${type}', '${category}', ${prescriptionId},'${date}',${patientId})`;
    const response = await pool.query(query);
    console.log("Alert added!!");
    // res.status(200).json("Alert created");
  } catch (error) {
    console.log(error);
  }
};

const updateIsReadAlert = async (req, res) => {
  const { id } = req.body;
  console.log(id);
  const query = `UPDATE alerts SET isOpened = 1 WHERE id = '${id}'`;
  try {
    const response = await pool.query(query);
    res.status(200).json("Alert read");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = {
  getAlerts,
  getAlertbyType,
  getAlertbyCategory,
  createDoctorMessageToAdminAlert,
  createNewEnrollmentAlert,
  createNewProgramEnrollmentAlert,
  createNewPrescriptionAlarmAlert,
  createPrescriptionDisapprovedAlarmAlert,
  createChangeInProgramAlert,
  createNewLabReportAlert,
  createNewRequisitionAlert, //no need
  createDeleteAccountAlert,
  createPrescriptionNotViewedAlert,
  approveOrDisapprovePrescription,
  getAlertbyId,
  deleAlertbyID,
  apporoveAlert,
  approveAllAlerts,
  dissapproveAlert,
  dissapproveAllAlerts,
  createNewPrescriptionAlert,
  updateIsReadAlert,
  createContactUsAlert,
  createNewEnrollmentAlertFunction,
  createProgramAlert,
};
