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
                user: 't.guptacool1909@gmail.com',
                pass: 'hdquiboomzjchpiz',
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
        // const existingUser = await User.findOne({ email });
        // if (existingUser) {
        //     return res.status(400).json({ error: 'User already exists' });
        // }

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

})




app.post('/login', async (req, res) => {

    const { email, password } = req.body;
    try {
        const user = await Users.find({ email: email });
        // console.log(user[0].password);
        if (user) {
            const passMatch = bcrypt.compareSync(password, user[0].password);
            //  console.log(passMatch)
            // console.log(user[0].email, user[0]._id);
            if (passMatch) {           // process.env.jwtsecret    
                jwt.sign({ email: user[0].email, id: user[0]._id }, privateKey, { algorithm: 'RS256' }, (err, token) => {
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



const port = process.env.PORT || 5000;

app.listen(port, () => { console.log(`app is listening on port ${port}`) });
