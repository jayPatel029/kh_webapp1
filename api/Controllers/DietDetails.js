const { pool } = require("../databaseConn/database.js");
const { getCurrentFormattedDate } = require("../Helpers/date_formatter.js");
const { uploadFile } = require("../Helpers/auth/uploadDataHelper.js");

const insertDietDetails = async (req, res) => {
  const { type, desc, img, patientid, isimage,date } = req.headers;
  // console.log(type, desc, img, patientid, isimage);
  console.log(isimage);
  try {
    if (isimage!=="false") {
      console.log("here2");
      const image = req.file;
      let photolocation = "";

      if (image != null) {
        // Extract file extension from originalname
        const fileExtension = image.originalname.split(".").pop();

        // Construct the S3 object key with file extension
        const fileName = `diet${Math.floor(
          Math.random() * 100000
        )}.${fileExtension}`;
        // console.log(image);
        photolocation = await uploadFile(fileName, image.path);
        // console.log(photolocation);
        const query = `INSERT INTO dietdetails (Date, Meal_Type, meal_desc, meal_img, patient_id) VALUES ( ? , ? , ? , ? , ?)`;
        const values = [date, type, desc, photolocation, patientid];
        const response = await pool.query(query, values);
        res.status(200).json({
          userID: patientid,
          dietID: Number(response.insertId),
          result: true,
          message: "Successful",
        });
      } else {
        throw "Image is NULL";
      }
    } else {
      console.log("here");
      const query = `INSERT INTO dietdetails (Date,Meal_Type,meal_desc,meal_img,patient_id) VALUES ( ? , ? , ? , ? , ?)`;
      const values = [date, type, desc, img, patientid];
      const response = await pool.query(query, values);
      res.status(200).json({
        userID: patientid,
        dietID: Number(response.insertId),
        result: true,
        message: "Successful",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating diet details");
  }
};

const insertDietDetailsAdmin = async (req, res) => {
  const { type, desc, img, patientId } = req.body;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const modDate = new Date();
  const formattedDate = `${modDate.getFullYear()}-${
    months[modDate.getMonth()]
  }-${("0" + modDate.getDate()).slice(-2)}`;
  console.log(formattedDate);
  const query = `INSERT INTO dietdetails (Date,Meal_Type,meal_desc,meal_img,patient_id) VALUES ('${formattedDate}','${type}','${desc}','${img}',${patientId})`;
  try {
    const response = await pool.query(query);
    res.status(200).json({
      userID: patientId,
      dietID: Number(response.insertId),
      result: true,
      message: "Successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating diet details");
  }
};
// const editDietDetailsByType = async (req, res) => {
//   const { type, desc, img, patientId } = req.body;
//   const months = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];
//   const modDate = new Date();
//   const formattedDate = `${modDate.getFullYear()}-${
//     months[modDate.getMonth()]
//   }-${("0" + modDate.getDate()).slice(-2)}`;
//   console.log(formattedDate);
//   const query = `UPDATE die)`;
//   try {
//     const response = await pool.query(query);
//     res.status(200).json({
//       userID: patientId,
//       dietID: Number(response.insertId),
//       result: true,
//       message: "Successful",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error creating diet details");
//   }
// };
const getPatientDietDetailsAdmin = async (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM dietdetails WHERE patient_id = ${id}`;
  const result = await pool.query(query);
  res.status(200).json({ data: result });
};



const deleteDietDetails = async (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM dietdetails WHERE id = ${id}`;
  try {
    const response = await pool.query(query);
    res.status(200).json({ data: "Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting diet details");
  }
};

module.exports = {
  insertDietDetails,
  insertDietDetailsAdmin,
  getPatientDietDetailsAdmin,
  deleteDietDetails,
};
