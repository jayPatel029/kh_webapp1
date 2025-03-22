const { pool } = require("../../databaseConn/database.js");
const { uploadFile } = require("../../Helpers/auth/uploadDataHelper.js");
const {
  getCurrentFormattedDate,
  formatDate,
  convertDateFormatYYYYmmDD,
  formatDateNew,
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
  const image = req.file;
  try {
    let phtotolocation = "";

    if (image != null) {
      const fileExtension = image.originalname.split(".").pop();

      const fileName = `profilephoto${Math.floor(
        Math.random() * 100000
      )}.${fileExtension}`;
      phtotolocation = await uploadFile(fileName, image.path);
    } else {
      phtotolocation = "";
    }
    const date2 = convertDateFormatYYYYmmDD(date);
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
    console.log("response pres comments: ", respObj);
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

// const addPrescriptionComment = async (req, res) => {
//   const { priscriptionID, comment, userID } = req.body;

//   var formattedDate = getCurrentFormattedDate();
//   try {
//     const query2 = `INSERT INTO comments (content, userId, typeId, isDoctor, date, type) VALUES (? , ? , ? , ? , ? , ?);`;
//     const resp2 = await pool.query(query2, [
//       comment,
//       userID,
//       priscriptionID,
//       0,
//       formattedDate,
//       "Prescription",
//     ]);

//     cid = Number(resp2.insertId);

//     const query1 = `SELECT * FROM doctor_patients WHERE patient_id=${userID}`;
//     try {
//       const doctors = await pool.query(query1);
//       for (let i = 0; i < doctors.length; i++) {
//         const doctor = doctors[i];
//         await addToReadTable(doctor.doctor_id, cid);
//       }
//     } catch (error) {
//       // console.error("Error adding to read table:", error);
//       throw "Error adding to read table:";
//       // res.status(400).json({
//       //   success: false,
//       //   message: "Something went wrong",
//       // });
//     }

//     res.status(200).json({
//       success: true,
//       // data: resp.toString(),
//       message: "Prescription Comments added Successfully",
//     });
//   } catch (error) {
//     console.error("Error adding prescription comments!", error);
//     res.status(500).json({
//       success: false,
//       message: "Error adding prescription comments",
//     });
//   }
// };

const addPrescriptionComment = async (req, res) => {
  const { priscriptionID, comment, userID } = req.body;

  if (!priscriptionID || !comment || !userID) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  var date = formatDateNew();

  try {
    const query2 = `INSERT INTO comments (content, userId, typeId, isDoctor, date, type, doctorId) VALUES (? , ? , ? , ? , ? , ?, ?);`;
    const resp2 = await pool.query(query2, [
      comment,
      userID,
      priscriptionID,
      0,
      date,
      "Prescription",
      0,
    ]);
    console.log("Comment added successfully:", resp2);

    const cid = Number(resp2.insertId);
    const query1 = `SELECT * FROM doctor_patients WHERE patient_id=${userID}`;
    const doctors = await pool.query(query1);

    if (doctors.length === 0) {
      console.log("No doctors found for userID:", userID);
    }

    for (const doctor of doctors) {
      console.log("Adding to read table for doctor:", doctor.doctor_id);
      await addToReadTable(doctor.doctor_id, cid);
    }

    res.status(200).json({
      success: true,
      message: "Prescription Comments added Successfully",
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({
      success: false,
      message: "Error adding prescription comments",
      error: error.message,
    });
  }
};

// const getPrescriptionsByIdFromApp = async (req, res) => {
//   try {
//     const { patient_id } = req.body;
//     const query = `SELECT * FROM prescriptions WHERE patient_id = '${patient_id}'`;
//     const prescriptions = await pool.query(query);
//     // console.log(prescriptions);
//     var out = [];
//     for (var i in prescriptions) {
//       out.push({
//         priscritionID: prescriptions[i]["id"],
//         image: prescriptions[i]["Prescription"],
//         date: formatDate(prescriptions[i]["Date"]).replaceAll(" ", "-"),
//       });
//     }
//     res.status(200).json({
//       result: true,
//       message: "Successful",
//       data: out,
//     });
//   } catch (error) {
//     res.status(500).json({
//       result: false,
//       data: "could not get prescription..!!",
//     });
//   }
// };


const getPrescriptionsByIdFromApp = async (req, res) => {
  try {
    const { patient_id } = req.body;

    // Fetch prescriptions along with the doctor's name if available
    const query = `
      SELECT p.id, p.Prescription, p.Date, p.prescriptionGivenBy, 
             d.name AS doctorName
      FROM prescriptions p
      LEFT JOIN doctors d ON p.prescriptionGivenBy = d.id
      WHERE p.patient_id = '${patient_id}'
      ORDER BY p.Date DESC
    `;

    const prescriptions = await pool.query(query);

    let out = prescriptions.map((prescription) => ({
      prescriptionID: prescription.id,
      image: prescription.Prescription,
      date: formatDate(prescription.Date).replaceAll(" ", "-"),
      givenBy: prescription.prescriptionGivenBy 
        ? prescription.doctorName || "Unknown Doctor" // If doctor found, use name; else "Unknown Doctor"
        : "USER", // If NULL, it means given by the USER
    }));

    res.status(200).json({
      result: true,
      message: "Successful",
      data: out,
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({
      result: false,
      data: `Could not get prescription..!! ${error}`,
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
