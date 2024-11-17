const express = require("express");
const body_parser = require("body-parser");
const app = express();
const { connectToDatabase } = require("./databaseConn/database.js");
const indexRouter = require("./Router/index.js");
const cors = require("cors");
const createTables = require("./Models/tables.js");
const http = require("http");
const cron = require("node-cron");
const {pool} = require("./databaseConn/database.js")
const {
  createNewAlertForPatientDoctors,
  check_missed_dr_readings,
  check_missed_readings,
  checkMissedAlarms,
  deleteExpiredOTPs,
  checkMissedAlarmsForDoctors,
  checkDialysisEntries,
  checkDialysisEntriesForAdmin,
} = require("./cronjob/functions.js");

const { sendEmails } = require("./cronjob/AlertEmail.js");

connectToDatabase();
createTables();


// createNewAlertForPatientDoctors();


app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(cors());
app.use("/api", indexRouter);

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// Socket.io logic goes here

let activeUsers = [];

io.on("connection", (socket) => {
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (
      !activeUsers.some((user) => user.userId === newUserId) &&
      newUserId !== null
    ) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    // send all active users to all users
    io.emit("get-users", activeUsers);
  });

  // send message to a specific user
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Sending from socket to :", receiverId);
    console.log("Data: ", data);
    if (user) {
      console.log(user.socketId);
      io.to(user.socketId).emit("recieve-message", data);
    }
  });
});

// 9 PM cron job
// cron.schedule("31 15 * * *", async () => {
//   //createNewAlertForPatientDoctors();
//   //await checkMissedAlarmsForDoctors();
//   //await check_missed_dr_readings();
//   //await check_missed_readings();
//   //checkDialysisEntries();
//   checkDialysisEntriesForAdmin();
// });

// 12 AM cron job
// cron.schedule("04 21 * * *", () => {
//   checkMissedAlarms();
//   deleteExpiredOTPs();
// });

// // 12 AM cron job
// cron.schedule("0 0 * * *", () => {
//   sendEmails()
// });

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});



