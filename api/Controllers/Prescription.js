const { pool, sequelize } = require("../databaseConn/database.js");
const AWS = require("aws-sdk");
const { createNewPrescriptionAlert } = require("./Alerts.js");
const s3 = new AWS.S3();
const moment = require("moment-timezone");
const { ReportLog } = require("./log.js");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const { sendPushNotification } = require("./app/notification.js");
const { isConnected } = require("./moduleConnection.js");
const { QueryTypes } = require("sequelize");
async function getSignedURLEndpoint(key, operation) {
  var options = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key /* Filename in the bucket */,
    Expires: 10 /* Seconds */,
  };

  const url = await s3.getSignedUrlPromise(operation, options);
  return url;
}

const deletePrescription = async (req, res) => {
  const id = req.params.id;
  const email = req.body.email;
  const massage = "Prescription Deleted";
  const type = "Prescription";
  const query1 = `select Prescription,patient_id from prescriptions where id = ${id}`;
  const link = await pool.query(query1);
  console.log("link", link[0]);
  const report = link[0].Prescription;
  const patient_id = link[0].patient_id;
  const query = `DELETE FROM prescriptions WHERE id = '${id}'`;
  const result = await pool.query(query);

  await ReportLog(patient_id, report, type, id, massage, email);
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
    const email = req.body.email;
    const prescriptionGivenBy = req.body.prescriptionGivenBy;
    console.log("addPrescriptionById", req.body);
    const query = `INSERT INTO prescriptions (Prescription, Date, Patient_id,prescriptionGivenBy) VALUES (?, ?, ?,?)`;

    const response = await pool.query(query, [
      file,
      date,
      patient_id,
      prescriptionGivenBy,
    ]);
    const query1 = `insert into report_log (patient_id,report,type,report_id,message,deletedBy) values (${patient_id},'${file}','Prescription',${Number(
      response.insertId
    )},'Prescription added ','${email}')`;
    await pool.query(query1);
    console.log(Number(response.insertId), patient_id);

    // remove this alert for doc
    // createNewPrescriptionAlert(Number(response.insertId), patient_id);

    const pushNotiData = {
      title: "New Prescription",
      body: `A new Prescription has been added in by the Doctor`,
      type: "New Prescription",
      customField: "This is a custom notification from Firebase.",
    };

    try {
      await sendPushNotification(pushNotiData, patient_id);
      console.log("Push Notification Sent Successfully");
    } catch (error) {
      console.error("Error Sending Push Notification:", error);
    }

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
    prescriptions.forEach((p) => {
      p.date = moment(p.date).tz("UTC").format("YYYY-MM-DD");
    });

    // ! fetch from tele module
    const connection = await isConnected(patient_id, "patient");

    let externalPrescriptions = [];
    if (connection && connection.is_connected) {
      const new_pid = connection.new_entity_id;

      // Step 3: Fetch selected fields from tele_prescription
      const externalResults = await sequelize.query(
        `
        SELECT 
          p.id,
          p.prescription as Prescription,
          p.created_at AS Date,
          a.patient_id,
          a.doctor_id AS prescriptionGivenBy,
          d.doctor AS prescriptionGivenByName
        FROM tele_prescription p
        LEFT JOIN tele_appointments a ON p.appointment_id = a.id
        LEFT JOIN tele_doctor d ON a.doctor_id = d.id
        WHERE a.patient_id = :new_pid
        ORDER BY p.created_at DESC;
        `,
        {
          replacements: { new_pid },
          type: QueryTypes.SELECT,
        }
      );

      // Format external prescription dates
      externalResults.forEach((p) => {
        p.date = moment(p.date).tz("UTC").format("YYYY-MM-DD");
      });

      externalPrescriptions = externalResults;
    }

    const mergedPrescriptions = [
      ...prescriptions,
      ...externalPrescriptions,
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // console.log("data sent from api", prescriptions);
    res.status(200).json({
      success: true,
      data: mergedPrescriptions,
    });
  } catch (error) {
    console.log("error fetching presc", error);
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
