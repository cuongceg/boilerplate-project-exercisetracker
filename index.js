const express = require('express')
const app = express()
const cors = require('cors')
const connectDB = require('./config/db')
const mongoose = require('mongoose')
const User = require('./models/User')
const Log = require('./models/Log')
const Excercise = require('./models/excercise')
require('dotenv').config()

connectDB()
app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  const newUser = new User({ username });
  newUser.save()
    .then(user => res.json({ username: user.username, _id: user._id }))
    .catch(err => res.status(500).json({ error: 'Error saving user' }));
});

app.get('/api/users', async (req, res) => {
  try{
    const users = await User.find({}, { username: 1, _id: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    if (!description || !duration) {
      return res.status(400).json({ error: 'Description and duration are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const exerciseDate = date ? new Date(date) : new Date();
    const newExercise = new Excercise({
      username: user.username,
      userId: user._id,
      description,
      duration,
      date: exerciseDate
    });

    await newExercise.save();
    res.json({
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      _id: user._id,
      date: exerciseDate.toDateString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Error saving exercise with ' + err.message });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let query = { userId: userId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const exercises = await Excercise.find(query).limit(parseInt(limit)).exec();
    
    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log: exercises.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString()
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching logs' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
