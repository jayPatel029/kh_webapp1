const { sendToken } = require("../Helpers/auth/tokenHelpers.js");
const bcrypt = require("bcrypt");
const { pool } = require("../databaseConn/database.js");
const jwt = require("jsonwebtoken");

const getPrivateData = (req, res, next) => {
  res.status(200).json({
    success: true,
    data: "You got access to the private data in this route",
    user: req.user,
  });
};

const register = async (req, res, next) => {
  const { firstname, lastname, email, password, role, phoneno } = req.body;
  const user = {
    firstname: firstname,
    lastname: lastname,
    email: email,
    user_password: password,
    role_name: role,
    phoneno: phoneno,
    regdate: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  try {
    const isuser = await pool.query(
      `SELECT * FROM users WHERE email = '${user.email}'`
    );
    if (isuser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    
  } catch (error) {
    console.log(error)
  }
 
  
  const hash = await bcrypt.hash(user.user_password, 10);
  user.user_password = hash;

  const query = `INSERT INTO users (firstname,lastname,email,user_password,role,phoneno,regdate) VALUES('${user.firstname}','${user.lastname}','${user.email}','${user.user_password}','${user.role_name}','${user.phoneno}','${user.regdate}')`;
  const result = await pool.query(query);
  console.log(result)
  if (result) {
    res.status(200).json({
      success: true,
      message: "User registered successfully",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  const user = await pool.query(query);
  if (user.length == 0) {
    res.status(400).json({
      success: false,
      message: "User not found",
    });
  } else {
    if (user[0].role == "Medical Staff") {
      return res.status(400).json({
        success: false,
        message: "Doctor/Medical Staff cannot login here",
      });
    } else {
      bcrypt.compare(password, user[0].user_password, (err, isMatch) => {
        if (err) {
          throw err;
        }
        if (isMatch) {
          sendToken(user[0], 200, res);
        } else {
          res.status(400).json({
            success: false,
            message: "Password is wrong",
          });
        }
      });
    }
  }
};

const changePassword = async (req, res, next) => {
  const { token, newPassword } = req.body; // Assuming the token is sent from the frontend

  try {
    // Decode the JWT token to get user's email
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userEmail = decoded.email;

    // Retrieve user from the database based on the provided email
    const getUserQuery = `SELECT * FROM users WHERE email = '${userEmail}'`;
    const user = await pool.query(getUserQuery);

    if (user.length === 0) {
      res.status(400).json({
        success: false,
        message: "User not found",
      });
    } else {
      bcrypt.hash(newPassword, 10, async (hashErr, hash) => {
        if (hashErr) {
          throw hashErr;
        }
        // Update the user's password in the database
        const updatePasswordQuery = `UPDATE users SET user_password = '${hash}' WHERE email = '${userEmail}'`;
        const updateResult = await pool.query(updatePasswordQuery);

        if (updateResult) {
          res.status(200).json({
            success: true,
            message: "Password changed successfully",
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Something went wrong while updating the password",
          });
        }
      });
    }
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


module.exports = {
  getPrivateData,
  register,
  login,
  changePassword,
};
