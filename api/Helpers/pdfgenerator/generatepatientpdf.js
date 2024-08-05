const xlsx = require("xlsx");
const { pool } = require("../../databaseConn/database");

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

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet([["Patient Details"]]);

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
JOIN ailments ON dialysis_readings.ailmentID = ailments.id
WHERE
  EXISTS(
SELECT
  *
FROM ailment_patient 
WHERE ailment_patient.ailment_id = ailments.id
AND ailment_patient.patient_id = ${patientId}
);`;

  const ailmentData = await pool.query(ailmentJoin);
  await Promise.all(
    ailmentData.map(async (element) => {
      const readingsQuery = `SELECT 
    id, date, readings 
    FROM graph_readings_dialysis 
    WHERE user_id = ${patientId} AND question_id = ${element.did}`;
      const result = await pool.query(readingsQuery);
      xlsx.utils.sheet_add_aoa(ws, [[""]], {
        skipHeader: false,
        origin: -1,
      });
      xlsx.utils.sheet_add_aoa(ws, [[element.d_title, element.ailment_name]], {
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
  const patients = await pool(query);
  await Promise.all(
    patients.map(async (patient) => {
      const ws = await getPatientDataSheet(patient.id);
      xlsx.utils.book_append_sheet(wb, ws, patient.name);
    })
  );
  return wb;
};

exports = {
  getPatientDataSheet,
  get_all_patient_data_sheets,
};
