const xlsx = require("xlsx");
const { pool } = require("../databaseConn/database");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const pdfParse = require('pdf-parse');
const LabReadingsModal = require("../Models/labreadings")
const fs = require('fs');

const PdfText = async (req, res) => {

  const pdfUrl = req.body.pdfUrl;

  if (!pdfUrl) {
    return res.status(400).json({ error: 'PDF URL is required' });
  }

  try {
    // Fetch the PDF from the provided URL
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfBuffer = response.data;

    // Parse the PDF and extract text
    const data = await pdfParse(pdfBuffer);
    const extractedText = data.text;
    const textArray = extractedText.split('\n').filter(line => line.trim() !== '');

    // const text = extractCBCData(extractedText);
    const extractedData = extractMedicalParameters(extractedText);

    res.json({ text: extractedData });
  } catch (error) {
    console.error('Error fetching or parsing PDF:', error);
    res.status(500).json({ error: 'Failed to fetch or parse PDF' });
  }
};

const addLabTestCSV = async (req, res) => {

  try {
    const query = `
    SELECT 
      TABLE_NAME, 
      COLUMN_NAME, 
      DATA_TYPE, 
      COLUMN_TYPE, 
      COLUMN_KEY 
    FROM information_schema.columns 
    WHERE table_schema = 'kifayti';
  `;
    const response = await pool.query(query);
    console.log(response[0]);

    const responseText = JSON.stringify(response, null, 2);

    fs.writeFileSync("filePath.txt", responseText, 'utf-8');

    return res.status(200).json("response");
    
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
    
  }
  // try {
  //   const { data } = req.body;

  //   const data2 = data.slice(1, data.length);
    
  //   for (let k in data2) {

  //     let key = data[k][0];
  //     let value = data[k][1];
  //     const questionId = await getQuestionId(key);

  //     const newLabReading = await LabReadingsModal.LabReadings.GraphReadingsLab.create({
  //       questionId: questionId,
  //       userId: user_id,
  //       date: date,
  //       readings: value,
  //     });
  //   }
  //   res.status(200).json({
  //     success: true,
  //     data: "Data Inserted Successfully",
  //   })

  // } catch (error) {
  //   console.log(error);
  //   res.status(500).json({
  //     success: false,
  //     data: "Error while Inserting Data",
  //   });
  // }

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

const insertMedicalDataDB = async (extractedData, user_id, date) => {
  try {
    for (let key in extractedData) {
      console.log(key, extractedData[key]);
      // const questionId = await getQuestionId(key);

      // const newLabReading = await LabReadings.GraphReadingsLab.create({
      //   questionId: questionId,
      //   userId: user_id,
      //   date: date,
      //   readings: extractedData[key],
      // });

    }

    return true;

  } catch (error) {
    console.log(error.message)
    return false;
  }

}



const getPatientDataSheet = async (patientId) => {
  const query = `SELECT * FROM patients where id = ${patientId}`;
  const patient_data = await pool.query(query);
  const ailmentsQuery = `
    SELECT ailments.name
    FROM patients
    JOIN ailment_patient ON patients.id = ailment_patient.patient_id
    JOIN ailments ON ailment_patient.ailment_id = ailments.id
    WHERE patients.id =${patientId};
  `;
  const ailmentsList = await pool.query(ailmentsQuery);
  const ailments = ailmentsList.map((item) => item.name);
  console.log(patient_data);
  console.log(ailments);

  const ws = xlsx.utils.aoa_to_sheet([["Patient Details"]]);
  delete patient_data[0].id;
  xlsx.utils.sheet_add_json(ws, patient_data, { skipHeader: false, origin: 2 });
  xlsx.utils.sheet_add_aoa(ws, [[ailments.join(",")]], {
    skipHeader: true,
    origin: "4C",
  });

  const ailmentJoin = `SELECT
  dialysis_readings.id as did,
  ailments.id as ailmentID,
  dialysis_readings.title as d_title,
  ailments.name as ailment_name
FROM
  dialysis_readings
JOIN
  dialysis_reading_ailments ON dialysis_readings.id = dialysis_reading_ailments.dr_id
JOIN
  ailments ON dialysis_reading_ailments.ailmentID = ailments.id
WHERE
  EXISTS(
    SELECT
      *
    FROM
      ailment_patient 
    WHERE
      ailment_patient.ailment_id = ailments.id
      AND
      ailment_patient.patient_id = ${patientId}
  );`;

  const ailmentData = await pool.query(ailmentJoin);
  await Promise.all(
    ailmentData.map(async (element) => {
      const readingsQuery = `SELECT 
    date, readings 
    FROM graph_readings_dialysis 
    WHERE user_id = ${patientId} AND question_id = ${element.did}`;
      const result = await pool.query(readingsQuery);
      xlsx.utils.sheet_add_aoa(ws, [[""]], {
        skipHeader: false,
        origin: -1,
      });
      xlsx.utils.sheet_add_aoa(ws, [[element.d_title]], {
        skipHeader: false,
        origin: -1,
      });
      if (result.length === 0) {
        xlsx.utils.sheet_add_aoa(ws, [["No data available"]], {
          skipHeader: false,
          origin: -1,
        });
        return;
      }
      xlsx.utils.sheet_add_json(ws, result, {
        origin: -1,
      });
    })
  );
  const ailmentDailyJoin = `SELECT
  daily_readings.id as did,
  ailments.id as ailmentID,
  daily_readings.title as d_title,
  ailments.name as ailment_name
FROM
  daily_readings
JOIN
  daily_reading_ailments ON daily_readings.id = daily_reading_ailments.dr_id
JOIN
  ailments ON daily_reading_ailments.ailmentID = ailments.id
WHERE
  EXISTS(
    SELECT
      *
    FROM
      ailment_patient 
    WHERE
      ailment_patient.ailment_id = ailments.id
      AND
      ailment_patient.patient_id = ${patientId}
  );`;

  const ailmentDailyData = await pool.query(ailmentDailyJoin);
  await Promise.all(
    ailmentData.map(async (element) => {
      const readingsQuery = `SELECT 
    date, readings 
    FROM graph_readings 
    WHERE user_id = ${patientId} AND question_id = ${element.did}`;
      const result = await pool.query(readingsQuery);
      xlsx.utils.sheet_add_aoa(ws, [[""]], {
        skipHeader: false,
        origin: -1,
      });
      xlsx.utils.sheet_add_aoa(ws, [[element.d_title]], {
        skipHeader: false,
        origin: -1,
      });
      if (result.length === 0) {
        xlsx.utils.sheet_add_aoa(ws, [["No data available"]], {
          skipHeader: false,
          origin: -1,
        });
        return;
      }
      xlsx.utils.sheet_add_json(ws, result, {
        origin: -1,
      });
    })
  );
  return ws;
};

const get_all_patient_data_sheets = async () => {
  const query = `SELECT id, name FROM patients`;
  const wb = xlsx.utils.book_new();
  const patients = await pool.query(query);
  await Promise.all(
    patients.map(async (patient) => {
      const ws = await getPatientDataSheet(patient.id);
      xlsx.utils.book_append_sheet(wb, ws, patient.name);
    })
  );
  return wb;
};

const getPatientData = async (req, res) => {
  try {
    const ws = await getPatientDataSheet(req.params.id);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Patient Data");
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
    res.set("Content-Disposition", "attachment; filename=patient_data.xlsx");
    res.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPatientAllData = async (req, res) => {
  try {
    const wb = await get_all_patient_data_sheets();
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
    res.set("Content-Disposition", "attachment; filename=patient_data.xlsx");
    res.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const canDoctorExport = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      decoded.email,
    ]);
    console.log(users);

    if (users.role === "Admin" ) {
      return res.status(200).json({ message: "User is an admin" });
    } else if (users.role === "Doctor") {
      const [doctor] = await pool.execute(
        "SELECT * FROM doctors WHERE email = ?",
        [decoded.email]
      );

      if (doctor && doctor.can_export === "yes") {
        return res.status(200).json({ message: "User is a doctor" });
      } else {
        return res
          .status(403)
          .json({ message: "User is not allowed to export" });
      }
    } else {
      return res
        .status(403)
        .json({ message: "User is not an admin or doctor" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

function processLines(lines) {
  const params = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes(':') || line === '') continue;

    if (i + 2 < lines.length) {
      const nextLine = lines[i + 1].trim();
      const nextNextLine = lines[i + 2].trim();
      if (nextLine && !isNaN(nextNextLine)) {
        const parameterName = line.split(' ')[0];
        const unit = nextLine;
        const value = nextNextLine;
        params.push({ parameter: parameterName, unit: unit, value: value });
        i += 2;
        continue;
      }
    }

    if (line.includes('Total') || line.includes('Platelet')) {
      const parts = lines[i + 1].split(' ');
      const value = lines[i + 1]?.slice(8);
      const unit = lines[i + 1]?.slice(0, 8);
      const parameterName = lines[i];
      params.push({ parameter: parameterName, unit: unit, value: value });
    }
  }
  return params;
}

function processLines2(lines) {
  const params = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes(':') || line === '') continue;

    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      const parts = line.split(/\s+/);
      if (parts.length >= 2 && !isNaN(parts[parts.length - 1])) {
        const value = lines[i + 2]?.slice(-4);
        const unit = lines[i + 2]?.slice(0, -4).trim();
        const parameterName = nextLine;
        params.push({ parameter: parameterName, unit: unit, value: value });
        i += 1;
        continue;
      }
    }
  }
  return params;
}

function extractCBCData(text) {
  const lines = text.split('\n');
  const startIndex = lines.findIndex(line => line.includes("COMPLETE BLOOD COUNT (CBC)"));
  const endIndex = lines.findIndex(line => line.includes("Advised: Hb HPLC to rule out Thalassemia Minor"));

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return [];
  }

  const relevantLines = lines.slice(startIndex, endIndex + 1);
  const firstNeutrophilsIndex = relevantLines.findIndex(line => line.includes("Neutrophils"));
  const lastNeutrophilsIndex = relevantLines.slice().reverse().findIndex(line => line.includes("Neutrophils"));
  const lastIndex = relevantLines.length - 1 - lastNeutrophilsIndex;

  const part1 = relevantLines;
  const part2 = relevantLines.slice(lastIndex + 1);

  const parametersPart1 = processLines(part1);
  const parametersPart2 = processLines2(part2);
  const result = [...parametersPart1, ...parametersPart2];
  result.pop();

  return result;
}


