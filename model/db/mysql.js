var mysql = require('mysql');
const util = require('util');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'all';

/* Insert  */
function insert (text, dateFilename) {

  var pool = mysql.createPool({
    connectionLimit: 10,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database: "shadowing_db"
  });

  const id = Math.random().toString(32).substring(2);
  var sql = `INSERT INTO shadowing_table (id,text,date) VALUES ("${id}", "${text}", "${dateFilename}")`;
  pool.query(sql, function (err, result) {
    if (err) throw err;
    logger.info("1 record inserted");
  });

}

/* Select All */
async function selectAll () {

  var pool = mysql.createPool({
    connectionLimit: 10,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database: "shadowing_db"
  });

  pool.query = util.promisify(pool.query);
  try {
    var results = await pool.query('select * from shadowing_table')
    logger.info(results);
    pool.end(); // mysql process ended.
  } catch (err) {
    throw new Error(err)
  }
  return results;
}

/* Remove */
async function remove (id) {

  var pool = mysql.createPool({
    connectionLimit: 10,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database: "shadowing_db"
  });

  pool.query = util.promisify(pool.query);
  try {
    pool.query('DELETE FROM shadowing_table WHERE id=?', id, function (error, results, fields) {
      if (error) throw error;
      pool.end(); // mysql process ended.
    });
  } catch (err) {
    throw new Error(err)
  }
  return 'success';
}

/* Select */
async function select (id) {

  var pool = mysql.createPool({
    connectionLimit: 10,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database: "shadowing_db"
  });

  pool.query = util.promisify(pool.query);
  try {
    var result = await pool.query('select * from shadowing_table where id = ?', id)
    logger.info(result);
    pool.end(); // mysql process ended.
  } catch (err) {
    throw new Error(err)
  }
    return result;
}

module.exports = {
  insert,
  selectAll,
  remove,
  select
}
