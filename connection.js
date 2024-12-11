
const mysql = require('mysql2');

  require('dotenv').config()
// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Database host (e.g., localhost or a remote server)
  user: process.env.DB_USER, // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Database name
  port: process.env.DB_PORT, // Database port (e.g., 3306 for MySQL)
  connectionLimit: 500, // Maximum number of connections in the pool
});

// Export the pool for use in other modules
module.exports = pool;
