const { pool } = require("../databaseConn/database.js");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const findChat = async (sender, receiver, pid) => {
  const query = `
            SELECT * FROM chat
            WHERE ((user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)) AND patientid = ?
        `;
  const rows = await pool.query(query, [
    sender,
    receiver,
    receiver,
    sender,
    pid,
  ]);

  return rows.length ? rows[0] : null;
};

const createChat = async (sender, receiver, pid) => {
  const query = `
            INSERT INTO chat (user1, user2, patientid)
            VALUES (?, ?,?)
        `;

  const result = await pool.query(query, [sender, receiver, pid]);
  return result.insertId;
};

const getChatId = async (req, res) => {
  try {
    const { receiver, pid } = req.body;
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await pool.execute("SELECT * FROM users WHERE email = ?", [
      decoded.email,
    ]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    let chatEmail = decoded.email;
    if (user[0].role === "Admin") {
      chatEmail = process.env.ADMIN_EMAIL;
    }
    const chat = await findChat(chatEmail, receiver, pid);
    if (!chat) {
      const chatId = await createChat(chatEmail, receiver, pid);
      res.status(201).json({ chatId: parseInt(chatId) });
    } else {
      res.status(200).json({ chatId: chat.id });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { message, receiver, pid } = req.body;
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await pool.execute("SELECT * FROM users WHERE email = ?", [
      decoded.email,
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    let chatEmail = decoded.email;
    if (user[0].role === "Admin") {
      chatEmail = process.env.ADMIN_EMAIL;
    }

    const chat = await findChat(chatEmail, receiver, pid);
    if (!chat) {
      const chatId = await createChat(chatEmail, receiver, pid);
      const query = `
                    INSERT INTO messages (chatid, sender, message)
                    VALUES (?, ?, ?)
                `;
      const result = await pool.query(query, [chatId, decoded.email, message]);
      if (result.affectedRows === 1) {
        res.status(201).json({ chatId: parseInt(chatId) });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    } else {
      const query = `
                    INSERT INTO messages (chatid, sender, message)
                    VALUES (?, ?, ?)
                `;
      const result = await pool.query(query, [chat.id, decoded.email, message]);
      if (result.affectedRows === 1) {
        res.status(201).json({ chatId: chat.id });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const updateQuery = `
    UPDATE messages SET messsage_read = 1
    WHERE messages.chatid = ? AND messages.sender != ?;
        `;
    const query = `
            SELECT * FROM messages JOIN users ON messages.sender = users.email
            WHERE messages.chatid = ? ORDER BY sent_at DESC LIMIT 50
        `;
    const rowsUpdate = await pool.query(updateQuery, [chatId, decoded.email]);
    const rows = await pool.query(query, [chatId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const convertBigIntToInt = (obj) => {
  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Check if the property value is a BigInt
      if (typeof obj[key] === "bigint") {
        // Convert BigInt to integer
        newObj[key] = Number(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
};

const getAllChats = async (req, res) => {
  try {
    const pid = req.params.pid;
    console.log(pid)
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decoded.email)
    const query = `
      (
        SELECT 
          chat.id,
          chat.user1, 
          chat.user2, 
          chat.patientid, 
          users.firstname, 
          users.lastname, 
          users.role, 
          users.email AS receiverEmail, 
          COUNT(messages.message) AS unreadCount 
        FROM chat 
        JOIN users ON chat.user2 = users.email 
        LEFT JOIN messages ON chat.id = messages.chatid 
          AND messages.sender != ? 
          AND messages.messsage_read = 0 
        WHERE chat.user1 = ? AND chat.patientid = ?
        GROUP BY chat.id
      )
      UNION 
      (
        SELECT 
          chat.id, 
          chat.user1, 
          chat.user2, 
          chat.patientid, 
          users.firstname, 
          users.lastname, 
          users.role, 
          users.email AS receiverEmail, 
          COUNT(messages.message) AS unreadCount 
        FROM chat 
        JOIN users ON chat.user1 = users.email 
        LEFT JOIN messages ON chat.id = messages.chatid 
          AND messages.sender != ? 
          AND messages.messsage_read = 0 
        WHERE chat.user2 = ? AND chat.patientid = ?
        GROUP BY chat.id
      ) 
      ORDER BY unreadCount DESC;
    `;

    const rows = await pool.query(query, [
      decoded.email,
      decoded.email,
      pid,
      decoded.email,
      decoded.email,
      pid,
    ]);
    const rowsWithIntegers = rows.map((row) => convertBigIntToInt(row));
    res.status(200).json(rowsWithIntegers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllByEMailChats = async (req, res) => {
  try {
    const pid = req.params.pid;
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const query = `
      (
        SELECT 
          chat.id,
          chat.user1, 
          chat.user2, 
          chat.patientid, 
          users.firstname, 
          users.lastname, 
          users.role, 
          users.email AS receiverEmail, 
          COUNT(messages.message) AS unreadCount 
        FROM chat 
        JOIN users ON chat.user2 = users.email 
        LEFT JOIN messages ON chat.id = messages.chatid 
          AND messages.sender != ? 
          AND messages.messsage_read = 0 
        WHERE chat.user1 = ? AND chat.patientid = ?
        GROUP BY chat.id
      )
      UNION 
      (
        SELECT 
          chat.id, 
          chat.user1, 
          chat.user2, 
          chat.patientid, 
          users.firstname, 
          users.lastname, 
          users.role, 
          users.email AS receiverEmail, 
          COUNT(messages.message) AS unreadCount 
        FROM chat 
        JOIN users ON chat.user1 = users.email 
        LEFT JOIN messages ON chat.id = messages.chatid 
          AND messages.sender != ? 
          AND messages.messsage_read = 0 
        WHERE chat.user2 = ? AND chat.patientid = ?
        GROUP BY chat.id
      ) 
      ORDER BY unreadCount DESC;
    `;

    const rows = await pool.query(query, [
      decoded.email,
      process.env.ADMIN_EMAIL,
      pid,
      decoded.email,
      process.env.ADMIN_EMAIL,
      pid,
    ]);
    const rowsWithIntegers = rows.map((row) => convertBigIntToInt(row));
    res.status(200).json(rowsWithIntegers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSWChats = async (req, res) => {
  try {
    const pid = req.params.pid;
    const { sender } = req.body;
    const query = `
      (
        SELECT 
          chat.id,
          chat.user1, 
          chat.user2, 
          chat.patientid, 
          users.firstname, 
          users.lastname, 
          users.role, 
          users.email AS receiverEmail
        FROM chat 
        JOIN users ON chat.user2 = users.email 
        WHERE chat.user1 = ? AND chat.user2 != ? AND chat.patientid = ?
      )
      UNION 
      (
        SELECT 
          chat.id, 
          chat.user1, 
          chat.user2, 
          chat.patientid, 
          users.firstname, 
          users.lastname, 
          users.role, 
          users.email AS receiverEmail
        FROM chat 
        JOIN users ON chat.user1 = users.email 
        WHERE chat.user2 = ? AND chat.user1 != ? AND chat.patientid = ?
        GROUP BY chat.id
      ) ;
    `;

    let rows = await pool.query(query, [
      sender,
      process.env.ADMIN_EMAIL,
      pid,
      sender,
      process.env.ADMIN_EMAIL,
      pid,
    ]);
    for (let i = 0; i < rows.length; i++) {
      const query = `
      SELECT * FROM messages JOIN users ON messages.sender = users.email WHERE messages.chatid = ? ORDER BY sent_at ASC;
      `;
      const result = await pool.query(query, [rows[i].id]);
      rows[i].messages = result;
    }
    const rowsWithIntegers = rows.map((row) => convertBigIntToInt(row));
    res.status(200).json(rowsWithIntegers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSWMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const query = `
      SELECT * FROM messages JOIN users ON messages.sender = users.email WHERE messages.chatid = ? ORDER BY sent_at ASC;
    `;
    const rows = await pool.query(query, [chatId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export the controller function
module.exports = {
  getChatId,
  getAllChats,
  sendMessage,
  getMessages,
  getAllByEMailChats,
  getSWChats,
  getSWMessages,
};
