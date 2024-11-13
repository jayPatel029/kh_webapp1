const { pool } = require("../databaseConn/database.js");

// const getRequisitions = async (req, res) => {
//   try {
//     const query = `SELECT * FROM requisition`;
//     const requisitions = await pool.query(query);
//     res.status(200).json(requisitions);
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// };

const getRequisition = async (req, res, next) => {
  const id = req.params.id;
  const query = `SELECT * FROM requisition WHERE Patient_id = ${id}`;
  const requisition = await pool.query(query);
  //   res.status(200).json(requisition);
  // } catch (error) {
  //   res.status(500).json({ error: error });
  // }
  res.status(200).json({
    success: true,
    data: requisition,
  });
};

const addRequisition = async (req, res, next) => {
  const { Requisition, Patient_id, Date } = req.body;
  console.log("requi",req.body);
  // const date = new Date().toISOString().slice(0, 19).replace("T", " ");

  const query = `INSERT INTO requisition (Requisition,Patient_id,Date) VALUES ('${Requisition}',${Patient_id},'${Date}')`;
  const result = await pool.query(query);
  if (result) {
    res.status(200).json({
      data: Number(result.insertId),
      success: true,
      message: "Requisition added successfully",
    });
  } else {
    res.status(400).json({
      data: Number(result.insertId),
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateRequisition = async (req, res, next) => {
  const { requisition, patient } = req.body;
  try {
    const query = `UPDATE requisition SET Requisition = ${requisition}, Patient = ${patient} WHERE requisition_id = ${req.params.id}`;
    const result = await pool.query(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const deleteRequisition = async (req, res, next) => {
  const id = req.params.id;
  const query = `DELETE FROM requisition WHERE id = ${id}`;

  const result = await pool.query(query);
  if (result) {
    res.status(200).json({
      success: true,
      message: "Requisition deleted successfully",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getRequisitionById = async (req, res, next) => {
  try {
    const query = `SELECT * FROM requisition where id = ${req.params.id}`;
    const requisition = await pool.query(query);
    res.status(200).json({
      success: true,
      data: requisition,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: "Error while fetching requisition by ID",
    });
  }
};

module.exports = {
  // getRequisitions,
  getRequisition,
  addRequisition,
  updateRequisition,
  deleteRequisition,
  getRequisitionById,
};
