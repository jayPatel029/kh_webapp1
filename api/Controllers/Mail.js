const { pool } = require("../databaseConn/database.js")
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const { generateJwtFromUser } = require('../Helpers/auth/tokenHelpers.js');
const verifyMailTemplate = require("../mailTemplates/verifyMail.js");

dotenv.config();

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

function generateOTP() {
    const OTP_LENGTH = 6;

    const OTP_CHARS = '0123456789';

    let otp = '';
    for (let i = 0; i < OTP_LENGTH; i++) {
        otp += OTP_CHARS.charAt(Math.floor(Math.random() * OTP_CHARS.length));
    }
    return otp;
}


const sendMail = async (req, res) => {
    try {
        let OTP = generateOTP()

        // Check if the email exists in the doctors table
        let email = req.body.email;
        email=email.trim()
        const emailExistsQuery = "SELECT * FROM doctors WHERE email = ?";
        const emailExistsResult = await pool.query(emailExistsQuery, [email]);
        if (emailExistsResult.length === 0) {
            return res.status(400).json("Doctor with this email does not exist");
        }

        let info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: req.body.email,
            subject: `${OTP} is your Kifayti Health Verification Code`,
            html: verifyMailTemplate(OTP)
        })

        const timestamp = new Date();
        const query = `INSERT INTO mail_otp (email, otp, timestamp) VALUES (?, ?, ?)`;
        const values = [req.body.email, OTP, timestamp];
        try {
            await pool.query(query, values);
        } catch (error) {
            console.error(error);
        }




        // const mailOtpUser = new mailOtp({ email: email, otp: OTP, timestamp: new Date()})
        // await mailOtpUser.save()

        res.status(200).json("Email Sent Successfully")
    }
    catch (err) {
        console.log(err)
        return (false)
    }
}

const VerifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const parsedOTP = parseInt(otp);
  try {
    const rows = await pool.query(
      'SELECT * FROM mail_otp WHERE email = ? ORDER BY timestamp DESC LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      res.json({ status: 'notFound' });
    } else {
      const mailOtpUser = rows[0];
      const timeDifferenceInMinutes = Math.floor(
        (new Date() - mailOtpUser.timestamp) / (1000 * 60)
      );

      if (timeDifferenceInMinutes < 5) {
        if (parsedOTP === mailOtpUser.otp) {
          const user = {
            email: email,
          }
          const token = generateJwtFromUser(user);
          res.json({ status: 'true', token});
        } else {
          res.json({ status: 'incorrect' });
        }
      } else {
        res.json({ status: 'expired' });
      }
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}


module.exports = {
    sendMail,
    VerifyOtp
}