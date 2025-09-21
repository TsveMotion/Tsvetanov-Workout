const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;
const DB_FILE = 'database.db';

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS logged_workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        exercise TEXT NOT NULL,
        maxWeight REAL NOT NULL,
        totalReps INTEGER NOT NULL,
        volume REAL NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS body_measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        weight REAL,
        bodyFat REAL,
        waist REAL,
        chest REAL,
        arms REAL,
        legs REAL
    )`);

     db.run(`CREATE TABLE IF NOT EXISTS workout_plan (
        day TEXT PRIMARY KEY,
        plan_data TEXT NOT NULL
    )`);
});

app.get('/api/data', (req, res) => {
    const data = {};
    const planPromise = new Promise((resolve, reject) => {
         db.all("SELECT day, plan_data FROM workout_plan", [], (err, rows) => {
            if (err) reject(err);
            data.plan = rows;
            resolve();
        });
    });
    const workoutsPromise = new Promise((resolve, reject) => {
        db.all("SELECT * FROM logged_workouts ORDER BY date", [], (err, rows) => {
            if (err) reject(err);
            data.loggedWorkouts = rows;
            resolve();
        });
    });
    const measurementsPromise = new Promise((resolve, reject) => {
        db.all("SELECT * FROM body_measurements ORDER BY date", [], (err, rows) => {
            if (err) reject(err);
            data.bodyMeasurements = rows;
            resolve();
        });
    });

    Promise.all([planPromise, workoutsPromise, measurementsPromise])
        .then(() => res.json(data))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/api/workouts', (req, res) => {
    const { date, exercise, maxWeight, totalReps, volume } = req.body;
    db.run(`INSERT INTO logged_workouts (date, exercise, maxWeight, totalReps, volume) VALUES (?, ?, ?, ?, ?)`, 
    [date, exercise, maxWeight, totalReps, volume], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.post('/api/measurements', (req, res) => {
    const { date, weight, bodyFat, waist, chest, arms, legs } = req.body;
    db.run(`INSERT INTO body_measurements (date, weight, bodyFat, waist, chest, arms, legs) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [date, weight, bodyFat, waist, chest, arms, legs], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.post('/api/plan', (req, res) => {
    const { day, plan_data } = req.body;
    db.run(`INSERT OR REPLACE INTO workout_plan (day, plan_data) VALUES (?, ?)`, 
    [day, JSON.stringify(plan_data)], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Plan updated successfully" });
    });
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
