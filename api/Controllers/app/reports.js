const { pool } = require("../../databaseConn/database.js");
const { uploadFile } = require("../../Helpers/auth/uploadDataHelper.js");
const {
  formatDate,
  getCurrentFormattedDate,
} = require("../../Helpers/date_formatter.js");
const { addToReadTable } = require("./prescription.js");

const fetchUserLabReports = async (req, res) => {
  const { userID } = req.body;
  try {
    const query = `SELECT * FROM labreport where patient_id = ${userID}`;
    const resp = await pool.query(query);
    if (resp.length > 0) {
      var respOut = [];
      for (var report of resp) {
        respOut.push({
          labReportID: report["id"],
          labReportType: report["Report_Type"],
          image: report["Lab_Report"],
          date: formatDate(report["Date"]).replaceAll(" ", "-"),
        });
      }
      res.status(200).json({
        result: true,
        message: "Successful",
        data: respOut,
      });
    } else {
      res.status(200).json({
        result: false,
        message: "Data Not Found",
        data: null,
      });
    }
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Error while fetching user lab reports",
    });
  }
};

const addLabReportFromApp = async (req, res) => {
  const { userid, Authorization, date, reporttype } = req.headers;
  const image = req.file;
  try {
    // Assuming report is a file uploaded
    let phtotolocation = "";

    if (image != null) {
      // Extract file extension from originalname
      const fileExtension = image.originalname.split(".").pop();

      // Construct the S3 object key with file extension
      const fileName = `profilephoto${Math.floor(
        Math.random() * 100000
      )}.${fileExtension}`;
      // console.log(image);
      phtotolocation = await uploadFile(fileName, image.path);
      // console.log(phtotolocation);
    } else {
      phtotolocation = "";
    }
    // the date should be in form 24-Mar-2024, we are getting in the form 24 Mar 2024, thus modifiying the date
    const date2 = date.replaceAll(" ", "-");
    const query = `INSERT INTO labreport (Report_Type, Lab_Report, Date, patient_id) VALUES (?, ?, ?, ?)`;
    await pool.query(query, [reporttype, phtotolocation, date2, userid]);

    res.status(200).json({
      success: true,
      message: "Successful",
      photoLocation: phtotolocation,
    });
  } catch (error) {
    console.error("Error adding prescription:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const fetchReportComments = async (req, res) => {
  const { labReportID } = req.body;
  try {
    const query = `SELECT * FROM comments where typeId = ${labReportID} and type="Lab Report"`;
    const resp = await pool.query(query);
    var respObj = [];
    for (var i of resp) {
      respObj.push({
        commentId: i["id"],
        commentText: i["content"],
        commentsBy: i["isDoctor"] == "1" ? "Doctor" : "Patient",
        dateTime: i["date"],
      });
    }
    res.status(200).json({
      dietId: 0,
      image: "",
      result: true,
      data: respObj,
      message: "Succesful",
    });
  } catch (error) {
    console.error("Error fetching prescription comments!", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prescription comments",
    });
  }
};

const addReportComments = async (req, res) => {
  const { labReportID, comment, userID } = req.body;
  var formattedDate = getCurrentFormattedDate();
  try {
    const query2 = `INSERT INTO comments (content, userId, typeId, isDoctor, date, type) VALUES (? , ? , ? , ? , ? , ?);`;
    const resp2 = await pool.query(query2, [
      comment,
      userID,
      labReportID,
      0,
      formattedDate,
      "Lab Report",
    ]);

    cid = Number(resp2.insertId);

    const query1 = `SELECT * FROM doctor_patients WHERE patient_id=${userID}`;
    try {
      const doctors = await pool.query(query1);
      for (let i = 0; i < doctors.length; i++) {
        const doctor = doctors[i];
        await addToReadTable(doctor.doctor_id, cid);
      }
    } catch (error) {
      // console.error("Error adding to read table:", error);
      throw "Error adding to read table:";
      // res.status(400).json({
      //   success: false,
      //   message: "Something went wrong",
      // });
    }

    res.status(200).json({
      success: true,
      // data: resp.toString(),
      message: "Lab report Comments added Successfully",
    });
  } catch (error) {
    console.error("Error adding lab report comments!", error);
    res.status(500).json({
      success: false,
      message: "Error adding lab report comments",
    });
  }
};

const deleteLabReport = async (req, res, next) => {
  const { LabReportIdparam } = req.body;

  const query = `DELETE FROM labreport where id = ${LabReportIdparam};`;

  try {
    await pool.query(query);

    res.status(200).json({
      result: true,
      message: "Successful",
    });
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Failed to delete lab report",
    });
  }
};

module.exports = {
  fetchUserLabReports,
  addLabReportFromApp,
  fetchReportComments,
  addReportComments,
  deleteLabReport
};
