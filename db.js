const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    password: 'Aa123456',
    host: 'localhost',
    port: 5432, 
    database: 'db_outsidedigital'
})


module.exports = pool 