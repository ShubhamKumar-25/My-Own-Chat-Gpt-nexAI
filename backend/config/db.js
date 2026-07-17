
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// 💡 Sahi SSL Certificate pick karne ka logic:
let sslConfig = {
  rejectUnauthorized: true
};

if (process.env.DB_SSL_CA_CONTENT) {
  sslConfig.ca = process.env.DB_SSL_CA_CONTENT;
} else {

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

  ssl: sslConfig, 
});

module.exports = pool;