

// const mysql = require("mysql2/promise");
// const fs = require("fs");
// const path = require("path"); // 1. Path module ko import kiya
// require("dotenv").config();

// // 2. Safe path resolution: Agar DB_SSL_CA defined nahi hai, toh default path use hoga
// const certPath = process.env.DB_SSL_CA 
//   ? path.resolve(process.env.DB_SSL_CA) 
//   : path.join(__dirname, "..", "certs", "isrgrootx1.pem");

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,

//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,

//   ssl: {
//     // 3. fs.readFileSync ab hamesha ek valid string path receive karega
//     ca: fs.readFileSync(certPath),
//     rejectUnauthorized: true,
//   },
// });

// module.exports = pool;



const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// 💡 Sahi SSL Certificate pick karne ka logic:
let sslConfig = {
  rejectUnauthorized: true
};

if (process.env.DB_SSL_CA_CONTENT) {
  // 1. Agar Render par direct raw text (content) set hai, toh use karein
  sslConfig.ca = process.env.DB_SSL_CA_CONTENT;
} else {
  // 2. Agar local machine hai, toh pehle ki tarah file se read karein
  const certPath = process.env.DB_SSL_CA 
    ? path.resolve(process.env.DB_SSL_CA) 
    : path.join(__dirname, "..", "certs", "isrgrootx1.pem");
    
  sslConfig.ca = fs.readFileSync(certPath);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: sslConfig, // 🚀 Yahan humne dynamic ssl config pass kar di
});

module.exports = pool;