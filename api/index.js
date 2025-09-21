const { put, get, del } = require('@vercel/blob');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_BLOB_KEY = 'data.json';

// Default initial structure if no data exists yet
const initialData = {
    workoutData: {
        monday: { title: "Chest & Triceps", tag: "Swim Day", supersets: [{ title: "Superset 1 (3 Rounds)", exercises: [{name: "Barbell Bench Press", target: "8-10 reps"}, {name: "Dumbbell Overhead Tricep Extension", target: "12 reps"}], rest: "75 seconds" }, { title: "Superset 2 (2 Rounds)", exercises: [{name: "Incline Dumbbell Press", target: "10-12 reps"}, {name: "Push-ups", target: "Max reps"}], rest: "60 seconds" }], finisher: { title: "Core Finisher (2 Rounds)", exercises: [{name: "Lying Leg Raises", target: "15 reps"}], rest: "30 seconds" }},
        tuesday: { title: "Legs", tag: "Walk Only", supersets: [{ title: "Superset 1 (3 Rounds)", exercises: [{name: "Barbell Squats", target: "10 reps"}, {name: "Calf Raises", target: "20 reps"}], rest: "90 seconds" }, { title: "Superset 2 (2 Rounds)", exercises: [{name: "Dumbbell Romanian Deadlift", target: "10 reps"}, {name: "Walking Lunges", target: "10 reps each leg"}], rest: "75 seconds" }], finisher: { title: "Core Finisher (2 Rounds)", exercises: [{name: "Plank", target: "60 seconds"}], rest: "30 seconds" }},
        wednesday: { title: "Back & Biceps", tag: "Swim Day", supersets: [{ title: "Superset 1 (3 Rounds)", exercises: [{name: "Barbell bent-over row", target: "10-12 reps"}, {name: "Hammer Curls", target: "12 reps"}], rest: "75 seconds" }, { title: "Superset 2 (2 Rounds)", exercises: [{name: "One-arm dumbbell row", target: "12 reps each side"}, {name: "Barbell Curls", target: "12 reps"}], rest: "60 seconds" }], finisher: { title: "Core Finisher (2 Rounds)", exercises: [{name: "Ab roller", target: "8-10 reps"}], rest: "30 seconds" }},
        thursday: { title: "Shoulders & Core", tag: "Swim Day", supersets: [{ title: "Superset 1 (3 Rounds)", exercises: [{name: "Dumbbell overhead press", target: "10-12 reps"}, {name: "Dumbbell lateral raises", target: "12 reps"}], rest: "75 seconds" }, { title: "Superset 2 (2 Rounds)", exercises: [{name: "Dumbbell rear delt fly", target: "12 reps"}, {name: "Mountain climbers", target: "30 seconds"}], rest: "60 seconds" }], finisher: { title: "Core Finisher (2 Rounds)", exercises: [{name: "Bicycle crunches", target: "20 reps"}, {name: "Flutter kicks", target: "30 seconds"}], rest: "45 seconds" }},
        friday: { title: "Arms & Endurance", tag: "Swim Day", supersets: [{ title: "Superset 1 (3 Rounds)", exercises: [{name: "Incline barbell bench press", target: "8-10 reps"}, {name: "Barbell Curls", target: "12 reps"}], rest: "75 seconds" }, { title: "Superset 2 (2 Rounds)", exercises: [{name: "Close-grip push-ups", target: "Max reps"}, {name: "Dumbbell skullcrushers", target: "12 reps"}], rest: "60 seconds" }], finisher: { title: "Core Finisher (2 Rounds)", exercises: [{name: "Plank-to-elbow", target: "60 seconds"}], rest: "30 seconds" }}
    },
    loggedWorkouts: [],
    bodyMeasurements: []
};

// GET endpoint to fetch all application data
app.get('/api/data', async (req, res) => {
    try {
        const blob = await get(DATA_BLOB_KEY);
        if (!blob) {
            // If the blob doesn't exist, create it with the initial data
            await put(DATA_BLOB_KEY, JSON.stringify(initialData), { access: 'public' });
            return res.json(initialData);
        }
        const data = await blob.json();
        res.json(data);
    } catch (error) {
        if (error.statusCode === 404) {
             await put(DATA_BLOB_KEY, JSON.stringify(initialData), { access: 'public' });
             return res.json(initialData);
        }
        console.error("Failed to get data:", error);
        res.status(500).json({ message: "Error fetching data.", error: error.message });
    }
});

// POST endpoint to overwrite the entire application data state
app.post('/api/data', async (req, res) => {
    try {
        const data = req.body;
        await put(DATA_BLOB_KEY, JSON.stringify(data), { access: 'public' });
        res.status(200).json({ message: 'Data saved successfully.' });
    } catch (error) {
        console.error("Failed to save data:", error);
        res.status(500).json({ message: 'Error saving data.', error: error.message });
    }
});

module.exports = app;

