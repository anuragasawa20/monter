const express = require('express');
const connectDB = require('./db');
const User = require('./Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const dotenv = require("dotenv").config();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');


const app = express();

app.use(express.json());
app.use(bodyParser.json());
connectDB();

const bcryptSalt = bcrypt.genSaltSync(10);

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


const sendEmail = async (mail, OTP) => {
    try {
        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // e.g., 'gmail'
            auth: {
                user: 'owner@gmail.com', // mail should be of owner 
                pass: 'ownerPassword',   //  password should of owner too
            },
        });
        // Set up email data
        // var OTP1 = Math.floor(Math.random() * 10000) + 10000;
        // otpGlobal = OTP1;

        const mailOptions = {
            from: process.env.Email,
            to: `${mail}`,
            subject: 'Monter OTP',
            text: `Hello!\n\nYou're receiving this email for Registering on Monter OTP is ${OTP}`,
        };
        // Send the email with attached PDF
        // console.log(otpGlobal);
        await transporter.sendMail(mailOptions);
        return true;

    } catch (err) {
        console.error('Error sending email:', err);
    }
};

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const otp = generateOTP();
        console.log(otp);
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, otp });
        await newUser.save();
        const check = await sendEmail(email, otp);
        console.log(check);

        return res.status(200).json({ message: 'User registered successfully. Please check your email for OTP.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to verify OTP and add extra information
app.post('/verify', async (req, res) => {
    try {
        const { email, otp, location, age, workDetails } = req.body;
        const user = await User.findOne({ email, otp });
        if (!user) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Update user with extra information
        user.location = location;
        user.age = age;
        user.workDetails = workDetails;
        await user.save();

        return res.status(200).json({ message: 'User verified and extra information saved successfully.', user: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.post('/login', async (req, res) => {

    const { email, password } = req.body;
    try {
        const user = await User.find({ email: email });
        // console.log(user[0].password);
        // console.log(user[0]);
        if (user) {
            const passMatch = bcrypt.compareSync(password, user[0].password);

            if (passMatch) {           // process.env.jwtsecret    
                jwt.sign({ email: user[0].email, id: user[0]._id }, process.env.JWT_SECRET, (err, token) => {
                    if (err)
                        throw err;
                    res.json({ user, message: "login successful", authToken: token, success: true }).status(200);
                })
            }
            else {
                res.json({ message: 'Invalid Password', success: false }).status(401);
            }
        }
        else {
            res.json({ message: 'Invalid Email', success: false }).status(401);
        }
    }
    catch (err) {
        throw err;
    }
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.userEmail = decoded.email;
        next();
    });
}


// API endpoint to retrieve user information after login
app.get('/user', verifyToken, async (req, res) => {
    try {
        const userEmail = req.userEmail;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const port = process.env.PORT || 5000;

app.listen(port, () => { console.log(`app is listening on port ${port}`) });
