const { pool } = require("../../databaseConn/database.js");
//!static token1
const login = async (req, res) => {
  console.log("login req found");
  const { pushNotificationID, phoneNo } = req.body;
  const query = `SELECT *  from patients where number = ${phoneNo}`;
  try{
    const result = await pool.query(query);
    // console.log(result[0]["id"]);
    const responseJSON = {
      token:
        "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VybmFtZSI6IlByYXRoYW1lc2ggTXVuZGFkYSIsIlVzZXJJbWFnZSI6IiIsIlVzZXJJRCI6IjgyIiwiSXNBZHZhbmNlZCI6InRydWUiLCJEYXRlT2ZCaXJ0aCI6IjQvMTYvMjAwMyAxMjowMDowMCBBTSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiMzVmMzE0MzctN2VlMS00YzI4LWJjMTMtZWUwYTNjODU5ODQ5IiwiZXhwIjoxNzM5OTc2MzU5LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTczLyIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjcxNzMvIn0.EscpFfmoAL5ZKAdiOBWGpvOaqY4dXnzpz-rOtAxOfag",
      userID: result[0]["id"],
    };
    res.json(responseJSON);
  }catch(err){
    res.status(500).json({
      result: false,
      message: "Error while fetching patient",
    });
  }
};


const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const loginv2 = async (req, res) => {
console.log(JWT_SECRET_KEY);
  console.log("login request received");
  const {pushNotificationID, phoneNo } = req.body;
  const query = `SELECT * FROM patients WHERE number = ${phoneNo}`;
  try {
    const result = await pool.query(query);

    if (result.length === 0) {
      return res.status(404).json({
        result: false,
        message: "No patient found with this phone number",
      });
    }

    const patient = result[0];

    const isAdvance = patient.program === "Advanced" ? 1 : 0;

    const payload = {
      name: patient.name,
      number: patient.number,
      id: patient.id,
      pushNotificationID: pushNotificationID || null,
      isAdvance: isAdvance,
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: "24h", 
      issuer: "https://localhost:7173/", //temp issuer
    });

    // Respond with the token and user ID
    const responseJSON = {
      token,
      userID: patient.id,
    };

    res.json(responseJSON);
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({
      result: false,
      message: "Error while fetching patient",
    });
  }
};

module.exports = {
  login,
  loginv2,
};

// const login = async (req, res, next) => {
//     const { pushNotificationID, phoneNo } = req.body;
//     const query = `SELECT * FROM patieznt WHERE number = '${email}'`;
//     const user = await pool.query(query);
//     if (user.length == 0) {
//       res.status(400).json({
//         success: false,
//         message: "User not found",
//       });
//     } else {
//       if (user[0].role == "Medical Staff") {
//         return res.status(400).json({
//           success: false,
//           message: "Doctor/Medical Staff cannot login here",
//         });
//       } else {
//         bcrypt.compare(password, user[0].user_password, (err, isMatch) => {
//           if (err) {
//             throw err;
//           }
//           if (isMatch) {
//             sendToken(user[0], 200, res);
//           } else {
//             res.status(400).json({
//               success: false,
//               message: "Password is wrong",
//             });
//           }
//         });
//       }
//     }
//   };