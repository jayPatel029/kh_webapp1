const { pool } = require("../../databaseConn/database.js");
const { uploadFile } = require("../../Helpers/auth/uploadDataHelper.js");
const {
  getColor,
  convertDateFormat,
} = require("../../Helpers/date_formatter.js");
const translations = require("./translation.json");

const fetchDailyParameters = async (req, res) => {
  const { userID, date, language } = req.body;
  try {
    const query = `SELECT doctor_id FROM doctor_patients WHERE patient_id = ${userID};`;
    const resp = await pool.query(query);
    const processedDailyReadings = new Set();
    const respOut = [];

    if (resp.length > 0) {
      for (const doctor of resp) {
        const query2 = `SELECT dailyreadingid, title FROM doctor_daily_readings WHERE doctorid = ${doctor["doctor_id"]};`;
        const resp2 = await pool.query(query2);

        if (resp2.length > 0) {
          for (const dailyReadingsID of resp2) {
            const readingID = dailyReadingsID["dailyreadingid"];
            const dailyTitle = dailyReadingsID["title"];
            console.log(dailyTitle);
            if (processedDailyReadings.has(readingID)) {
              continue;
            }
            if (
              dailyTitle === "Systolic and Diastolic Evening Blood Pressure"
            ) {
              const readingID2 = 6;
              const query3 = `SELECT * FROM daily_readings WHERE id = ${readingID2}`;
              const resp3 = await pool.query(query3);

              if (resp3.length > 0) {
                const dailyReadings = resp3[0];
                const answerQuery = `SELECT readings FROM graph_readings WHERE question_id = ${readingID2} AND user_id = ${userID} AND date = '${date}';`;
                const answerResp = await pool.query(answerQuery);
                let answer = "";
                if (answerResp.length > 0) {
                  answer = answerResp[0].readings;
                }

                const parameterName = dailyReadings.title;
                const parameterTranslation = translations[parameterName];
                const parameterNameTranslation = parameterTranslation
                  ? parameterTranslation[language]
                  : parameterName;

                const unitOfMeasure = dailyReadings.unit;
                const unitOfMeasureTranslation = dailyReadings.unit;

                respOut.push({
                  userParameterID: parseInt(doctor["doctor_id"]),
                  parameterID: readingID2,
                  parameterName: parameterName,
                  parameterNameTranslation: parameterNameTranslation,
                  parameterType: dailyReadings["type"],
                  unitOfMeasure: unitOfMeasure,
                  unitOfMeasureTranslation: unitOfMeasureTranslation,
                  daysOfWeek: "1,2,3,4,5,6,7",
                  daysOfMonth: "",
                  answer: answer.toString(),
                  date: date,
                });
                processedDailyReadings.add(readingID2);
              }
            } else if (
              dailyTitle === "Systolic and Diastolic Morning Blood Pressure"
            ) {
              const readingID2 = 7;
              const query3 = `SELECT * FROM daily_readings WHERE id = ${readingID2}`;
              const resp3 = await pool.query(query3);
              if (resp3.length > 0) {
                const dailyReadings = resp3[0];
                const answerQuery = `SELECT readings FROM graph_readings WHERE question_id = ${readingID2} AND user_id = ${userID} AND date = '${date}';`;
                const answerResp = await pool.query(answerQuery);
                let answer = "";
                if (answerResp.length > 0) {
                  answer = answerResp[0].readings;
                }

                const parameterName = dailyReadings.title;
                const parameterTranslation = translations[parameterName];
                const parameterNameTranslation = parameterTranslation
                  ? parameterTranslation[language]
                  : parameterName;

                const unitOfMeasure = dailyReadings.unit;
                const unitOfMeasureTranslation = dailyReadings.unit;

                respOut.push({
                  userParameterID: parseInt(doctor["doctor_id"]),
                  parameterID: readingID2,
                  parameterName: parameterName,
                  parameterNameTranslation: parameterNameTranslation ?? parameterName,
                  parameterType: dailyReadings["type"],
                  unitOfMeasure: unitOfMeasure,
                  unitOfMeasureTranslation: unitOfMeasureTranslation,
                  daysOfWeek: "1,2,3,4,5,6,7",
                  daysOfMonth: "",
                  answer: answer.toString(),
                  date: date,
                });
                processedDailyReadings.add(readingID);
              }
            }

            const query3 = `SELECT * FROM daily_readings WHERE id = ${readingID}`;
            const resp3 = await pool.query(query3);

            if (resp3.length > 0) {
              const dailyReadings = resp3[0];
              const answerQuery = `SELECT readings FROM graph_readings WHERE question_id = ${readingID} AND user_id = ${userID} AND date = '${date}';`;
              const answerResp = await pool.query(answerQuery);
              let answer = "";
              if (answerResp.length > 0) {
                answer = answerResp[0].readings;
              }

              const parameterName = dailyReadings.title;
              const parameterTranslation = translations[parameterName];
              const parameterNameTranslation = parameterTranslation
                ? parameterTranslation[language]
                : parameterName;

              const unitOfMeasure = dailyReadings.unit;
              const unitOfMeasureTranslation = dailyReadings.unit;

              respOut.push({
                userParameterID: parseInt(doctor["doctor_id"]),
                parameterID: readingID,
                parameterName: parameterName,
                parameterNameTranslation: parameterNameTranslation,
                parameterType: dailyReadings["type"],
                unitOfMeasure: unitOfMeasure,
                unitOfMeasureTranslation: unitOfMeasureTranslation,
                daysOfWeek: "1,2,3,4,5,6,7",
                daysOfMonth: "",
                answer: answer.toString(),
                date: date,
              });

              // Mark reading as processed
              processedDailyReadings.add(readingID);
            }
          }
        }
      }

      // Fetch additional data from daily_readings where showUser = userID
      const additionalQuery = `SELECT * FROM daily_readings WHERE showUser = ${userID}`;
      const additionalResp = await pool.query(additionalQuery);

      if (additionalResp.length > 0) {
        for (const row of additionalResp) {
          const unitOfMeasure = dailyReadings.unit ?? "a";
          const parameterName = row.title;
          const parameterTranslation = translations[parameterName];
          const parameterNameTranslation = parameterTranslation
            ? parameterTranslation[language]
            : parameterName;

          if (answerResp.length > 0) {
            answer = answerResp[0].readings;
          }
          respOut.push({
            userParameterID: null, // Set appropriate value here if available
            parameterID: row.id,
            parameterType: row.type,
            parameterName: parameterName,
            parameterNameTranslation: parameterNameTranslation,
            unitOfMeasure: unitOfMeasure,
            daysOfWeek: "1,2,3,4,5,6,7",
            daysOfMonth: "",
            answer: answer,
            date: date,
          });
        }
      }

      res.status(200).json({
        result: true,
        message: "Successful",
        list: respOut,
      });
    } else {
      res.status(200).json({
        result: false,
        message: "No medical Team found",
        list: null,
      });
    }
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Error while fetching daily parameters",
      list: null,
    });
  }
};

