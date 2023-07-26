var sql = require("mssql");

// config for your database
var config = {
  user: 'sa',
  password: 'qwerQWER1234!@#$',
  server: 'localhost',
  database: 'testDB',
  trustServerCertificate: true
};

// connect to your database
sql.connect(config, function (err) {

  if (err) console.log(err);

  // create Request object
  var request = new sql.Request();

  // query to the database and get the records
  request.query("select * from persons", function (err, data) {

    if (err) console.log(err)

    console.log(data);

    sql.close(); // closing the connection
  });

});