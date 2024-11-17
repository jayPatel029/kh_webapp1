const { connectToDatabase, pool } = require("../databaseConn/database");
const { AlarmAnswers } = require("../Models/alarms");
const { daysOfWeek } = require("./consts");
const { Op } = require("sequelize");
const {
  missedReadings,
  DailyReadings,
  DialysisReadings,
} = require("../Models/readings");

async function checkDialysisEntries() {
  console.log("Checking for Dialysis Entries.....");
   // Get today's date in YYYY-MM-DD format
  const today=new Date().toISOString().slice(0, 19).replace("T", " ");
  
  const entryCount = await pool.query(`
      SELECT COUNT(*) AS entry_count 
      FROM graph_readings_dialysis 
      WHERE DATE(date) = ?
  `, [today]);
console.log(Number(entryCount[0].entry_count))
  if (Number(entryCount[0].entry_count) > 0) {
      
      const missingQuestions = await pool.query(`
          SELECT id,title
          FROM dialysis_readings
          WHERE id NOT IN (
              SELECT question_id
              FROM graph_readings_dialysis
              WHERE DATE(date) = ?
          )
      `, [today]);

      if (missingQuestions.length > 0) {
        const category= `Dialysis Tech has failed to enter dialysis readings for ${missingQuestions.map(q => q.title).join(', ')}`;
        const query = `INSERT INTO alerts (date, type, isOpened, category,  patientId) VALUES ('${today}', '${type}', ${isOpened}, '${category}', ${alarmId}, ${patientId})`;
          console.log(`Missing entries for questions: ${missingQuestions.map(q => q.title).join(', ')}`);
      } else {
          return 'All entries are present for today.';
      }
  } else {
      console.log('No entries found in graph_readings_dialysis for today.');
  }
}
async function checkDialysisEntriesForAdmin(adminId) {
  const today = new Date().toISOString().slice(0, 10);

  // Get patients under this admin
  const patients = await pool.query(`
      SELECT patient_id
      FROM admin_patients
      WHERE admin_id = 7
  `, );

  for (const { patient_id } of patients) {
      // Check if the patient has any entry for today
      const entryCount = await pool.query(`
          SELECT COUNT(*) AS entry_count 
          FROM graph_readings_dialysis 
          WHERE DATE(date) = ? AND user_id = ?
      `, [today, patient_id]);

      if (entryCount[0].entry_count > 0) {
          // Check if readings for all questions are present for today
          const missingQuestions = await pool.query(`
              SELECT id,title
              FROM dialysis_readings
              WHERE id NOT IN (
                  SELECT question_id
                  FROM graph_readings_dialysis
                  WHERE DATE(date) = ? AND user_id = ?
              )
          `, [today, patient_id]);

          if (missingQuestions.length > 0) {
            const category = `Dialysis Tech has failed to enter dialysis readings for ${missingQuestions.map(q => q.title).join(', ')}`;
            const type = 'Patient';  // Specify alert type
            const isOpened = false;         // Mark alert as unopened initially
    
            // Insert alert into the alerts table
            await pool.query(`
              INSERT INTO alerts (date, type, isOpened, category, patientId)
              VALUES (?, ?, ?, ?, ?)
            `, [today, type, isOpened, category, patient_id]);
              console.log(`Missing entries for patient ${patient_id}: ${missingQuestions.map(q => q.title).join(', ')}`);
          } else {
              console.log(`All entries are present for patient ${patient_id} for today.`);
          }
      } else {
          console.log(`No entries found in graph_readings_dialysis for patient ${patient_id} for today.`);
      }
  }
}


