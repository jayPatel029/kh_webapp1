const { pool } = require("../databaseConn/database.js");
const { PdfTextFunction } = require("./PatientData.js");
const LabReadings = require("../Models/labreadings.js");
const { where } = require("sequelize");
const moment = require("moment-timezone");
const { ReportLog } = require("./log.js");

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
const saveConfirmedData = async (req, res) => {
  const { patient_id, date, Report_Type, email,Lab_Report, confirmedValues } = req.body;

  try {
    // Insert the lab report details
    const reportQuery = `
      INSERT INTO labreport (Date, patient_id,Lab_Report, Report_Type)
      VALUES ('${date}', '${patient_id}','${Lab_Report}', '${Report_Type}')
    `;
    const reportResult = await pool.query(reportQuery);

    const reportId =Number(reportResult.insertId);

    // Insert each confirmed medical parameter into the database
    const success = await insertMedicalDataDB(confirmedValues, patient_id, date);

    // Log the operation
    // const logQuery = `
    //   INSERT INTO report_log (patient_id, type, report_id, message, deletedBy)
    //   VALUES ('${patient_id}', '${Report_Type}', '${reportId}', 'Lab Report confirmed and saved', '${email}')
    // `;
    // await pool.query(logQuery);

    res.status(200).json({
      success: true,
      message: "Lab Report confirmed and saved successfully",
      reportId: reportId,
    });
  } catch (error) {
    console.error("Error saving confirmed data:", error);
    res.status(400).json({
      success: false,
      message: "Error saving confirmed data",
    });
  }
};


const addLabReport = async (req, res) => {
  const { Lab_Report } = req.body;

  try {
    // Extract data from the PDF
    const medicalData = await PdfTextFunction(Lab_Report);

    res.status(200).json({
      success: true,
      message: "Extracted data from Lab Report successfully",
      extractedValues: medicalData, // Send extracted values to the frontend
    });
  } catch (error) {
    console.error("Error processing lab report:", error);
    res.status(400).json({
      success: false,
      message: "Error extracting data from Lab Report",
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
  const email = req.body.email
  const massage="Lab Report deleted "
  const type="Lab Report"
  const query1 =`select Lab_Report,patient_id from labreport where id = ${id}`
  const link= await pool.query(query1)
  const report = link[0].Lab_Report
  const patient_id = link[0].patient_id

  const query = `DELETE FROM labreport WHERE id = '${id}'`;
  await ReportLog(patient_id,report,type,id,massage,email)
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
    console.log("questionTitle",questionTitle)
    const question = await LabReadings.LabReadings.findOne({
      where: {
        title: questionTitle
      }
    });
    if (question) {
      return question.id;
    } else {
      const id = await LabReadings.LabReadings.create({
        title: questionTitle,
        isGraph: true,
      });
      return Number(id.id);
    }
  } catch (error) {
    throw new Error(`Error fetching questionId for title '${questionTitle}': ${error.message}`);
  }
}

const insertMedicalDataDB = async (extractedData,user_id,date)=>{
  try {
    for (let key in extractedData) {
      if(key === "Date") continue;
      const questionId = await getQuestionId(key);
      console.log("questionId",questionId)
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

const getColoumnName = async (req,res) => {
const query =`select title from labReadings`
const result = await pool.execute(query)
console.log("res",result)
return res.status(200).json({
  success: true,
  data: result,
});
}

const uploadBulkLabReportIndividual = async (req, res) => {
  console.log("req", req.body);
  const { data, patient_id, Report_Type, Lab_Report } = req.body;

  try {
    const results = [];

    for (const record of data) {
      let { Date } = record;

      // Validate and format the Date
      if (!Date || !Date.includes("-")) {
        console.warn(`Invalid or missing Date field in record: ${JSON.stringify(record)}`);
        continue; // Skip the record
      }

      // Convert Date to YYYY-MM-DD format
      try {
        const [day, month, year] = Date.split("-");
        Date = `${year}-${month}-${day}`;
      } catch (error) {
        console.warn(`Error parsing Date for record: ${JSON.stringify(record)}. Skipping.`);
        continue; // Skip the record if the date parsing fails
      }

      // Insert lab report data
      const query = `INSERT INTO labreport (Date, patient_id, Report_Type, Lab_Report) 
                     VALUES ('${Date}', '${patient_id}', '${Report_Type}', '${Lab_Report}')`;

      const result = await pool.query(query);
      results.push(Number(result.insertId));

      // If the report type is "Lab", insert medical data
      if (Report_Type === "Lab") {
        await insertMedicalDataDB(record, patient_id, Date);
      }
    }

    res.status(200).json({
      success: true,
      message: "Lab Reports added successfully",
      data: results, // Return all inserted IDs
    });
  } catch (error) {
    console.error("Error adding lab reports:", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  getLabReports,
  getLabReportByPatient,
  addLabReport,
  deleteLabReport,
  saveConfirmedData,
  getLabReportById,
  uploadBulkLabReportIndividual,
  fetchLabReadings,
  fetchLabReadingsResponse,
  addLabReadings,
  getRange,
  getColoumnName,
};
