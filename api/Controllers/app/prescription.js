const { pool } = require("../../databaseConn/database.js");
const { uploadFile } = require("../../Helpers/auth/uploadDataHelper.js");
const {
  getCurrentFormattedDate,
  formatDate,
  convertDateFormatYYYYmmDD,
} = require("../../Helpers/date_formatter.js");

const addToReadTable = async (doctorId, commentId) => {
  const query = `INSERT INTO commentsread (commentId,isRead,doctorId) VALUES ('${commentId}',0,'${doctorId}')`;
  try {
    await pool.query(query);
  } catch (error) {
    console.error("Error adding to read table:", error);
  }
};

const addPrescriptionFromApp = async (req, res) => {
  const { userid, Authorization, date } = req.headers;
  // console.log(date);
  const image = req.file;
  try {
    // Assuming prescription is a file uploaded
    // const image = req.file.path; // Assuming multer middleware is used for file upload
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
    } else {
      phtotolocation = "";
    }
    // the date should be in form 24-Mar-2024, we are getting in the form 24 Mar 2024, thus modifiying the date
    const date2 = convertDateFormatYYYYmmDD(date);
    // console.log(date2);
    const query = `INSERT INTO prescriptions (Prescription, Date, patient_id) VALUES (?, ?, ?)`;
    await pool.query(query, [phtotolocation, date2, userid]);

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

const fetchPrescriptionComments = async (req, res) => {
  const { priscriptionID } = req.body;
  try {
    const query = `SELECT * FROM comments where typeId = ${priscriptionID} and type="Prescription"`;
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

const addPrescriptionComment = async (req, res) => {
  const { priscriptionID, comment, userID } = req.body;

  var formattedDate = getCurrentFormattedDate();
  try {
    const query2 = `INSERT INTO comments (content, userId, typeId, isDoctor, date, type) VALUES (? , ? , ? , ? , ? , ?);`;
    const resp2 = await pool.query(query2, [
      comment,
      userID,
      priscriptionID,
      0,
      formattedDate,
      "Prescription",
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
      message: "Prescription Comments added Successfully",
    });
  } catch (error) {
    console.error("Error adding prescription comments!", error);
    res.status(500).json({
      success: false,
      message: "Error adding prescription comments",
      error: error.message,
    });
  }
};

const getPrescriptionsByIdFromApp = async (req, res) => {
  try {
    const { patient_id } = req.body;
    const query = `SELECT * FROM prescriptions WHERE patient_id = '${patient_id}'`;
    const prescriptions = await pool.query(query);
    // console.log(prescriptions);
    var out = [];
    for (var i in prescriptions) {
      out.push({
        priscritionID: prescriptions[i]["id"],
        image: prescriptions[i]["Prescription"],
        date: formatDate(prescriptions[i]["Date"]).replaceAll(" ", "-"),
      });
    }
    res.status(200).json({
      result: true,
      message: "Successful",
      data: out,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      data: "could not get prescription..!!",
    });
  }
};

const deletePrescription = async (req, res, next) => {
  const { PrescriptionIdParam } = req.body;
  // console.log(PrescriptionIdParam);
  const query = `DELETE FROM prescriptions where id = ${PrescriptionIdParam};`;

  try {
    await pool.query(query);

    res.status(200).json({
      result: true,
      message: "Successful",
    });
  } catch (err) {
    res.status(500).json({
      result: false,
      message: "Failed to delete prescriptions",
    });
  }
};

module.exports = {
  addPrescriptionFromApp,
  deletePrescription,
  fetchPrescriptionComments,
  getPrescriptionsByIdFromApp,
  addPrescriptionComment,
  addToReadTable,
};
