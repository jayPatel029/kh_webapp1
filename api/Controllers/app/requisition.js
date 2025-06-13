const { pool } = require("../../databaseConn/database.js");
const {
  formatDate,
  getCurrentFormattedDate,
  formatDateNew,
} = require("../../Helpers/date_formatter.js");
const { addToReadTable } = require("./prescription.js");


const getRequisitionInApp = async (req, res, next) => {
  const { id } = req.body;

  console.log("Received request with Patient ID:", id);

  try {
    const query = `SELECT * FROM requisition WHERE Patient_id = ${id} ORDER BY Date DESC`;
    console.log("Executing query:", query);

    const requisition = await pool.query(query);

    console.log("Query result:", requisition);

    if (requisition.length > 0) {
      console.log("Requisitions found:", requisition.length);

      const out = requisition.map((item) => {
        let formattedDate = "Invalid Date";

        const dateStr = item["Date"];
        console.log(
          `Processing requisition ID ${item["id"]}, Date: ${dateStr}`
        );

        if (dateStr) {
          try {
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              const day = String(parsedDate.getDate()).padStart(2, "0");
              const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
              const year = parsedDate.getFullYear();
              formattedDate = `${day}-${month}-${year}`;
              console.log(
                `Formatted date for requisition ID ${item["id"]}: ${formattedDate}`
              );
            } else {
              console.log(
                `Invalid date parsed for requisition ID ${item["id"]}: ${dateStr}`
              );
            }
          } catch (dateError) {
            console.log(
              "Error parsing date for requisition ID:",
              item["id"],
              dateError
            );
          }
        }

        return {
          requisitionID: item["id"],
          image: item["Requisition"],
          date: formattedDate,
        };
      });

      console.log("Final output data:", out);

      res.status(200).json({
        result: true,
        message: "Successful",
        data: out,
      });

      console.log("Response sent successfully.");
    } else {
      console.log("No requisitions found for Patient ID:", id);

      res.status(200).json({
        result: false,
        message: "Data Not Found",
        data: {},
      });
    }
  } catch (err) {
    console.log("Error during database operation:", err);

    res.status(500).json({
      result: false,
      message: "Unsuccessful",
      error: "Error while fetching user requisitions",
    });
  }
};

const fetchRequisitionComments = async (req, res) => {
  const { requisitionID } = req.body;
  try {
    const query = `SELECT * FROM comments where typeId = ${requisitionID} and type="Requisition"`;
    const comments = await pool.query(query);
    var respObj = [];
    

    for(const c of comments) {
      console.log("this comment: ",c);
      let dName = "";
      if(c.isDoctor == 1) {
        const doc = await pool.query(`SELECT name FROM doctors WHERE id = ?`, [c.doctorId]);
        console.log("doc is ", doc);
        dName = doc[0].name;
      }

      respObj.push({
        commentId: c.id,
        commentText: c.content,
        commentsBy: c.isDoctor === "1" ? "Doctor" : "Patient",
        doctorName: dName, // empty string for patient
        dateTime: c.date,
      });
    }

    
    // for (var i of resp) {
    //   respObj.push({
    //     commentId: i["id"],
    //     commentText: i["content"],
    //     commentsBy: i["isDoctor"] == "1" ? "Doctor" : "Patient",
    //     dateTime: i["date"],
    //   });
    // }
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

const addRequisitionComment = async (req, res) => {
  const { requisitionID, comment, userID } = req.body;
  var date = formatDateNew();
  try {
    const query2 = `INSERT INTO comments (content, userId, typeId, isDoctor, date, type, doctorId) VALUES (? , ? , ? , ? , ? , ?, ?);`;
    const resp2 = await pool.query(query2, [
      comment,
      userID,
      requisitionID,
      0,
      date,
      "Requisition",
      0,
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
      message: "Requisition Comments added Successfully",
    });
  } catch (error) {
    console.error("Error adding Requisition comments!", error);
    res.status(500).json({
      success: false,
      message: "Error adding Requisition comments",
    });
  }
};

module.exports = {
  getRequisitionInApp,
  fetchRequisitionComments,
  addRequisitionComment,
};
