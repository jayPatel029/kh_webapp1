const { pool } = require("../../databaseConn/database.js");
const { uploadFile } = require("../../Helpers/auth/uploadDataHelper.js");
const {
  getCurrentFormattedDate,
  formatDate,
  convertDateFormatYYYYmmDD,
} = require("../../Helpers/date_formatter.js");

const getPatientDietDetails = async (req, res) => {
  const { userID } = req.body;

  const query = `SELECT * FROM dietdetails WHERE patient_id = ${userID}`;
  const response = await pool.query(query);
  console.log("fetched data: ", response);

  // if (response.length > 0) {
  //   res.status(200).json({
  //     result: true,
  //     message: "No Data Found",
  //     data: null,
  //   });
  // } else {
  //   res.status(200).json({
  //     result: true,
  //     message: "No Data Found",
  //     data: null,
  //   });
  // }

  if (response.length > 0) {
    const transformedData = response.reduce((acc, item) => {
      const existingEntryIndex = acc.findIndex(
        (entry) => entry.date === item.Date
      );
      if (existingEntryIndex === -1) {
        acc.push({
          dietID: item.id,
          date: item.Date,
          breakfast:
            item.Meal_Type === "breakfast"
              ? item.meal_desc || item.meal_img
              : "",
          lunch:
            item.Meal_Type === "lunch" ? item.meal_desc || item.meal_img : "",
          snacks:
            item.Meal_Type === "snacks" ? item.meal_desc || item.meal_img : "",
          dinner:
            item.Meal_Type === "dinner" ? item.meal_desc || item.meal_img : "",
          others:
            item.Meal_Type === "others" ? item.meal_desc || item.meal_img : "",
        });
      } else {
        const existingEntry = acc[existingEntryIndex];
        const mealType = item.Meal_Type;

        if (mealType === "breakfast") {
          existingEntry.breakfast = item.meal_desc || item.meal_img;
        } else if (mealType === "lunch") {
          existingEntry.lunch = item.meal_desc || item.meal_img;
        } else if (mealType === "snacks") {
          existingEntry.snacks = item.meal_desc || item.meal_img;
        } else if (mealType === "dinner") {
          existingEntry.dinner = item.meal_desc || item.meal_img;
        } else if (mealType === "others") {
          existingEntry.others = item.meal_desc || item.meal_img;
        }
      }

      return acc;
    }, []);

    res.status(200).json({
      result: true,
      message: "Successful",
      data: transformedData,
    });
  } else {
    const responseJSON = {
      result: false,
      message: "Data Not Found",
      data: null,
    };

    res.json(responseJSON);
  }
};

//!change here (added addDietCommetns and fetchCommetns)

const addToReadTable = async (doctorId, commentId) => {
  const query = `INSERT INTO commentsread (commentId,isRead,doctorId) VALUES ('${commentId}',0,'${doctorId}')`;
  try {
    await pool.query(query);
  } catch (error) {
    console.error("Error adding to read table:", error);
  }
};
const addDietComment = async (req, res) => {
  const { dietId, comment, userID, isDoctor } = req.body;

  var formattedDate = getCurrentFormattedDate();
  try {
    const query2 = `INSERT INTO comments (content, userId, typeId, isDoctor, date, type, doctorId) VALUES (? , ? , ? , ? , ? , ?, ?);`;
    const resp2 = await pool.query(query2, [
      comment,
      userID,
      dietId,
      isDoctor,
      formattedDate,
      "Diet",
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
      message: "Diet Comments added Successfully",
    });
  } catch (error) {
    console.error("Error adding diet comments!", error);
    res.status(500).json({
      success: false,
      message: "Error adding diet comments",
    });
  }
};

const fetchDietComments = async (req, res) => {
  const { dietId } = req.body;
  try {
    const query = `SELECT * FROM comments where typeId = ${dietId} and type="Diet"`;
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
    console.error("Error fetching diet comments!", error);
    res.status(500).json({
      success: false,
      message: "Error fetching diet comments",
    });
  }
};

module.exports = {
  getPatientDietDetails,
  fetchDietComments,
  addDietComment,
};
