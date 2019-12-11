var mysql = require('mysql');
const util = require('util');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'all';

var pool = mysql.createPool({
  connectionLimit: 10,
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database: "shadowing_db"
});

/* Insert  */
function insert (text) {

  var sql = `INSERT INTO shadowing_table (text) VALUES ("${text}")`;
  pool.query(sql, function (err, result) {
    if (err) throw err;
    logger.info("1 record inserted");
  });

}

/* Select */
async function select () {

  pool.query = util.promisify(pool.query);
  try {
    var results = await pool.query('select * from shadowing_table')
    pool.end(); // mysql process ended.
  } catch (err) {
    throw new Error(err)
  }
  return results;
}

module.exports = {
  insert,
  select
}
