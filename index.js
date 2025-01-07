const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();
const captchaRoutes = require('./routes/captcha');
const authRoutes = require('./routes/auth');
require('./db');


const app = express();

app.use(cors({
	origin: true,
	credentials: true
}));
app.use(session({
  secret: 'test_work_for_fullstack',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 5 * 60 * 1000
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/captcha', captchaRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app