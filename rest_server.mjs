import * as path from 'node:path';
import * as url from 'node:url';

import { default as express } from 'express';
import { default as sqlite3 } from 'sqlite3';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

const port = 8000;

let app = express();
app.use(express.json());

/********************************************************************
 ***   DATABASE FUNCTIONS                                         *** 
 ********************************************************************/
// Open SQLite3 database (in read-write mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});

// Create Promise for SQLite3 database SELECT query 
function dbSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}

// Create Promise for SQLite3 database INSERT or DELETE query
function dbRun(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

/********************************************************************
 ***   REST REQUEST HANDLERS                                      *** 
 ********************************************************************/

// GET request handler for crime codes
app.get('/codes', async (req, res) => {
    try {
        const query = 'SELECT * FROM Codes';
        const codes = await dbSelect(query, []);

        res.status(200).type('json').send({ codes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// GET request handler for neighborhoods
app.get('/neighborhoods', async (req, res) => {
    try {
        const query = 'SELECT * FROM Neighborhoods';
        const neighborhoods = await dbSelect(query, []);

        res.status(200).type('json').send({ neighborhoods });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// GET request handler for crime incidents
app.get('/incidents', async (req, res) => {
    try {
        const query = 'SELECT * FROM Incidents';
        const incidents = await dbSelect(query, []);

        res.status(200).type('json').send({ incidents });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// PUT request handler for new crime incident
app.put('/new-incident', async (req, res) => {
    try {
        // Assuming req.body contains the data for the new incident
        const { case_number, date_time, code, incident, police_grid, neighborhood_number, block } = req.body;

        const query = `
            INSERT INTO Incidents (case_number, date_time, code, incident, police_grid, neighborhood_number, block)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await dbRun(query, [case_number, date_time, code, incident, police_grid, neighborhood_number, block]);

        res.status(200).type('txt').send('OK');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// DELETE request handler for new crime incident
app.delete('/remove-incident', async (req, res) => {
    try {
        // Assuming req.body contains the data for the incident to be removed
        const { case_number } = req.body;

        const query = 'DELETE FROM Incidents WHERE case_number = ?';
        await dbRun(query, [case_number]);

        res.status(200).type('txt').send('OK');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


/********************************************************************
 ***   START SERVER                                               *** 
 ********************************************************************/
// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
