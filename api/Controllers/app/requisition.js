const { pool } = require("../../databaseConn/database.js");
const {
  formatDate,
  getCurrentFormattedDate,
} = require("../../Helpers/date_formatter.js");
const { addToReadTable } = require("./prescription.js");

// const getRequisitionInApp = async (req, res, next) => {
//   const { id } = req.body;
//   try {
//     const query = `SELECT * FROM requisition WHERE Patient_id = ${id}`;
//     const requisition = await pool.query(query);
//     if (requisition.length > 0) {
//       var out = [];

//       for (var i in requisition) {
//         out.push({
//           requisitionID: requisition[i]["id"],
//           image: requisition[i]["Requisition"],
//           date: formatDate(requisition[i]["Date"]).replaceAll(" ", "-"),
//         });
//       }
//       res.status(200).json({
//         result: true,
//         message: "Successful",
//         data: out,
//       });
      
//       console.log("response", res);
      
//     } else {
//       res.status(200).json({
//         result: false,
//         message: "Data Not Found",
//         data: null,
//       });
//     }
//   } catch (err) {
//     console.log("error: ", err);
//     res.status(500).json({
//       result: false,
//       message: "Unsuccessful",
//       error: "error while fetching user requisitions",
//     });
//   }
// };




const getRequisitionInApp = async (req, res, next) => {
  const { id } = req.body;
  try {
    const query = `SELECT * FROM requisition WHERE Patient_id = ${id}`;
    const requisition = await pool.query(query);

    if (requisition.length > 0) {
      var out = [];

      for (var i in requisition) {
        let formattedDate = "Invalid Date";
        const dateStr = requisition[i]["Date"];
        
        if (dateStr) {
          try {
            // Manually parse the date in YYYY-DD-MM format to YYYY-MM-DD
            const [year, day, month] = dateStr.split("-");
            const parsedDate = new Date(`${year}-${month}-${day}`);
            formattedDate = formatDate(parsedDate).replaceAll(" ", "-");
          } catch (dateError) {
            console.log("Invalid Date format for requisition ID:", requisition[i]["id"], dateError);
          }
        }

        out.push({
          requisitionID: requisition[i]["id"],
          image: requisition[i]["Requisition"],
          date: formattedDate,
        });
      }

      res.status(200).json({
        result: true,
        message: "Successful",
        data: out,
      });

      console.log("response", res);

    } else {
      res.status(200).json({
        result: false,
        message: "Data Not Found",
        data: null,
      });
    }
  } catch (err) {
    console.log("error: ", err);
    res.status(500).json({
      result: false,
      message: "Unsuccessful",
      error: "error while fetching user requisitions",
    });
  }
};




const fetchRequisitionComments = async (req, res) => {
  const { requisitionID } = req.body;
  try {
    const query = `SELECT * FROM comments where typeId = ${requisitionID} and type="Requisition"`;
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

const addRequisitionComment = async (req, res) => {
  const { requisitionID, comment, userID } = req.body;
  var formattedDate = getCurrentFormattedDate();
  try {
    const query2 = `INSERT INTO comments (content, userId, typeId, isDoctor, date, type) VALUES (? , ? , ? , ? , ? , ?);`;
    const resp2 = await pool.query(query2, [
      comment,
      userID,
      requisitionID,
      0,
      formattedDate,
      "Requisition",
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
