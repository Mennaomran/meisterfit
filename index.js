const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  throw new Error("MONGODB_URI is missing");
}

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 10000
})
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("Connection Error:", err.message));
// ===================================================
// الجزء الأول: جدول الـ workout_history (التاريخ والمسجل)
// ===================================================
const workoutSchema = new mongoose.Schema({
    user_id: { type: String, required: true }, 
    exercise: String,                          
    reps: Number,
    sets: { type: Number, default: 3 },        
    duration_min: { type: Number, default: 10 },
    calories: { type: Number, default: 100 },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    month: { type: String, default: "April" },
    year: { type: Number, default: 2026 }
}, { collection: 'workout_history' }); 

const Workout = mongoose.model('Workout', workoutSchema);

// POST لتسجيل تمرين في التاريخ (شاشة نهاية التمرين)
app.post('/save-workout', async (req, res) => {
    try {
        const workoutData = new Workout({
            user_id: req.body.user_id, 
            exercise: req.body.exercise, 
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

// GET لعرض التمارين السابقة لمستخدم (شاشة الـ History)
app.get('/history/:user_id', async (req, res) => {
    try {
        const userWorkouts = await Workout.find({ user_id: req.params.user_id });
        res.json(userWorkouts);
    } catch (error) {
        res.status(500).send({ error: "Error fetching history" });
    }
});


// ===================================================
// الجزء الثاني: جدول الـ workouts (قائمة التمارين المتاحة)
// ===================================================
const workoutsSchema = new mongoose.Schema({
    userId: { type: String, required: true }, 
    exerciseName: { type: String, required: true }, 
    reps: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { collection: 'workouts' }); 

const WorkoutList = mongoose.model('WorkoutList', workoutsSchema);

// POST لإضافة تمرين جديد في قائمة التمارين المتاحة
app.post('/api/workouts', async (req, res) => {
    try {
        const newWorkout = new WorkoutList({
            userId: req.body.userId,
            exerciseName: req.body.exerciseName,
            reps: req.body.reps
        });
        await newWorkout.save();
        res.status(201).json({ message: "Workout added successfully to workouts collection!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET لجلب لستة التمارين المتاحة (شاشة اختيار التمرين)
app.get('/api/workouts/:userId', async (req, res) => {
    try {
        const data = await WorkoutList.find({ userId: req.params.userId });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ===================================================
// الجزء الثالث: جدول الـ daily_reports (التقرير اليومي والـ Health Grade)
// ===================================================
const dailyReportSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    date: { type: String, required: true },
    health_grade: { type: Number, required: true },

    workout_summary: {
        exercises_completed: Number,
        calories_burned: Number,
        duration_min: Number,
        ai_accuracy: Number,
        target_muscles: [String],
        notes: String
    }
}, { collection: 'daily_reports' });

const DailyReport = mongoose.model('DailyReport', dailyReportSchema);


// POST لحفظ تقرير يومي جديد
app.post('/api/daily-reports', async (req, res) => {
    try {
        const workoutSummary = req.body.workout_summary || {};

        const newReport = new DailyReport({
            user_id: req.body.user_id,
            date: req.body.date || new Date().toISOString().split('T')[0],
            health_grade: req.body.health_grade,

            workout_summary: {
                exercises_completed: workoutSummary.exercises_completed,
                calories_burned: workoutSummary.calories_burned,
                duration_min: workoutSummary.duration_min,
                ai_accuracy: workoutSummary.ai_accuracy,
                target_muscles: workoutSummary.target_muscles,
                notes: workoutSummary.notes
            }
        });

        await newReport.save();
        res.status(201).json({ message: "Daily report saved successfully!" });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// GET لجلب التقارير اليومية للمستخدم (شاشة الـ Daily Report)
app.get('/api/daily-reports/:user_id', async (req, res) => {
    try {
        const reports = await DailyReport.find({ user_id: req.params.user_id });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// تشغيل السيرفر المظبوط
// تشغيل السيرفر
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Running on ${port}`);
});