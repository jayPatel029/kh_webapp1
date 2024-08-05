const { pool } = require("../../databaseConn/database.js");

const getDoctorCode = async (req, res, next) => {
  const { doctorcode } = req.body;
  try {
    const query = `SELECT * FROM doctors WHERE \`doctors code\` = '${doctorcode}'`;
    const result = await pool.query(query);
    console.log("get doctor code req found");
    if (result.length > 0) {
      // Phone number exists
      res.status(200).json({
        message: "Successful",
        doctorID: result[0]["id"],
      });
    } else {
      // Phone number doesn't exist
      res.status(404).json({
        success: false,
        message: "Doctor code not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while checking doctor code",
    });
  }
};

// have to add title or message field
const getDoctorMessages = async (req, res, next) => {
  const { userID } = req.body;
  try {
    const query = `SELECT * FROM alerts WHERE patientId = '${userID}' AND (alarmId IS NOT NULL OR labReportId IS NOT NULL OR requisitionId IS NOT NULL OR isOpened != 1)`;
    const result = await pool.query(query);
    if (result.length > 0) {
      const messages = [];
      for (const item of result) {
        const messageObject = {};
        if (item.alarmId !== null && !item.isOpened) {
          messageObject.id = item.id;

          messageObject.title = "Alarm";
          messageObject.message = `New Alarm Added`;
        }
        if (item.labReportId !== null && !item.isOpened) {
          messageObject.id = item.id;

          messageObject.title = "Lab Report";
          messageObject.message = `New Lab Report Request`;
        }
        if (item.requisitionId !== null && !item.isOpened) {
          messageObject.id = item.id;
          messageObject.title = "New Requisition Added";
          messageObject.message = `New Requisition Added`;
        }
        if (messageObject.title && messageObject.message) {
          messages.push(messageObject);
          // Update isOpened status
          await pool.query(
            `UPDATE alerts SET isOpened = 1 WHERE id = '${item.id}'`
          );
        }
      }

      const query2 = `SELECT * FROM app_alerts WHERE patientId = '${userID}' AND isOpened != 1`;
      const result2 = await pool.query(query2);
      if (result2.length > 0) {
        for (const item of result2) {
          messages.push({
            id: item.id,
            title: item.category,
            message: item.message,
          });
          // Update isOpened status
          await pool.query(
            `UPDATE app_alerts SET isOpened = 1 WHERE id = '${item.id}'`
          );
        }
      }

      const query3 = `SELECT c.id, c.content, c.userId
      FROM comments c
      LEFT JOIN commentsread cr ON c.id = cr.commentId
      WHERE (cr.isRead = 0 OR cr.isRead IS NULL) AND c.userId = ${userID}`;
      const result3 = await pool.query(query3);

      if (result3.length > 0) {
        messages.push({
          id: result3[0].id,
          title: "New comments added",
          message: "New Comments have been added, please check your app!",
        });

        for (const mesg of result3) {
          // console.log(mesg.id);
          await pool.query(
            `UPDATE commentsread set isRead = 1 where commentId = ${mesg.id}`
          );
        }
      }

      if (messages.length > 0) {
        res.status(200).json({
          result: true,
          message: "Successful",
          data: messages,
        });
      } else {
        res.status(200).json({
          result: false,
          message: "No new doctors messages found",
          data: [],
        });
      }
    } else {
      res.status(200).json({
        result: false,
        message: "No doctors messages found",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      result: false,
      message: "Error while checking doctor messages",
      data: null,
    });
  }
};

module.exports = {
  getDoctorCode,
  getDoctorMessages,
};