async function createNewAlertForPatientDoctors() {
  try {
    console.log("Checking for Missed Prescriptions By The Doctors.....");
    const currentDate = new Date();
    const oneDayAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    const missedAlertsByDoctors = await pool.query(
      "SELECT * FROM alerts WHERE type = ? AND isOpened = ? AND date <= ? AND category = ?",
      ["patient", 0, oneDayAgo, "New Prescription Alarm"]
    );
    //missedAlertsByDoctors=missed alerts by the doctors
    // generate new alert for sub-admin here
    if (missedAlertsByDoctors.length > 0) {
      // create alert for doctors for each missed alert
      missedAlertsByDoctors.forEach(async (alert) => {
        const date = new Date().toISOString().slice(0, 19).replace("T", " ");
        const type = "doctor";
        const isOpened = 0;
        const category = "Missed Prescription Alarm";
        const alarmId = alert.alarmId;
        const patientId = alert.patientId;
      
        const query = `INSERT INTO alerts (date, type, isOpened, category, alarmId, patientId) VALUES ('${date}', '${type}', ${isOpened}, '${category}', ${alarmId}, ${patientId})`;
        try {
          const response = await pool.query(query);
          const alertId= Number(response.insertId);
          const getDoctorsQuery = "SELECT * FROM `doctor_patients` WHERE `patient_id` = ?;";
          const doctors = await pool.execute(getDoctorsQuery, [
            patientId,
          ]);
          doctors.forEach(async (doctor) => {
            const doctorId = doctor.doctor_id;
            
            const isRead = 0;
            const dailyordia = "Missed Alarm";
            const insertQuery = `INSERT INTO alertsread (alertId,isRead,doctorId,dailyordia) VALUES (${alertId},${isRead},${doctorId},'${dailyordia}') `
            try {
              await pool.query(insertQuery)

            } catch (error) {
              console.log(error)

            }

          });
          console.log(
            "New Alert Created for Doctor for Missed Prescription Alarm"
          );
          return;
        } catch (error) {
          console.log(error);
          return;
        }
      });
    }

    const categories = [
      "Doctor Message to Admin",
      "Prescription Disapproved",
      "New Program Enrollment",
      "Missed Alarm",
      "New Lab Report",
      "New Prescription",
      "Contact Us",
      "Delete Account"
    ];

    var missedAlertsByAdmins = await pool.query(
      "SELECT * FROM alerts WHERE isOpened = ? AND date <= ? AND category IN (?)",
      [0, oneDayAgo, categories]
    );

    console.log("in the cron",missedAlertsByAdmins)

    var doctorMessages = await pool.query(
      "SELECT * FROM alerts WHERE isOpened = ? AND date <= ? AND category LIKE ?",
      [0, oneDayAgo, '%Doctor Message to Admin%']
    );
    const combinedAlerts = [...missedAlertsByAdmins, ...doctorMessages];

    // Use a Set to remove any duplicate alerts by their unique identifier (assuming `id` is the unique key)
    const uniqueAlertsMap = new Map();
    combinedAlerts.forEach(alert => {
      uniqueAlertsMap.set(alert.id, alert);
    });


    uniqueAlertsMap.forEach(async (alert) => {
      const date = new Date().toISOString().slice(0, 19).replace("T", " ");
      const type = alert.type;

      const isOpened = 0;
      const category = "Missed " + alert.category;
      const patientId = alert.patientId;
      const programName = alert.programName;

      const query = `INSERT INTO alerts (date, type, isOpened, category, patientId, programName,missedAlertId) VALUES ('${date}', '${type}', ${isOpened}, '${category}', ${patientId}, '${programName}',${alert.id})`;
      try {
        const response = await pool.query(query);
        console.log(
          "New Alert Created for Admin for Missed Program Enrollment"
        );
        return;
      } catch (error) {
        console.log(error);
        return;
      }
    });
  } catch (error) {
    console.log(error);
  }
}

