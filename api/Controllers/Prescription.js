const { pool } = require("../databaseConn/database.js");
const AWS = require('aws-sdk');
const { createNewPrescriptionAlert } = require("./Alerts.js");
const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function getSignedURLEndpoint(key, operation) {
  var options = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key, /* Filename in the bucket */
    Expires: 10 /* Seconds */
  };

  const url = await s3.getSignedUrlPromise(operation, options);
  return url;
}

const deletePrescription = async (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM prescriptions WHERE id = '${id}'`;
  const result = await pool.query(query);
  if (result) {
    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const addPrescriptionById = async (req, res) => {
  try {
    const file = req.body.Prescription;
    const date = req.body.date;
    const patient_id = req.body.patient_id;
    const prescriptionGivenBy = req.body.prescriptionGivenBy;
    const query = `INSERT INTO prescriptions (Prescription, Date, Patient_id,prescriptionGivenBy) VALUES (?, ?, ?,?)`;
    const response = await pool.query(query, [file, date, patient_id, prescriptionGivenBy]);

    console.log(Number(response.insertId),patient_id)

    createNewPrescriptionAlert(Number(response.insertId),patient_id)

    res.status(200).json({
      data: Number(response.insertId),
      success: true,
      message: "Prescription added successfully",
    });
  } catch (error) {
    console.error("Error adding prescription:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getPrescriptionsById = async (req, res) => {

  // const url ="https://kifayti-dev-test.s3.ap-south-1.amazonaws.com/4628_prescription.png"
  // var fileName = url.split(process.env.S3_BASE_URL)[1];
  // console.log("fileName",fileName)
  // const signedUrlObject = await getSignedURLEndpoint(fileName, "getObject");
  // res.send(signedUrlObject)

  // return
  try {
    const patient_id = req.params.id;
    const query = `
      SELECT p.*, d.name AS prescriptionGivenByName
      FROM prescriptions p
      INNER JOIN doctors d ON p.prescriptionGivenBy = d.id
      WHERE p.patient_id = '${patient_id}'
    `;
    const prescriptions = await pool.query(query);
    // for (p of prescriptions) {
    //   p.isPdf=p.Prescription.endsWith(".pdf")?1:0;
    //   var fileName = p.Prescription.split(process.env.S3_BASE_URL)[1];
    //   console.log(fileName)
    //   const signedUrlObject = await getSignedURLEndpoint(fileName, "getObject");
    //   p.Prescription = signedUrlObject;      
    // }
    res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: "Could not get prescriptions..!!",
    });
  }
};


const addComment = async (req, res, next) => {
  try {
    const { comment, prescription_id } = req.body;
    const { id } = req.params;
    const query = `UPDATE prescriptions SET Comments = ? WHERE id = ? AND patient_id = ?`;
    await pool.query(query, [comment, prescription_id, id]);
    res.status(200).json({
      success: true,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  // getPrescription,
  // getPrescriptionByPatient,
  // addPrescription,
  deletePrescription,
  addPrescriptionById,
  getPrescriptionsById,
  addComment,
};
