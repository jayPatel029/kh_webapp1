const { pool } = require("../../databaseConn/database.js");

function getIndexesFromString(daysString) {
  if (daysString == null) return "";
  const daysMap = {
    Sun: 7,
    Mon: 1,
    Tues: 2,
    Wed: 3,
    Thurs: 4,
    Fri: 5,
    Sat: 6,
  };

  const daysArray = daysString.split(",").map((day) => day.trim());
  const indexesArray = daysArray.map((day) => daysMap[day]);
  // console.log(indexesArray.join(","));
  return indexesArray.join(",");
}

function convertAlarmTypeFromInt(alarmType) {
  if (alarmType == null) return "";
  const typesMap = {
    2: "Dialysis",
    3: "Health Reading",
    1: "Prescription",
    4: "Diet Details",
  };

  // console.log(typesMap[alarmType].toString());
  return typesMap[alarmType];
}
function getAlarmTypeFromString(alarmType) {
  if (alarmType == null) return "";
  const typesMap = {
    Dialysis: 2,
    "Health Reading": 3,
    Prescription: 1,
    "Diet Details": 4,
  };

  // console.log(typesMap[alarmType].toString());
  return typesMap[alarmType];
}

const getAlarmOfPatient = async (req, res) => {
  const { patientId } = req.body;
  const query = `SELECT * FROM alarm WHERE patientid = '${patientId}' AND status = "Approved"`;
  try {
    const result = await pool.query(query, [patientId]);
    if (result.length > 0) {
      var respData = [];
      for (var i in result) {
        const alarmID = result[i]["id"];
        const query2 = `SELECT * FROM alarm_doses where alarmID = '${alarmID}'`;
        var timeDoses = [];
        try {
          const result2 = await pool.query(query2);
          for (var j in result2) {
            timeDoses.push({
              autoID: result2[j]["autoID"],
              time: result2[j]["time"],
              doses: parseFloat(result2[j]["doses"]) || 0,
              unitType: result2[j]["unitType"] || "tablet",
            });
          }
        } catch (err) {
          console.log(err);
          res.status(500).json({
            result: false,
            error: "error finding doses",
          });
        }

        var obj = {
          userParameterID: result[i]["doctorId"],
          userID: parseInt(patientId),
          alarmID: result[i]["id"],
          setByuser: result[i]["setByUser"] == "1" ? true : false,
          alarmType: getAlarmTypeFromString(result[i]["type"]), // if dialysis then 2, health parameter then 3, diet details then 4, medicine 1
          shortDesc: result[i]["description"] || result[i]["parameter"],
          isWeek:
            result[i]["isWeek"] == 1 ||
            result[i]["isWeek"] == "true" ||
            result[i]["frequency"] === "Daily/Weekly"
              ? true
              : false,
          daysOFWeek:
            result[i]["daysOFWeek"] ||
            getIndexesFromString(result[i]["weekdays"]),
          datesOFMonth: result[i]["dateofmonth"] || "",
          timeInADay: parseInt(result[i]["timesaday"]),
          timeInMonth: result[i]["timesamonth"],
          timeDoses: timeDoses,
        };
        respData.push(obj);
      }
      res.status(200).json({
        result: true,
        message: "Successful",
        alarmList: respData,
      });
    } else {
      res.status(200).json({
        result: false,
        message: "Data Not Found",
        data: null,
      });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error while fetching alarms", error: err });
  }
};

//!changes here

// const createAlarm = async (req, res) => {
//   console.log("creating alarm");
//   const {
//     userID,
//     userParameterID,
//     alarmType,
//     parameter,
//     shortDesc,
//     frequency,
//     timeInMonth,
//     weekdays,
//     timeInADay,
//     timeDoses,
//     status,
//     reason,
//     datesOFMonth,
//     prescriptionid,
//     setByuser,
//     isWeek,
//     daysOFWeek,
//   } = req.body;

//   // console.log(req.body);
//   // console.log(timeDoses);
//   // console.log(timeDoses[0]["time"]);
//   // console.log(timeDoses[0]["doses"]);
//   // console.log(userParameterID);

//   const query = `INSERT INTO alarm (doctorId, type, parameter, description, frequency, timesamonth, weekdays, timesaday, time, status, reason, dateofmonth, patientid, prescriptionid, dateadded, setByUser, isWeek, daysOFWeek) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ?, ? , ? , ?)`;
//   const values = [
//     userParameterID,
//     convertAlarmTypeFromInt(alarmType) || null,
//     parameter || null,
//     shortDesc || null,
//     timeDoses[0]["doses"] || null,
//     timeInMonth || null,
//     weekdays || null,
//     timeInADay || null,
//     timeDoses[0]["time"] || null,
//     status || "Approved",
//     reason || null,
//     datesOFMonth || null,
//     userID,
//     prescriptionid || null,
//     new Date().toISOString().slice(0, 19).replace("T", " "),
//     setByuser,
//     isWeek,
//     daysOFWeek,
//   ];
//   /*

//   {userParameterID: 0, userID: 11, alarmID: 0, setByuser: true, alarmType: 2, shortDesc: test, isWeek: true, daysOFWeek: 1, datesOFMonth: , timeInADay: 2, timeInMonth: 0, timeDoses: [{autoID: 0, time: 8:00, doses: 1.0, unitType: tablet}, {autoID: 0, time: 8:00, doses: 1.0, unitType: tablet}]}

//   {userParameterID: 0, userID: 11, alarmID: 0, setByuser: true, alarmType: 2, shortDesc: tryyyyy, isWeek: true, daysOFWeek: 1,2, datesOFMonth: , timeInADay: 2, timeInMonth: 0, timeDoses: [{autoID: 0, time: 8:00, doses: 1.0, unitType: tablet}, {autoID: 0, time: 21:00, doses: 1.0, unitType: tablet}]}
//   */
//   console.log("body sent: ", values);
//   try {
//     // const result = await pool.query(query);
//     const result = await pool.query(query, values);
//     const alarmID = result.insertId;
//     var a = [];
//     for (var i in timeDoses) {
//       const query2 = `INSERT INTO alarm_doses (alarmID, time, doses, unitType, createdAt, updatedAt) VALUES (? , ? , ? , ? , ? , ?)`;
//       const values2 = [
//         alarmID,
//         timeDoses[i]["time"],
//         timeDoses[i]["doses"],
//         timeDoses[i]["unitType"],
//         new Date().toISOString().slice(0, 19).replace("T", " "),
//         new Date().toISOString().slice(0, 19).replace("T", " "),
//       ];
//       try {
//         const result2 = await pool.query(query2, values2);
//         a.push(result2.insertId);
//       } catch (err) {
//         console.error(err);
//         res.status(500).send("Error addin doses");
//         break;
//       }
//     }

//     res.status(200).json({
//       result: true,
//       // message: "2520", // auto id of dose
//       message: a.join(","),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error creating alarm");
//   }
// };

const createAlarm = async (req, res) => {
  console.log("Creating alarm");
  const {
    userID,
    userParameterID,
    alarmType,
    parameter,
    shortDesc,
    frequency,
    timeInMonth,
    weekdays,
    timeInADay,
    timeDoses,
    status,
    reason,
    datesOFMonth,
    prescriptionid,
    setByuser,
    isWeek,
    daysOFWeek,
  } = req.body;

  const currentTimestamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const alarmTypeConverted = convertAlarmTypeFromInt(alarmType) || null;

  // Log input values to check if they are correct
  console.log("Received values:", {
    userID,
    userParameterID,
    alarmTypeConverted,
    parameter,
    shortDesc,
    frequency,
    timeInMonth,
    weekdays,
    timeInADay,
    timeDoses,
    status,
    reason,
    datesOFMonth,
    prescriptionid,
    setByuser,
    isWeek,
    daysOFWeek,
  });

  // Query for alarm table
  const query = `
    INSERT INTO alarm 
    (doctorId, type, parameter, description, frequency, timesamonth, weekdays, timesaday, time, status, reason, dateofmonth, patientid, prescriptionid, dateadded, setByUser, isWeek, daysOFWeek)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    userParameterID,
    alarmTypeConverted,
    parameter || null,
    shortDesc || null,
    timeDoses?.[0]?.doses || null,
    timeInMonth || null,
    weekdays || null,
    timeInADay || null,
    timeDoses?.[0]?.time || null,
    status || "Approved",
    reason || null,
    datesOFMonth || null,
    userID,
    prescriptionid || null,
    currentTimestamp,
    setByuser,
    isWeek,
    daysOFWeek,
  ];

  console.log("Query for alarm table:", query);
  console.log("Values for alarm table:", values);

  try {
    const result = await pool.query(query, values);
    const alarmID = result.insertId;
    console.log("Alarm created with ID:", alarmID);

    const doseIDs = [];
    for (const dose of timeDoses || []) {
      const query2 = `
        INSERT INTO alarm_doses 
        (alarmID, time, doses, unitType, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?)`;

      const values2 = [
        alarmID,
        dose.time,
        dose.doses,
        dose.unitType,
        currentTimestamp,
        currentTimestamp,
      ];

      console.log("Query for alarm_doses table:", query2);
      console.log("Values for alarm_doses table:", values2);

      try {
        const result2 = await pool.query(query2, values2);
        doseIDs.push(result2.insertId);
        console.log("Dose added with ID:", result2.insertId);
      } catch (err) {
        console.error("Error inserting dose:", err);
        return res.status(500).json({ error: "Error adding doses" });
      }
    }

    res.status(200).json({
      result: true,
      message: doseIDs.join(","),
    });
  } catch (error) {
    console.error("Error creating alarm:", error);
    res.status(500).json({ error: "Error creating alarm" });
  }
};

const updateAlarm = async (req, res) => {
  const {
    alarmID,
    userID,
    userParameterID,
    alarmType,
    parameter,
    shortDesc,
    frequency,
    timeInMonth,
    weekdays,
    timeInADay,
    timeDoses,
    status,
    reason,
    datesOFMonth,
    prescriptionid,
    // setByuser,
    isWeek,
    daysOFWeek,
  } = req.body;

  console.log("Alarm updating: for", alarmID);

  const query = `UPDATE alarm SET type=?, parameter=?, description=?, frequency=?, timesamonth=?, weekdays=?, timesaday=?, time=?, status=?, reason=?, dateofmonth=?, patientid=?, prescriptionid=?, dateadded=?, isWeek=?, daysOFWeek=? WHERE id = ?`;
  const values = [
    userParameterID,
    convertAlarmTypeFromInt(alarmType) || null,
    parameter || null,
    shortDesc || null,
    timeDoses[0]["doses"] || null,
    timeInMonth || null,
    weekdays || null,
    timeInADay || null,
    timeDoses[0]["time"] || null,
    status || "Approved",
    reason || null,
    datesOFMonth || null,
    userID,
    prescriptionid || null,
    new Date().toISOString().slice(0, 19).replace("T", " "),
    // currentSetByUser,
    // setByuser,
    isWeek,
    daysOFWeek,
    alarmID, // alarmID for update
  ];

  try {
    const result = await pool.query(query, values);
    const existingDosesQuery = `DELETE FROM alarm_doses WHERE alarmID = ?`;
    try {
      await pool.query(existingDosesQuery, [alarmID]);
    } catch (error) {
      console.error(error);
      throw "error deleting doses";
    }

    var a = [];
    for (var i in timeDoses) {
      const query2 = `INSERT INTO alarm_doses (alarmID, time, doses, unitType, createdAt, updatedAt) VALUES (? , ? , ? , ? , ? , ?)`;
      const values2 = [
        alarmID,
        timeDoses[i]["time"],
        timeDoses[i]["doses"],
        timeDoses[i]["unitType"],
        new Date().toISOString().slice(0, 19).replace("T", " "),
        new Date().toISOString().slice(0, 19).replace("T", " "),
      ];
      try {
        const result2 = await pool.query(query2, values2);
        a.push(result2.insertId);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error adding doses");
        break;
      }
    }

    res.status(200).json({
      result: true,
      message: a.join(","),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      result: false,
      message: "Error updating the doses",
    });
  }
};

//for patient app
async function insertAlarm(req, res) {
  const { alarmID } = req.body;

  const isNewAlarm = alarmID === 0;

  if (isNewAlarm) {
    await createAlarm(req, res);
  } else {
    await updateAlarm(req, res);
  }
}

const deleteAlarm = async (req, res, next) => {
  const { alarmID, userID } = req.body;
  console.log(alarmID, userID);
  const query = `DELETE FROM alarm where id = ${alarmID} and patientid = ${userID};`;

  try {
    await pool.query(query);

    res.status(200).json({
      result: true,
      message: "Successful",
    });
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Failed to delete Alarm",
    });
  }
};

// todo
const deleteAlarmSetByAdmin = async (req, res, next) => {
  const { alarmID, userID } = req.body;

  const query = `DELETE FROM alarm where alarmID = ${alarmID} and patientid = ${userID};`;

  try {
    await pool.query(query);

    res.status(200).json({
      result: true,
      message: "Successful",
    });
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Failed to delete Alarm",
    });
  }
};

module.exports = {
  getAlarmOfPatient,
  insertAlarm,
  deleteAlarm,
};
