const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gymProject';

mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB!"))
    .catch(err => console.error("Connection Error:", err));

const workoutSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    exerciseName: String,
    reps: Number,
    date: { type: Date, default: Date.now }
});

const Workout = mongoose.model('Workout', workoutSchema);

app.post('/save-workout', async (req, res) => {
    try {
        const workoutData = new Workout({
            userId: req.body.userId,
            exerciseName: req.body.exerciseName,
            reps: req.body.reps
        });
        await workoutData.save();
        res.status(201).send({ message: "Saved!" });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.get('/history/:userId', async (req, res) => {
    try {
        const userWorkouts = await Workout.find({ userId: req.params.userId });
        res.json(userWorkouts);
    } catch (error) {
        res.status(500).send({ error: "Error" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on ${port}`));