const answerDailyParameters = async (req, res) => {
  const { parameterid, userid, userparameterid, date, isimage, answer } =
    req.headers;
  // console.log(parameterid, userid, userparameterid, date, isimage, answer);
  try {
    if (isimage !== "false") {
      let phtotolocation = "";
      const image = req.file;
      try {
        if (image != null) {
          const fileExtension = image.originalname.split(".").pop();
          const fileName = `dailyParams${Math.floor(
            Math.random() * 100000
          )}.${fileExtension}`;
          // console.log(image);
          phtotolocation = await uploadFile(fileName, image.path);
          const query = `INSERT INTO graph_readings (question_id, user_id, date, readings) VALUES (?, ?, ?, ?)`;
          const resp = await pool.query(query, [
            parameterid,
            userid,
            date,
            phtotolocation,
          ]);
          res.status(200).json({
            result: true,
            message: "Successful",
          });
        } else {
          throw "No file sent";
        }
      } catch (err) {
        console.error("Error uploading daily parameter", err);
        throw err;
      }
    } else {
      const query = `INSERT INTO graph_readings (question_id, user_id, date, readings) VALUES (?, ?, ?, ?)`;
      const resp = await pool.query(query, [parameterid, userid, date, answer]);
      res.status(200).json({
        result: true,
        message: "Successful",
      });
    }
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Error adding daily parameters",
      list: null,
    });
  }
};

const fetchDailyParametersById = async (req, res) => {
  const { parameterID, userID } = req.body;

  try {
    const query = `SELECT * FROM graph_readings where user_id = ${userID} AND question_id = ${parameterID}`;
    const resp = await pool.query(query);
    // console.log(resp);
    if (resp.length > 0) {
      const getNameQuery = `SELECT * from daily_readings where id = ${parameterID}`;
      const dailyReading = await pool.query(getNameQuery);
      // console.log(dailyReading);

      if (dailyReading.length == 0) throw "Error fetching daily readings";

      var lowRange1 = 0;
      var lowRange2 = 0;
      var highRange1 = 0;
      var highRange2 = 0;
      const getRangeQuery = `SELECT * from user_range where question_id = ${parameterID} AND user_id = ${userID}`;
      const ranges = await pool.query(getRangeQuery);
      // console.log(ranges.length);
      if (ranges.length > 0) {
        lowRange1 = ranges[0]["low_range_1"];
        highRange1 = ranges[0]["high_range_1"];
        lowRange2 = ranges[0]["low_range_2"];
        highRange2 = ranges[0]["high_range_2"];
        // console.log(lowRange1, lowRange2, highRange1, highRange2);
      } else {
        lowRange1 = dailyReading[0]["low_range"];
        lowRange2 = dailyReading[0]["low_range"];
        highRange1 = dailyReading[0]["high_range"];
        highRange2 = dailyReading[0]["high_range"];
      }
      var respObj = [];
      var retObj = [];
      // console.log(resp);
      for (var i of resp) {
        // console.log(i);
        respObj.push({
          date: convertDateFormat(i["date"]).replaceAll(" ", "-"),
          value: i["readings"],
          colour: getColor(
            parseFloat(i["readings"]),
            lowRange1,
            lowRange2,
            highRange1,
            highRange2
          ),
        });
      }
      retObj.push({
        parameterID: i["id"],
        userParameterID: parameterID,
        name: "",
        // redUpperLimit: highRange2.toString(),
        // redLowerLimit: lowRange2.toString(),
        // orgUpperLimit: highRange1.toString(),
        // orgLowerLimit: lowRange1.toString(),
        redUpperLimit: "0",
        redLowerLimit: "100",
        orgUpperLimit: "30",
        orgLowerLimit: "70",
        week: respObj.slice(0, 7),
        month: respObj.slice(0, 30),
        sixmonths: respObj.slice(0, 180),
      });

      res.status(200).json({
        result: true,
        message: "Successful",
        data: retObj,
      });
    } else {
      res.status(200).json({
        result: false,
        message: "Not found",
        data: [],
      });
    }
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Error while fetching daily parameters",
      data: null,
      err: err,
    });
  }
};

module.exports = {
  fetchDailyParameters,
  answerDailyParameters,
  fetchDailyParametersById,
};