const PdfTextFunction = async (pdfUrl) => {
  if (!pdfUrl) {
    return null;
  }
  /*
    codes:
    - 0: success
    - 1: error while fetching the PDF
    - 2: error while parsing the PDF
    - 3: error while extracting text from the PDF
   */
  try {
    // Fetch the PDF from the provided URL
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfBuffer = response.data;

    // Parse the PDF and extract text
    const data = await pdfParse(pdfBuffer);
    const extractedText = data.text;
    const textArray = extractedText.split('\n').filter(line => line.trim() !== '');
    const medicalData = extractMedicalParameters(extractedText)

    return medicalData;


  } catch (error) {
    console.error('Error fetching or parsing PDF:', error);
  }
};

function extractMedicalParameters(text) {
  // Define patterns for parameter extraction using regular expressions
  const patterns = {
    "Hemoglobin": /Hemoglobin\s+([\d.]+)/,
    "Packed Cell Volume (PCV)": /Packed Cell Volume \(PCV\)\s+[\d.]+ - [\d.]+\s+\S+\s+([\d.]+)/,
    "RBC Count": /RBC Count\s+[\d.]+ - [\d.]+\s+\S+\s+([\d.]+)/,
    "MCV": /MCV\s+[\d.]+ - [\d.]+\s+\S+\s+([\d.]+)/,
    "MCH": /MCH\s+[\d.]+ - [\d.]+\s+\S+\s+([\d.]+)/,
    "MCHC": /MCHC\s+[\d.]+ - [\d.]+\s+\S+\s+([\d.]+)/,
    "Red Cell Distribution Width (RDW)": /Red Cell Distribution Width \(RDW\)\s+[\d.]+ - [\d.]+\s+\S+\s+([\d.]+)/,
    "Total Leukocyte Count (TLC)": /Total Leukocyte Count \(TLC\)\s+([\d.]+)/
  };

  // Results object to store extracted data
  let results = {};

  // Extract data for each pattern and store in results object
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      results[key] = match[1];  // Store the captured group (first match)
    }
  }

  // Regular expression pattern for extracting parameters
  const parameterPattern = /([a-zA-Z\s]+)\s*%\s*([\d.]+)/g;

  // Extracting parameters from DLC section
  const dlcResults = {};
  let match;
  while ((match = parameterPattern.exec(text)) !== null) {
    const paramName = match[1].trim();
    const paramValue = match[2];
    if (paramName) {
      results[paramName] = paramValue;
    }
  }

  // Regular expression pattern for extracting absolute parameters
  const absolutePattern = /([a-zA-Z\s]+)\s+thou\/mm3\s*([\d.]+)/g;

  // Extracting parameters from Absolute section
  const absoluteResults = {};
  while ((match = absolutePattern.exec(text)) !== null) {
    const paramName = match[1].trim();
    const paramValue = match[2];
    if (paramName) {
      results[paramName + " (absolute)"] = paramValue;
    }
  }

  return results;
}




exports.getPatientData = getPatientData;
exports.getPatientAllData = getPatientAllData;
exports.canDoctorExport = canDoctorExport;
exports.PdfText = PdfText;
exports.PdfTextFunction = PdfTextFunction;
exports.addLabTestCSV = addLabTestCSV;
