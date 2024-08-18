const dotenv = require("dotenv");
const mariadb = require("mariadb");

dotenv.config();
const pool = mariadb.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  connectionLimit: 5,
  database: process.env.database,
  port: process.env.PORT,
});

const Sequelize = require("sequelize");

// Create a new Sequelize instance
const sequelize = new Sequelize(
  process.env.database,
  process.env.user,
  process.env.password,
  {
    host: process.env.host,
    dialect: "mariadb",
    port: process.env.PORT,
    logging: false,
    dialectOptions: {
      useUTC: false,
    },
    timezone: "+05:30",
  }
);

async function connectToDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("db connection successfull");
    sequelize
      .authenticate()
      .then(() => {
        console.log("Sequelize Connection has been established successfully.");
      })
      .catch((error) => {
        console.error("Unable to connect to the database:", error);
      });
  } catch (error) {
    console.error("db connection failed", error);
  } finally {
    if (conn) conn.release(); //release to pool
  }
}

module.exports = {
  connectToDatabase,
  pool,
  sequelize,
};
