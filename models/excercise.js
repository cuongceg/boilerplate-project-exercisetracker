const mongoose = require('mongoose');
const excerciseSchema = new mongoose.Schema({
    username: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});
const Excercise = mongoose.model('Excercise', excerciseSchema);
module.exports = Excercise;