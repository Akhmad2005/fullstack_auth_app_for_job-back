const mysql = require('mysql2');

const connection = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,   
  queueLimit: 0,
});

module.exports = connection.promise();