/* 
========================================================================================================
    Function to check missed alarms and create alerts for missed alarms with missed frequency >=3
========================================================================================================
*/
const check_missed_dr_readings = async () => {
  const query = `
  SELECT patients.id AS pid, doctor_daily_readings.title AS title, doctor_daily_readings.dailyreadingid AS readingid
    FROM patients 
    JOIN doctor_patients ON patients.id = doctor_patients.patient_id 
    JOIN doctor_daily_readings ON doctor_patients.doctor_id = doctor_daily_readings.doctorid
    WHERE NOT (EXISTS (SELECT 1 FROM graph_readings WHERE graph_readings.question_id = doctor_daily_readings.dailyreadingid
      AND graph_readings.user_id = patients.id AND graph_readings.date = DATE(NOW())
    ))
    AND NOT EXISTS (
      SELECT 1
      FROM alarm
      WHERE alarm.patientid = patients.id
      AND alarm.parameter = doctor_daily_readings.title
  );
  `;
  const dialysisquery = `
  SELECT patients.id AS pid, doctor_dialysis_readings.title AS title, doctor_dialysis_readings.dialysisreadingid AS readingid
    FROM patients 
    JOIN doctor_patients ON patients.id = doctor_patients.patient_id 
    JOIN doctor_dialysis_readings ON doctor_patients.doctor_id = doctor_dialysis_readings.doctorid
      WHERE NOT (EXISTS (
        SELECT 1 FROM graph_readings_dialysis 
        WHERE graph_readings_dialysis.question_id = doctor_dialysis_readings.dialysisreadingid
        AND graph_readings_dialysis.user_id = patients.id 
        AND graph_readings_dialysis.date = DATE(NOW())
    ))
    AND NOT EXISTS (
      SELECT 1
      FROM alarm
      WHERE alarm.patientid = patients.id
      AND alarm.parameter = doctor_dialysis_readings.title
  )
    ;
    `;

  const rows = await pool.execute(query);
  await Promise.all(
    rows.map(async (row) => {
      const patientId = row.pid;
      const readingId = row.readingid;
      const existingRecord = await missedReadings.findOne({
        where: {
          patientId: patientId,
          readingId: readingId,
          isdialysis: 0,
        },
      });

      if (existingRecord) {
        // Increment missedFrequency
        existingRecord.missedFrequency += 1;
        await existingRecord.save();
      } else {
        // Create new record
        await missedReadings.create({
          patientId: patientId,
          readingId: readingId,
          isdialysis: 0,
          missedFrequency: 1,
        });
      }
    })
  );

  const rowsDialysis = await pool.execute(dialysisquery);
  await Promise.all(
    rowsDialysis.map(async (row) => {
      const patientId = row.pid;
      const readingId = row.readingid;
      const existingRecord = await missedReadings.findOne({
        where: {
          patientId: patientId,
          readingId: readingId,
          isdialysis: 1,
        },
      });

      if (existingRecord) {
        // Increment missedFrequency
        existingRecord.missedFrequency += 1;
        await existingRecord.save();
      } else {
        // Create new record
        await missedReadings.create({
          patientId: patientId,
          readingId: readingId,
          isdialysis: 1,
          missedFrequency: 1,
        });
      }
    })
  );
};

