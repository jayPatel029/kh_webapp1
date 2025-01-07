const { pool } = require("../databaseConn/database.js");
const AWS = require("aws-sdk");
const { createNewPrescriptionAlert } = require("./Alerts.js");
const s3 = new AWS.S3();
const moment = require("moment-timezone");
const { ReportLog } = require("./log.js");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const {sendPushNotification} = require("./app/notification.js");
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
  const email = req.body.email
  const massage="Prescription Deleted"
  const type="Prescription"
  const query1 =`select Prescription,patient_id from prescriptions where id = ${id}`
  const link= await pool.query(query1)
   console.log("link",link[0])
  const report = link[0].Prescription
  const patient_id = link[0].patient_id
  const query = `DELETE FROM prescriptions WHERE id = '${id}'`;
  const result = await pool.query(query);
  
  await ReportLog(patient_id,report,type,id,massage,email)
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
    const email=req.body.email
    const prescriptionGivenBy = req.body.prescriptionGivenBy;
    console.log("addPrescriptionById", req.body);
    const query = `INSERT INTO prescriptions (Prescription, Date, Patient_id,prescriptionGivenBy) VALUES (?, ?, ?,?)`;
    
    const response = await pool.query(query, [
      file,
      date,
      patient_id,
      prescriptionGivenBy,
    ]);
    const query1=`insert into report_log (patient_id,report,type,report_id,message,deletedBy) values (${patient_id},'${file}','Prescription',${Number(response.insertId)},'Prescription added ','${email}')`
    await pool.query(query1)
    console.log(Number(response.insertId), patient_id);

    createNewPrescriptionAlert(Number(response.insertId), patient_id);
    
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

    prescriptions.forEach((p) => {
      p.date = moment(p.date).tz("UTC").format("YYYY-MM-DD");
    });

    // console.log("data sent from api", prescriptions);
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
