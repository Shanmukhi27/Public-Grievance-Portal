const express = require('express');
const mysql = require('mysql');
const { spawn } = require('child_process');

const app = express();

// create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shannu@18',
  database: 'epics',
});

// connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// create route for generating live graph
app.get('/graph', (req, res) => {
  // query database for number of complaints in each status category
  const sql = `
    SELECT
      COUNT(*) AS num_complaints,
      status
    FROM
      pubcomplaint
    GROUP BY
      status
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Error querying database');
      return;
    }

    // create arrays for storing data
    const categories = [];
    const numSolved = [];
    const numInProgress = [];
    const numNotStarted = [];

    // populate arrays with data from database results
    results.forEach((row) => {
      categories.push(row.status);
      if (row.status === 'solved') {
        numSolved.push(row.num_complaints);
        numInProgress.push(0);
        numNotStarted.push(0);
      } else if (row.status === 'inProgress') {
        numInProgress.push(row.num_complaints);
        numSolved.push(0);
        numNotStarted.push(0);
      } else if (row.status === 'notStarted') {
        numNotStarted.push(row.num_complaints);
        numSolved.push(0);
        numInProgress.push(0);
      }

      console.log(numSolved);
      console.log(numInProgress);

    });

    // spawn Python process to generate live graph
    const python = spawn('python', ['live_graph.py', categories.join(','), numSolved.join(','), numInProgress.join(','), numNotStarted.join(',')]);

    // handle Python stdout data
    python.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    // handle Python stderr data
    python.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    // handle Python exit event
    python.on('exit', (code) => {
      console.log(`Python process exited with code ${code}`);
      // send live graph to client
      res.sendFile(__dirname + '/live_graph.png');
    });
  });
});

// start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