const check_missed_readings = async () => {
  const query = `
  SELECT patients.id AS "pid", daily_readings.id AS "daily_reading_id" 
FROM patients 
JOIN doctor_patients ON patients.id = doctor_patients.patient_id
CROSS JOIN daily_readings 
WHERE NOT EXISTS (
    SELECT 1 
    FROM doctor_daily_readings 
    WHERE doctor_daily_readings.doctorid = doctor_patients.doctor_id
)
AND NOT EXISTS (
    SELECT 1 
    FROM graph_readings 
    WHERE graph_readings.question_id = daily_readings.id 
    AND graph_readings.user_id = patients.id 
    AND graph_readings.date = DATE(NOW())
)
AND NOT EXISTS (
    SELECT 1 
    FROM alarm
    WHERE alarm.patientid = patients.id
    AND alarm.parameter = daily_readings.title
);
  `;
  const dialysisquery = `
  SELECT patients.id AS "pid", dialysis_readings.id AS "dialysis_reading_id"
FROM patients
JOIN doctor_patients ON patients.id = doctor_patients.patient_id
CROSS JOIN dialysis_readings
WHERE NOT EXISTS (
    SELECT 1
    FROM doctor_dialysis_readings
    WHERE doctor_dialysis_readings.doctorid = doctor_patients.doctor_id
)
AND NOT EXISTS (
    SELECT 1
    FROM graph_readings_dialysis
    WHERE graph_readings_dialysis.question_id = dialysis_readings.id
    AND graph_readings_dialysis.user_id = patients.id
    AND graph_readings_dialysis.date = DATE(NOW())
)
AND NOT EXISTS (
    SELECT 1
    FROM alarm
    WHERE alarm.patientid = patients.id
    AND alarm.parameter = dialysis_readings.title
);
  `;

  const rows = await pool.execute(query);

  await Promise.all(
    rows.map(async (row) => {
      const patientId = row.pid;
      const readingId = row.daily_reading_id;
      const existingRecord = await missedReadings.findOne({
        where: {
          patientId: patientId,
          readingId: readingId,
          isdialysis: 0,
        },
      });

      if (existingRecord) {
        // Increment missedFrequency
        existingRecord.missedFrequency += 1;
        await existingRecord.save();
      } else {
        // Create new record
        await missedReadings.create({
          patientId: patientId,
          readingId: readingId,
          isdialysis: 0,
          missedFrequency: 1,
        });
      }
    })
  );

  const rowsDialysis = await pool.execute(dialysisquery);
  await Promise.all(
    rowsDialysis.map(async (row) => {
      const patientId = row.pid;
      const readingId = row.dialysis_reading_id;
      const existingRecord = await missedReadings.findOne({
        where: {
          patientId: patientId,
          readingId: readingId,
          isdialysis: 1,
        },
      });

      if (existingRecord) {
        // Increment missedFrequency
        existingRecord.missedFrequency += 1;
        await existingRecord.save();
      } else {
        // Create new record
        await missedReadings.create({
          patientId: patientId,
          readingId: readingId,
          isdialysis: 1,
          missedFrequency: 1,
        });
      }
    })
  );

  const threetimesrows = await missedReadings.findAll({
    where: {
      missedFrequency: {
        [Op.gte]: 3,
      },
    },
  });

  await Promise.all(
    threetimesrows.map(async (row) => {
      const patientId = row.patientid;
      const readingId = row.readingid;
      const isdialysis = row.isdialysis;

      let title = "";

      if (isdialysis == 0) {
        const record = await DailyReadings.findOne({
          where: {
            id: readingId,
          },
        });
        title = record.title;
      } else {
        const record = await DialysisReadings.findOne({
          where: {
            id: readingId,
          },
        });
        title = record.title;
      }

      const date = new Date().toISOString().slice(0, 19).replace("T", " ");

      // TODO: Insert into alerts table @Anish241
      let pname;
      let AlertText;
      try {
        const findPatient = `SELECT * FROM patients WHERE id = ${patientId}`;
        var patient = await pool.execute(findPatient);
        pname = patient[0].name;
        AlertText = `Patient ${pname} has missed the reading ${title}`;
      } catch (error) {
        console.log(error);
      }
      try {
        const insertQuery =
          isdialysis === 0
            ? `INSERT INTO readingalerts 
      (Name,
        Ailments,
        Type,
        Date,
        AlertText,
        patientId,
        color,
        dailyordia) 
      VALUES 
      ('${title}',
      '${row.ailmentID}',
      'Missed Daily Readings',
      '${date}',
      '${AlertText}',
      ${patientId},
      'red',
      'daily')`
            : `INSERT INTO readingalerts
      (Name,
        Ailments,
        Type,
        Date,
        AlertText,
        patientId,
        color,
        dailyordia)
      VALUES
      ('${title}',
      '${row.ailmentID}',
      'Missed Dialysis Readings',
      '${date}',
      '${AlertText}',
      ${patientId},
      'red',
      'dialysis')`;

        await pool.execute(insertQuery);
        console.log("New Alert Created for Doctor for Missed Alarm");
        await missedReadings.destroy({
          where: {
            patientId: patientId,
            readingId: readingId,
            isdialysis: isdialysis,
          },
        });
      } catch (error) {
        console.log(error);
      }
    })
  );
};

