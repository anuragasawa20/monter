const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    location: { type: String },
    age: { type: Number },
    workDetails: { type: String }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;