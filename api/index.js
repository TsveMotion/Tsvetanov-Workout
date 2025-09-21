const express = require('express');
const { createClient } = require('@libsql/client');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initializeDb() {
    try {
        await db.batch([
            `CREATE TABLE IF NOT EXISTS logged_workouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                exercise TEXT NOT NULL,
                maxWeight REAL NOT NULL,
                totalReps INTEGER NOT NULL,
                volume REAL NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS body_measurements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                weight REAL,
                bodyFat REAL,
                waist REAL,
                chest REAL,
                arms REAL,
                legs REAL
            )`,
            `CREATE TABLE IF NOT EXISTS workout_plan (
                day TEXT PRIMARY KEY,
                plan_data TEXT NOT NULL
            )`
        ]);
        console.log('Database tables are ready.');
    } catch (err) {
        console.error("Database initialization failed:", err);
    }
}

initializeDb();

app.get('/api/data', async (req, res) => {
    try {
        const planResult = await db.execute("SELECT day, plan_data FROM workout_plan");
        const workoutsResult = await db.execute("SELECT * FROM logged_workouts ORDER BY date");
        const measurementsResult = await db.execute("SELECT * FROM body_measurements ORDER BY date");

        res.json({
            plan: planResult.rows,
            loggedWorkouts: workoutsResult.rows,
            bodyMeasurements: measurementsResult.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/workouts', async (req, res) => {
    try {
        const { date, exercise, maxWeight, totalReps, volume } = req.body;
        const result = await db.execute({
            sql: "INSERT INTO logged_workouts (date, exercise, maxWeight, totalReps, volume) VALUES (?, ?, ?, ?, ?)",
            args: [date, exercise, maxWeight, totalReps, volume]
        });
        res.json({ id: result.lastInsertRowid });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/measurements', async (req, res) => {
    try {
        const { date, weight, bodyFat, waist, chest, arms, legs } = req.body;
        const result = await db.execute({
            sql: "INSERT INTO body_measurements (date, weight, bodyFat, waist, chest, arms, legs) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [date, weight, bodyFat, waist, chest, arms, legs]
        });
        res.json({ id: result.lastInsertRowid });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/plan', async (req, res) => {
    try {
        const { day, plan_data } = req.body;
        await db.execute({
            sql: "INSERT OR REPLACE INTO workout_plan (day, plan_data) VALUES (?, ?)",
            args: [day, JSON.stringify(plan_data)]
        });
        res.json({ message: "Plan updated successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running locally on http://localhost:${port}`);
});

module.exports = app;
