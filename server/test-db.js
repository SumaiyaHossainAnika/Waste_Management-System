const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "12345",
  database: "postgres",
});

client.connect()
  .then(() => {
    console.log("Connected!");
    return client.query("SELECT datname FROM pg_database");
  })
  .then(result => {
    console.table(result.rows);
    return client.end();
  })
  .catch(err => {
    console.error(err.message);
  });