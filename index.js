const express = require('express');
const connectDB = require('./db');
// const Users = require('./Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const dotenv = require("dotenv").config();


const app = express();

app.use(express.json());
connectDB();

const bcryptSalt = bcrypt.genSaltSync(10);


const port = process.env.PORT || 5000;

app.listen(port, () => { console.log(`app is listening on port ${port}`) });
