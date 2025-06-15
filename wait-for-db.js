const { Client } = require('pg');
const process = require('process');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const maxRetries = 15;
let retries = 0;

console.log('Waiting for the database to be ready...');

function connectWithRetry() {
  const client = new Client({ connectionString });

  client
    .connect()
    .then(() => {
      console.log('Database connection successful!');
      client.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error(`Failed to connect to the database: ${err.message}`);
      retries += 1;
      if (retries < maxRetries) {
        console.log(`Retrying in 3 seconds... (${retries}/${maxRetries})`);
        setTimeout(connectWithRetry, 3000);
      } else {
        console.error('Max retries reached. Could not connect to the database.');
        process.exit(1);
      }
    });
}

connectWithRetry(); 