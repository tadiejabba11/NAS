
const mysql=require('mysql2');



const pool = mysql.createPool({
    host: 'localhost', // Replace with your database host
    user: 'root', // Replace with your database user
    password: '', // Replace with your database password
    database: 'NAS', // Replace with your database name
    connectionLimit: 10 // Adjust connection limit as needed (default is 10)
  });
  




 module.exports=pool