const { json } = require("express");
const { pool } = require("../databaseConn/database.js");
const bcrypt = require("bcrypt");

const getUsers = async (req, res, next) => {
  const query = `SELECT * FROM users`;
  const users = await pool.query(query);
  res.status(200).json({
    success: true,
    data: users,
  });
};

const getUsersbyRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const query = "SELECT * FROM users WHERE role = ?";
    const users = await pool.query(query, [role]);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTotalUsers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);

    var query = `SELECT *
FROM patients
WHERE patients.name IS NOT NULL AND name <> '';
;
`;
    if (userId !== 1) {
      query = `
        SELECT p.*
        FROM patients p
        JOIN admin_patients ap ON p.id = ap.patient_id
        WHERE ap.admin_id = ${userId}
      `;
    }
    const users = await pool.query(query);
    const totalUsers = users.length;
    return res.status(200).json({
      success: true,
      data: totalUsers,
    });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getidbyEmail = async (req, res, next) => {
  const { email } = req.body;
  const query = `SELECT id FROM users WHERE email = '${email}'`;
  const id = await pool.query(query);
  console.log(id);
  res.status(200).json({ id: id[0]?.id });
};

const isDoctor = async (req, res, next) => {
  const { email } = req.body;
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  try {
    const user = await pool.query(query);
    if (user[0].role == "Doctor") {
      res.status(200).json({
        success: true,
        data: true,
      });
    } else {
      res.status(200).json({
        success: true,
        data: false,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "User not found",
    });
  }
};

const getUserbyEmail = async (req, res, next) => {
  const email = req.params.email;
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  const user = await pool.query(query);
  res.status(200).json({
    success: true,
    data: user,
  });
};

const updateUser = async (req, res, next) => {
  const { firstname, lastname, password, role, phoneno, email } = req.body;
  const editEmail = req.params.email;
  const user = {
    firstname: firstname,
    lastname: lastname,
    email: email,
    user_password: password,
    role_name: role,
    phoneno: phoneno,
  };

  if (password) {
    bcrypt.hash(user.user_password, 10, async (err, hash) => {
      if (err) {
        throw err;
      }
      user.user_password = hash;
      const query = `UPDATE users SET firstname='${user.firstname}', lastname='${user.lastname}', email='${user.email}', user_password='${user.user_password}', role='${user.role_name}', phoneno='${user.phoneno}' WHERE email='${editEmail}'`;
      const result = await pool.query(query);
      if (result) {
        res.status(200).json({
          success: true,
          message: "User updated successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Something went wrong",
        });
      }
    });
  } else {
    const query = `UPDATE users SET firstname='${user.firstname}', lastname='${user.lastname}', email='${user.email}', role='${user.role_name}', phoneno='${user.phoneno}' WHERE email='${editEmail}'`;
    const result = await pool.query(query);
    if (result) {
      res.status(200).json({
        success: true,
        message: "User updated successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Something went wrong",
      });
    }
  }
};

const deleteUser = async (req, res, next) => {
  const email = req.params.email;
  console.log(email);
  const query = `DELETE FROM users WHERE email='${email}'`;
  const result = await pool.query(query);
  if (result) {
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getTotalUsersThisWeekPSadmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("User ID:", userId);

    let query = `
      SELECT * FROM patients
    `;
    let queryParams = [];

    // If the user is not an admin, modify the query to filter based on the user's role
    if (userId !== 1) {
      query = `
        SELECT p.*
        FROM patients p
        JOIN admin_patients ap ON p.id = ap.patient_id
        WHERE ap.admin_id = ? 
          AND ap.date > DATE_SUB(NOW(), INTERVAL 1 WEEK)
      `;
      queryParams = [userId];
    }

    // Execute the query
    const users = [];
    const response = await pool.query(query, queryParams);
    // console.log("Response:", response);
    users.push(...response);
    // console.log("Users:", users);
    const total = users.length;
    // console.log("Total:", total);

    // Send the response with the total number of users
    return res.status(200).json({
      success: true,
      data: total,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching users by role:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getTotalUsersThisWeek = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("User ID:", userId);

    let query = `
      SELECT * FROM  patients WHERE registered_date > DATE_SUB(NOW(), INTERVAL 1 WEEK) AND patients.name IS NOT NULL AND name <> '';
    `;
    let queryParams = [];

    // If the user is not an admin, modify the query to filter based on the user's role
    if (userId !== 1) {
      query = `
        SELECT p.*
        FROM patients p
        JOIN admin_patients ap ON p.id = ap.patient_id
        WHERE ap.admin_id = ? 
          AND p.registered_date > DATE_SUB(NOW(), INTERVAL 1 WEEK)
      `;
      queryParams = [userId];
    }

    // Execute the query
    const users = [];
    const response = await pool.query(query, queryParams);
    // console.log("Response:", response);
    users.push(...response);
    // console.log("Users:", users);
    const total = users.length;
    // console.log("Total:", total);

    // Send the response with the total number of users
    return res.status(200).json({
      success: true,
      data: total,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching users by role:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUsersAssignedToPatient = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const query = `SELECT * FROM patients where id =?`;
    const result = await pool.query(query, [patientId]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const assignedPrograms = result[0].program_assigned_to;
    const ids = assignedPrograms
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id)); // Filter out NaN values

    if (ids.length === 0) {
      return res.status(200).json({
        success: true,
        data: [], // Return empty array if no valid IDs found
      });
    }

    const placeholders = ids.map(() => "?").join(",");
    const getUsersQuery = `SELECT id, firstname, role FROM users WHERE id IN (${placeholders})`;

    const usersResult = await pool.query(getUsersQuery, ids);

    const users = usersResult.map((user) => ({
      userId: user.id,
      name: user.firstname,
      role: user.role,
    }));

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users assigned to patient:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getDoctorsAssignedToPatient = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const query = `SELECT * FROM patients where id =?`;
    // console.log(patientId);
    const result = await pool.query(query, [patientId]);
    // console.log(result);
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }
    const assignedPrograms = result[0].medical_team;

    const ids = assignedPrograms
      .split(",")
      .map((id) => parseInt(id.trim(), 10));

    const placeholders = ids.map(() => "?").join(",");
    const getUsersQuery = `SELECT id, firstname, role FROM users WHERE id IN (${placeholders})`;

    const usersResult = await pool.query(getUsersQuery, ids);

    const users = usersResult.map((user) => ({
      userId: user.id,
      name: user.firstname,
      role: user.role,
    }));

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users assigned to patient:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserbyEmailDoctor = async (req, res, next) => {
  const email = req.params.email;
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  const user = await pool.query(query);
  res.status(200).json({
    success: true,
    data: user,
  });
};

module.exports = {
  getUsers,
  getUsersbyRole,
  getTotalUsers,
  getUserbyEmail,
  updateUser,
  deleteUser,
  getTotalUsersThisWeek,
  isDoctor,
  getUsersAssignedToPatient,
  getDoctorsAssignedToPatient,
  getTotalUsersThisWeekPSadmin,
  getidbyEmail,
  getUserbyEmailDoctor,
};
