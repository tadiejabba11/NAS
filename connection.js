
const mysql=require('mysql2');



  
  require('dotenv').config();
  const mysql = require('mysql2');
  
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
  });
  
  connection.connect((error) => {
    if (error) {
      console.error('Error connecting to the database:', error.stack);
      return;
    }
    console.log('Connected to the database.');
  });
  
  module.exports = connection;
  



 module.exports=pool