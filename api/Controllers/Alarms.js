const { or } = require("sequelize");
const { pool } = require("../databaseConn/database.js");
const { AlarmDoses, AlarmAnswers } = require("../Models/alarms.js");

// Insert alarm
async function insertAlarm(req, res) {
  let {
    doctorId,
    type,
    parameter,
    description,
    frequency,
    timesamonth,
    weekdays,
    timesaday,
    time,
    status,
    reason,
    dateofmonth,
    pid,
    prescriptionid,
    message,
    doses,
  } = req.body;

  if (frequency === "Daily/Weekly" && !weekdays) {
    weekdays = "Mon,Tues,Wed,Thurs,Fri,Sat,Sun";
  }

  const query =
    "INSERT INTO alarm (doctorId, type, parameter, description, frequency, timesamonth, weekdays, timesaday, time, status, reason, dateofmonth, patientid, prescriptionid, dateadded,messagefordoctor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ?, ?, ?)";
  const values = [
    doctorId || null,
    type || null,
    parameter || null,
    description || null,
    frequency || null,
    timesamonth || null,
    weekdays || null,
    timesaday || null,
    time || null,
    status || null,
    reason || null,
    dateofmonth || null,
    pid,
    prescriptionid || null,
    new Date().toISOString().slice(0, 19).replace("T", " "),
    message || null,
  ];

  try {
    const result = await pool.query(query, values);
    if (result && doses?.length > 0) {
      doses.forEach(async (element) => {
        await AlarmDoses.create({
          alarmID: parseInt(result.insertId),
          doses: element.dose,
          time: element.time,
          unitType: element.doseUnit,
          status: "Pending",
        });
      });
    }
    else if (result && (!doses || doses?.length === 0)) {
      const timesarray = time.split(",");
      timesarray.forEach(async (element) => {
        await AlarmDoses.create({
          alarmID: parseInt(result.insertId),
          doses: null,
          time: element,
          unitType: null,
          status: "Pending",
        });
      });
    }
    res.status(200).json({ data: Number(result.insertId) });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating alarm");
  }
}

// Select all alarms
async function getAllAlarms(req, res) {
  const query = "SELECT * FROM alarm";
  const result = await pool.query(query);
  res.status(200).json({ data: result });
}

// Delete alarm by ID
async function deleteAlarm(req, res) {
  const alarmId = req.params.id;
  const query = "DELETE FROM alarm WHERE id = ?";
  try {
    const result = await pool.query(query, [alarmId]);
    res.status(200).json("Alarm deleted successfully");
  } catch (error) {
    console.error(err);
    res.status(500).send("Error deleting alarm");
  }
}

// Update alarm by ID
async function updateAlarm(req, res) {


  let {
    doctorId,
    type,
    parameter,
    description,
    frequency,
    timesamonth,
    weekdays,
    timesaday,
    time,
    status,
    reason,
    dateofmonth,
    pid,
    prescriptionid,
    message,
    doses,
  } = req.body;

  const alarmId = req.params.id;

  console.log("Body",req.body);
  console.log(alarmId);

  if (frequency === "Daily/Weekly" && !weekdays) {
    weekdays = "Mon,Tues,Wed,Thurs,Fri,Sat,Sun";
  }

  const query = `UPDATE alarm SET doctorId = ?, type = ?, parameter = ?, description = ?, frequency = ?, timesamonth = ?, weekdays = ?, timesaday = ?, time = ?, status = ?, reason = ?, dateofmonth = ?, patientid = ?, prescriptionid = ?, dateadded = ?, messagefordoctor = ? WHERE id = ?
  `
  const values = [
    doctorId || null,
    type || null,
    parameter || null,
    description || null,
    frequency || null,
    timesamonth || null,
    weekdays || null,
    timesaday || null,
    time || null,
    status || null,
    reason || null,
    dateofmonth || null,
    pid,
    prescriptionid || null,
    new Date().toISOString().slice(0, 19).replace("T", " "),
    message || null,
  ];

  await AlarmDoses.destroy({
    where: {
      alarmID: alarmId,
    },
  });

  if (doses?.length > 0) {
    doses.forEach(async (element) => {
      await AlarmDoses.create({
        alarmID: alarmId,
        doses: element.dose,
        time: element.time,
        unitType: element.doseUnit,
        status: status || "Pending",
      });
    });
  }
  else if (!doses || doses?.length === 0) {
    const timesarray = time.split(",");
    timesarray.forEach(async (element) => {
      await AlarmDoses.create({
        alarmID: alarmId,
        doses: null,
        time: element,
        unitType: null,
        status: status || "Pending",
      });
    });
  }

  try {
    const result = await pool.query(query, [...values, alarmId]);
    console.log("True");
    if (result && doses?.length > 0) {
      doses.forEach(async (element) => {
        console.log(result.insertId);
        // update alarm doses
        await AlarmDoses.update(
          {
            doses: element.dose,
            time: element.time,
            unitType: element.doseUnit,
            status: "Pending",
          },
          {
            where: {
              alarmID: parseInt(alarmId),
            },
          }
        );
      });
    }
    res.status(200).json({ data: Number(result.insertId) });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating alarm");
  }
}

const getAlarmbyId = async (req, res) => {
  const alarmId = req.params.id;
  const query = "SELECT * FROM alarm WHERE id = ?";
  const result = await pool.query(query, [alarmId]);
  const doses = await AlarmDoses.findAll({
    where: { alarmID: alarmId },
  });
  res.status(200).json({ data: result, doses});
};

const getAlarmbyPatientId = async (req, res) => {
  const patientId = req.params.id;
  const query = "SELECT * FROM alarm WHERE patientid = ?";
  const result = await pool.query(query, [patientId]);
  var doses = [];
  for (let i = 0; i < result.length; i++) {
    const dose = await AlarmDoses.findAll({
      where: { alarmID: result[i].id },
    });
    doses.push(dose);
  }
  res.status(200).json({ data: result, doses});
};

const updateReason = async (req, res) => {
  const alarmId = req.params.id;
  const { reason } = req.body;
  console.log(reason);
  console.log(alarmId);
  const query = `UPDATE alarm SET reason = '${reason}' WHERE id = ${alarmId}`;
  try {
    const result = await pool.query(query);
    console.log("Reason updated successfully");
    res.status(200).json({ data: "Reason updated successfully" });
  } catch (error) {
    console.error(error);
    console.log("Error updating reason");
    res.status(500).send("Error updating reason");
  }
};

const answerAlarm = async (req, res) => {
  const { time, alarmID, alarmSubID } = req.body;
  const alarmDoseID = alarmSubID || null;
  try {
    await AlarmAnswers.create({
      alarmID,
      alarmDoseID,
      time,
    });
    res.status(200).json({ data: "Alarm answered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error answering alarm");
  }
};

module.exports = {
  insertAlarm,
  getAllAlarms,
  deleteAlarm,
  updateAlarm,
  getAlarmbyId,
  getAlarmbyPatientId,
  updateReason,
  answerAlarm,
};
