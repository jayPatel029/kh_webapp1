const { pool } = require("../../databaseConn/database.js");
const { uploadFile } = require("../../Helpers/auth/uploadDataHelper.js");
const {
  getColor,
  convertDateFormat,
} = require("../../Helpers/date_formatter.js");
const translations = require("./translation.json");

const fetchDialysisParameters = async (req, res) => {
  const { userID, date, language } = req.body;
  try {
    const query = `SELECT doctor_id, patient_id FROM doctor_patients WHERE patient_id = ${userID};`; //! added patient_id in qry
    const resp = await pool.query(query);
    var respOut = [];
    if (resp.length > 0) {
      for (var doctor of resp) {
        const query2 = `SELECT dialysisreadingid FROM doctor_dialysis_readings WHERE doctorid = ${doctor["doctor_id"]};`;
        var resp2 = await pool.query(query2);
        if (resp2.length > 0) {
          for (var dialysisReadingID of resp2) {
            const query3 = `SELECT * FROM dialysis_readings WHERE id = ${dialysisReadingID["dialysisreadingid"]}`;
            var resp3 = await pool.query(query3);
            if (resp3.length > 0) {
              for (var dialysisReadings of resp3) {
                const answerQuery = `SELECT readings FROM graph_readings_dialysis WHERE question_id = ${dialysisReadingID["dialysisreadingid"]} AND user_id = ${userID} AND date = '${date}';`;
                var answerResp = await pool.query(answerQuery);
                let answer = "";
                if (answerResp.length > 0) {
                  answer = answerResp[0].readings;
                }

                const parameterName = dialysisReadings.title;
                const parameterTranslation = translations[parameterName];
                const parameterNameTranslation = parameterTranslation
                  ? parameterTranslation[language]
                  : parameterName;

                // console.log(parameterTranslation);
                const unitOfMeasure = dialysisReadings.unit;
                const unitOfMeasureTranslation = dialysisReadings.unit;

                respOut.push({
                  dialysisUserParameterID: parseInt(doctor["patient_id"]), //! changed "medical_team" to "patient_id"
                  dialysisParameterID: dialysisReadingID["dialysisreadingid"],
                  dialysisParameterName: parameterName,
                  dialysisParameterNameTranslation: parameterNameTranslation ?? parameterName,
                  parameterType: dialysisReadings["type"],
                  unitOfMeasure: unitOfMeasure,
                  unitOfMeasureTranslation: unitOfMeasureTranslation,
                  daysOfWeek: "1,2,3,4,5,6,7",
                  daysOfMonth: "",
                  answer: answer.toString(),
                  date: date,
                });
              }
            }
          }
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
        message: "No doctor found",
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

const answerDialysisParameters = async (req, res) => {
  const {
    dialysisparameterid,
    userid,
    dialysisuserparameterid,
    date,
    isimage,
    answer,
  } = req.headers;
  // console.log(parameterid, userid, userparameterid, date, isimage, answer);
  try {
    if (isimage !== "false") {
      let phtotolocation = "";
      const image = req.file;
      try {
        if (image != null) {
          const fileExtension = image.originalname.split(".").pop();
          const fileName = `dialysisParams${Math.floor(
            Math.random() * 100000
          )}.${fileExtension}`;
          // console.log(image);
          phtotolocation = await uploadFile(fileName, image.path);
          const query = `INSERT INTO graph_readings_dialysis (question_id, user_id, date, readings) VALUES (?, ?, ?, ?)`;
          const resp = await pool.query(query, [
            dialysisparameterid,
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
        console.error("Error uploading dialysis parameter", err);
        throw err;
      }
    } else {
      const query = `INSERT INTO graph_readings_dialysis (question_id, user_id, date, readings) VALUES (?, ?, ?, ?)`;
      const resp = await pool.query(query, [
        dialysisparameterid,
        userid,
        date,
        answer,
      ]);
      res.status(200).json({
        result: true,
        message: "Successful",
      });
    }
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Error adding dialysis parameters",
      list: null,
    });
  }
};

const fetchDialysisParametersById = async (req, res) => {
  const { parameterID, userID } = req.body;
  try {
    const query = `SELECT * FROM graph_readings_dialysis where user_id = ${userID} AND question_id = ${parameterID}`;
    const resp = await pool.query(query);
    // console.log(resp);
    if (resp.length > 0) {
      const getNameQuery = `SELECT * from dialysis_readings where id = ${parameterID}`;
      const dialysisReading = await pool.query(getNameQuery);
      // console.log(dailyReading);

      if (dialysisReading.length == 0) throw "Error fetching dialysis readings";

      var lowRange1 = 0;
      var lowRange2 = 0;
      var highRange1 = 0;
      var highRange2 = 0;
      const getRangeQuery = `SELECT * from user_range_dialysis where question_id = ${parameterID} AND user_id = ${userID}`;
      const ranges = await pool.query(getRangeQuery);
      // console.log(ranges.length);
      if (ranges.length > 0) {
        lowRange1 = ranges[0]["low_range_1"];
        highRange1 = ranges[0]["high_range_1"];
        lowRange2 = ranges[0]["low_range_2"];
        highRange2 = ranges[0]["high_range_2"];
        // console.log(lowRange1, lowRange2, highRange1, highRange2);
      } else {
        // console.log(dailyReading["low_range"]);
        lowRange1 = dialysisReading[0]["low_range"];
        lowRange2 = dialysisReading[0]["low_range"];
        highRange1 = dialysisReading[0]["high_range"];
        highRange2 = dialysisReading[0]["high_range"];
        // console.log(lowRange1, lowRange2, highRange1, highRange2);
      }
      // console.log(lowRange1, lowRange2, highRange1, highRange2);
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
        week: respObj,
        month: respObj,
        sixmonths: respObj,
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
      message: "Error while fetching dialysis parameters",
      data: null,
      err: err,
    });
  }
};

module.exports = {
  fetchDialysisParameters,
  answerDialysisParameters,
  fetchDialysisParametersById,
};
