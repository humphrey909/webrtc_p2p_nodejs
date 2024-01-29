const mysql = require('mysql2/promise');
const dbConfig = require("../config/db.config.js");

const pool = mysql.createPool({
	host: dbConfig.HOST, // localhost or ip
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    port: dbConfig.PORT,
    database: dbConfig.DB,
    
    multipleStatements: true, // allows to use multiple statements
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

module.exports = pool;
 

 
