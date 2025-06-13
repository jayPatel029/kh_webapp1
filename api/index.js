const express = require("express");
const body_parser = require("body-parser");
const app = express();
const { connectToDatabase } = require("./databaseConn/database.js");
const indexRouter = require("./Router/index.js");
const cors = require("cors");
const createTables = require("./Models/tables.js");
const http = require("http");
const cron = require("node-cron");
const { pool } = require("./databaseConn/database.js");
const morgan = require("morgan");
app.use(morgan("combined")); 
const helmet = require('helmet');
app.use(helmet());

const {
  createNewAlertForPatientDoctors,
  check_missed_dr_readings,
  check_missed_readings,
  checkMissedAlarms,
  deleteExpiredOTPs,
  checkMissedAlarmsForDoctors,
  checkDialysisEntries,
  checkDialysisEntriesForAdmin,
  resetAllPatientsCondition,
} = require("./cronjob/functions.js");

const { sendEmails } = require("./cronjob/AlertEmail.js");
const { configDotenv } = require("dotenv");

connectToDatabase();
createTables();

// createNewAlertForPatientDoctors();

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/app1", indexRouter);

// Error logging middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbCheck = await pool.query('SELECT DATABASE()');
    
    // Check if database is connected
    const isDbConnected = dbCheck.length > 0;
    
    // Get server uptime
    const uptime = process.uptime();
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: isDbConnected ? 'connected' : 'disconnected',
        server: 'running'
      },
      metrics: {
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
        }
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: 'error',
        server: 'running'
      }
    });
  }
});

const server = http.createServer(app);
const io = require("socket.io")(server, {
  // cors: {
  //   origin: "http://localhost:3000",
  //   // origin: 'https://doctortest.kifaytihealth.com',
  //   // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  //   // allowedHeaders: ['Content-Type', 'Authorization'],
  //   // credentials: true,
  // },
});
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'https://doctortest.kifaytihealth.com');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });

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
cron.schedule("56 18 * * *", async () => {
  // await createNewAlertForPatientDoctors();
  // await checkMissedAlarmsForDoctors();
  // await check_missed_dr_readings();
  // await check_missed_readings();
  await checkDialysisEntries();
  // await checkDialysisEntriesForAdmin();
});

// 12 AM cron job
cron.schedule("58 11 * * *", () => {
  checkMissedAlarms();
  deleteExpiredOTPs();
  resetAllPatientsCondition();
});

// 12 AM cron job //todo update time
cron.schedule("0 0 * * *", () => {
  sendEmails();
});

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});


