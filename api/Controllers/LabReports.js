const { pool } = require("../databaseConn/database.js");
const { PdfTextFunction } = require("./PatientData.js");
const LabReadings = require("../Models/labreadings.js");
const { where } = require("sequelize");
const moment = require("moment-timezone");

const getLabReports = async (req, res, next) => {
  const id = req.params.id;
  const query = `SELECT * FROM labreport WHERE patient_id=${id}`;
  const labreports = await pool.query(query);
  console.log(labreports)
  
  res.status(200).json({
    success: true,
    data: labreports,
  });
};

const getLabReportById = async (req, res, next) => {
  const id = req.params.id;
  const query = `SELECT * FROM labreport WHERE id=${id}`;
  const labreports = await pool.query(query);
  res.status(200).json({
    success: true,
    data: labreports,
  });
};

const getLabReportByPatient = async (req, res, next) => {
  const patient = req.params.patient;
  const query = `SELECT * FROM labreport WHERE Patient_Name = '${patient}'`;
  const labreports = await pool.query(query);
  res.status(200).json({
    success: true,
    data: labreports,
  });
};

const addLabReport = async (req, res, next) => {
  const { Lab_Report, patient_id, date, Report_Type } = req.body;
  console.log("lab",Lab_Report)
      // const date_2 = new Date().toISOString().slice(0, 19).replace("T", " ");
  const query = `INSERT INTO labreport (Lab_Report,Date,patient_id, Report_Type) VALUES ('${Lab_Report}','${date}','${patient_id}', '${Report_Type}')`;
  try {
    const result = await pool.query(query);
    var medicalData;
    if(Report_Type === "Lab") {
      medicalData= await PdfTextFunction(Lab_Report);
      console.log("Data",medicalData)
      const success= await insertMedicalDataDB(medicalData,patient_id,date)
    }

    res.status(200).json({
      success: true,
      message: "Lab Report added successfully",
      data: Number(result.insertId),
    });
  } catch (error) {
    console.error("Error adding lab report:", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
    
  }
};

async function insertIntoGraphReadingsLab(userId, date, questionTitle, extractedData) {
  try {
    // Fetch questionId based on questionTitle
    const questionId = await getQuestionId(questionTitle);

    // Prepare readings object for graphReadingsLab table
    const readingsObject = JSON.stringify({
      userId: userId,
      date: date,
      readings: extractedData
    });

    // Insert into graphReadingsLab table
    const result = await GraphReadingsLab.create({
      questionId: questionId,
      userId: userId,
      date: date,
      readings: readingsObject
    });

    console.log(`Data inserted into graphReadingsLab with id: ${result.id}`);
    return result;
  } catch (error) {
    throw new Error(`Error inserting data into graphReadingsLab table: ${error.message}`);
  }
}

const deleteLabReport = async (req, res, next) => {
  const id = req.params.id;
  const query = `DELETE FROM labreport WHERE id = '${id}'`;
  const result = await pool.query(query);
  if (result) {
    res.status(200).json({
      success: true,
      message: "Lab Report deleted successfully",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const fetchLabReadings = async (req, res) => {
  try {
    // Fetch all lab readings from the LabReadings table
    var User = LabReadings.LabReadings; 
    const labReadings = await User.findAll({});

    // Send the fetched data as a JSON response
    res.status(200).json({
      success: true,
      data: labReadings,
    });
  } catch (error) {
    console.error("Error fetching lab readings:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching lab readings.",
      error: error.message,
    });
  }
};

const fetchLabReadingsResponse = async (req, res) => {
  const { question_id, user_id } = req.query;
  try {
    // Query to find lab readings based on question_id and user_id
    const labReadings = await LabReadings.GraphReadingsLab.findAll({
      where: {
        questionId: question_id,
        userId: user_id
      }
    });

    // Check if labReadings is empty
    if (!labReadings || labReadings.length === 0) {
      return res.status(404).json({ error: "Lab readings not found" });
    }

    // If lab readings are found, return them
    res.status(200).json({
      success: true,
      data: labReadings,
    }
    );

  } catch (error) {
    // Handle any errors that occur during the query
    console.error("Error fetching lab readings:", error);
    res.status(500).json({ error: "Failed to fetch lab readings" });
  }
};

const addLabReadings = async (req, res) => {
  try {
    const {
      question_id,
      user_id,
      date,
      readings,
    } = req.body;

    // Create a new record in the database using Sequelize
    const newLabReading = await LabReadings.GraphReadingsLab.create({
      questionId: question_id,
      userId: user_id,
      date: date,
      readings: readings,
    });

    // Send a success response if the record was successfully created
    res.status(201).json({ message: "Lab readings added successfully", data: newLabReading });

  } catch (error) {
    // Handle any errors that occur during the database operation
    console.error("Error adding lab readings:", error);
    res.status(500).json({ error: "Failed to add lab readings" });
  }
};

const getRange = async (req, res) => {
  try {
    const { question_id } = req.query;

    if (!question_id) {
      return res.status(400).json({ error: 'Missing question_id parameter' });
    }

    // Find one lab reading where id matches the question_id
    var User = LabReadings.LabReadings; 
    const labReading = await User.findOne({
      where: {
        id: question_id
      }
    });

    if (!labReading) {
      return res.status(404).json({ error: 'Lab reading not found for the specified question_id' });
    }

    // Return only the relevant data
    const labReadingData = {
      id: labReading.id,
      title: labReading.title,
      isGraph: labReading.isGraph,
      unit: labReading.unit,
      low_range: labReading.low_range,
      high_range: labReading.high_range
    };

    res.status(200).json({
      success: true,
      data: labReadingData,
    });
  } catch (error) {
    console.error('Error fetching lab reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


async function getQuestionId(questionTitle) {
  try {
    const question = await LabReadings.LabReadings.findOne({
      where: {
        title: questionTitle
      }
    });
    if (question) {
      return question.id;
    } else {
      throw new Error(`Question with title '${questionTitle}' not found.`);
    }
  } catch (error) {
    throw new Error(`Error fetching questionId for title '${questionTitle}': ${error.message}`);
  }
}

const insertMedicalDataDB = async (extractedData,user_id,date)=>{
  try {
    for (let key in extractedData) {
      const questionId = await getQuestionId(key);

      const newLabReading = await LabReadings.GraphReadingsLab.create({
        questionId: questionId,
        userId: user_id,
        date: date,
        readings: extractedData[key],
      });
      
  }

  return true;
    
  } catch (error) {
    console.log(error.message)
    return false;
  }

}




const uploadBulkLabReportIndividual = async(req,res)=>{
  console.log(req.body)
    
  res.status(200).json("okk")
}

module.exports = {
  getLabReports,
  getLabReportByPatient,
  addLabReport,
  deleteLabReport,
  getLabReportById,
  uploadBulkLabReportIndividual,
  fetchLabReadings,
  fetchLabReadingsResponse,
  addLabReadings,
  getRange,
};