const checkAlarmAnswers = async (alarmList, frequency) => {
  const d = new Date();
  const startTime = new Date();
  startTime.setHours(0, 0, 0, 0);
  const endTime = new Date();
  await Promise.all(
    alarmList.map(async (alarm) => {
      const frq = frequency === "Daily/Weekly" ? alarm.timesaday : 1;
      const ans = await AlarmAnswers.findAll({
        where: {
          alarmID: alarm.id,
          time: {
            [Op.between]: [startTime, endTime],
          },
        },
      });
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      if (!ans || ans.length < frq) {
        const timesmissed = frq - ans.length;
        console.log("Times Missed: ", timesmissed);
        const missedquery =
          "UPDATE alarm SET missedFrequency = missedFrequency + " +
          timesmissed +
          " WHERE id = ?;";
        await pool.execute(missedquery, [alarm.id]);
      }
    })
  );
};

async function checkMissedAlarms() {
  console.log("Checking for Missed Alarms.....");
  const d = new Date();
  let day = d.getDay();
  const dailyQuery =
    "SELECT * FROM `alarm` WHERE `alarm`.`frequency` = 'Daily/Weekly' AND status='Approved' AND FIND_IN_SET(?, `weekdays`); ";
  const todayDailyAlarms = await pool.execute(dailyQuery, [daysOfWeek[day]]);
  const monthlyQuery =
    "SELECT * FROM `alarm` WHERE `alarm`.`frequency` = 'Monthly' AND FIND_IN_SET(?, `dateofmonth`); ";
  const monthlyAlarms = await pool.execute(monthlyQuery, [d.getDate()]);
  checkAlarmAnswers(todayDailyAlarms, (frequency = "Daily/Weekly")).then(
    async () => {
      checkAlarmAnswers(monthlyAlarms, (frequency = "Monthly")).then(
        async () => {
          const missedQuery =
            "SELECT * FROM `alarm` WHERE `missedFrequency` >= 3;";
          const missedAlarms = await pool.execute(missedQuery);
          console.log(
            "=========================================================="
          );
          console.log("Missed Alarms: ", missedAlarms);
          console.log(
            "=========================================================="
          );
          missedAlarms.forEach(async (alarm) => {
            const missedAlertQuery =
              "INSERT INTO `alerts` (`date`, `type`, `isOpened`, `category`, `alarmId`, `patientId`) VALUES (?, ?, ?, ?, ?, ?);";
            let res;
              if(alarm?.type === "Prescription"){
              res= await pool.execute(missedAlertQuery, [
                d,
                "patient",
                0,
                "Patient has not answered medicine alarm for 3 or more days",
                alarm.id,
                alarm.patientid,
              ]);
            }
            else if(alarm?.type === "Dialysis"){
              res= await pool.execute(missedAlertQuery, [
                d,
                "patient",
                0,
                "Patient has not answered dialysis alarm for 3 or more days",
                alarm.id,
                alarm.patientid,]);
            }
            const alertId = Number(res.insertId);
            const getDoctorsQuery = "SELECT * FROM `doctor_patients` WHERE `patient_id` = ?;";
            const doctors = await pool.execute(getDoctorsQuery, [
              alarm.patientid,
            ]);
            doctors.forEach(async (doctor) => {
              const doctorId = doctor.doctor_id;
              const patientId = alarm.patientid;
              const isRead = 0;
              const dailyordia = "Missed Alarm";
              const insertQuery = `INSERT INTO alertsread (alertId,isRead,doctorId,dailyordia) VALUES (${alertId},${isRead},${doctorId},'${dailyordia}') `
              try {
                await pool.query(insertQuery)

              } catch (error) {
                console.log(error)

              }

            });


          });
          const updateQuery =
            "UPDATE `alarm` SET `missedFrequency` = 0 WHERE `missedFrequency` >= 3 ;";
          await pool.execute(updateQuery);
          const addisReadQuery = "UPDATE `alarm` SET `isRead` = 0;";
        }
      );
    }
  );
}

