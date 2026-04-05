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

// --- التعديل هنا في الـ Schema عشان تناسب Laravel ---
const workoutSchema = new mongoose.Schema({
    user_id: { type: String, required: true }, // تغيير من userId لـ user_id
    exercise: String,                          // تغيير من exerciseName لـ exercise
    reps: Number,
    sets: { type: Number, default: 3 },        // إضافة خانات Laravel
    duration_min: { type: Number, default: 10 },
    calories: { type: Number, default: 100 },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    month: { type: String, default: "April" },
    year: { type: Number, default: 2026 }
}, { collection: 'workout_history' }); // إجبار الكود يدخل في جدول الـ history المشترك

const Workout = mongoose.model('Workout', workoutSchema);

// --- تعديل الـ POST عشان يقرأ البيانات الجديدة ---
app.post('/save-workout', async (req, res) => {
    try {
        const workoutData = new Workout({
            user_id: req.body.user_id, // الاسم الجديد
            exercise: req.body.exercise, // الاسم الجديد
            reps: req.body.reps,
            duration_min: req.body.duration_min || 10,
            calories: req.body.calories || 100
        });
        await workoutData.save();
        res.status(201).send({ message: "Saved to Shared History!" });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// --- تعديل الـ GET عشان يعرض التاريخ من الجدول المشترك ---
app.get('/history/:user_id', async (req, res) => {
    try {
        const userWorkouts = await Workout.find({ user_id: req.params.user_id });
        res.json(userWorkouts);
    } catch (error) {
        res.status(500).send({ error: "Error fetching history" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on ${port}`));