async function checkMissedAlarmsForDoctors() {
  console.log("Checking for Missed Alarms.....");
  const d = new Date();
  let day = d.getDay();
  const dailyQuery =
    "SELECT * FROM `alarm` WHERE `alarm`.`frequency` = 'Daily/Weekly' AND status='Pending' AND FIND_IN_SET(?, `weekdays`); ";
  const todayDailyAlarms = await pool.execute(dailyQuery, [daysOfWeek[day]]);
  const monthlyQuery =
    "SELECT * FROM `alarm` WHERE `alarm`.`frequency` = 'Monthly' AND FIND_IN_SET(?, `dateofmonth`); ";
  const monthlyAlarms = await pool.execute(monthlyQuery, [d.getDate()]);
  checkAlarmAnswers(todayDailyAlarms, (frequency = "Daily/Weekly")).then(
    async () => {
      checkAlarmAnswers(monthlyAlarms, (frequency = "Monthly")).then(
        async () => {
          const missedQuery =
            "SELECT * FROM `alarm` WHERE `missedFrequency` >= 3;";
          const missedAlarms = await pool.execute(missedQuery);
          console.log(
            "=========================================================="
          );
          console.log("Missed Alarms: ", missedAlarms);
          console.log(
            "=========================================================="
          );
          missedAlarms.forEach(async (alarm) => {
            const missedAlertQuery =
              "INSERT INTO `alerts` (`date`, `type`, `isOpened`, `category`, `alarmId`, `patientId`) VALUES (?, ?, ?, ?, ?, ?);";
            let res;
              
              res= await pool.execute(missedAlertQuery, [
                d,
                "doctor",
                0,
                "Doctor has failed to approve/disapprove medicine alarm for 3 or more days",
                alarm.id,
                alarm.patientid,
              ]);
            
            
            const alertId = Number(res.insertId);
            const getDoctorsQuery = "SELECT * FROM `doctor_patients` WHERE `patient_id` = ?;";
            const doctors = await pool.execute(getDoctorsQuery, [
              alarm.patientid,
            ]);
            doctors.forEach(async (doctor) => {
              const doctorId = doctor.doctor_id;
              const patientId = alarm.patientid;
              const isRead = 0;
              const dailyordia = "Missed Alarm";
              const insertQuery = `INSERT INTO alertsread (alertId,isRead,doctorId,dailyordia) VALUES (${alertId},${isRead},${doctorId},'${dailyordia}') `
              try {
                await pool.query(insertQuery)

              } catch (error) {
                console.log(error)

              }

            });


          });
          const updateQuery =
            "UPDATE `alarm` SET `missedFrequency` = 0 WHERE `missedFrequency` >= 3 ;";
          await pool.execute(updateQuery);
          const addisReadQuery = "UPDATE `alarm` SET `isRead` = 0;";
        }
      );
    }
  );
}

const deleteExpiredOTPs = async () => {
  try {
    // Calculate the timestamp 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Define the DELETE query to delete OTPs older than 5 minutes
    const deleteQuery = `
      DELETE FROM mail_otp
      WHERE timestamp < '${fiveMinutesAgo}'
    `;

    // Execute the DELETE query using the connection pool
    await pool.query(deleteQuery);

    console.log("Expired OTPs deleted successfully.");
  } catch (error) {
    console.error("Error deleting expired OTPs:", error);
  }
};

module.exports = {
  createNewAlertForPatientDoctors,
  // check_missed_dr_readings,
  check_missed_readings,
  checkMissedAlarmsForDoctors,
  checkMissedAlarms,
  checkDialysisEntries,
  deleteExpiredOTPs,
  checkDialysisEntriesForAdmin,
};
