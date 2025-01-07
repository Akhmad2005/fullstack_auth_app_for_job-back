const express = require('express');
const router = express.Router();
const connection = require('../db') 
const {emailRegex, passwordRegex} = require('../utilities/regexes') 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const captchaMiddleware = require('../utilities/middlewares/captcha')

router.post('/signup', captchaMiddleware, async (req, res) => {
  try {
		const { email, password } = req.body;
		if (!email) {
			res.status(400).json({ status: false, error: 'email_not_provided' });
		} else if (!password) {
			res.status(400).json({ status: false, error: 'password_not_provided' });
		} else if (!emailRegex.test(email)) {
			res.status(400).json({ status: false, error: 'invalid_email' });
		} else if (!passwordRegex.test(password)) {
			res.status(400).json({ status: false, error: 'invalid_password' });
		} else {
			const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
			
			const hashedPassword = await bcrypt.hash(password, 10);
			await connection.execute(sql, [email, hashedPassword]);

    	res.status(200).json({ status: true, message: 'User created successfully!' });
		}
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'server_error', message: 'Internal server error' });
  }
});

router.post('/login', captchaMiddleware, async (req, res) => {
  try {
		const { email, password } = req.body;
		if (!email) {
			res.status(400).json({ status: false, error: 'email_not_provided' });
		} else if (!password) {
			res.status(400).json({ status: false, error: 'password_not_provided' });
		} else if (!emailRegex.test(email)) {
			res.status(400).json({ status: false, error: 'invalid_email' });
		} else {
			const sql = 'SELECT * FROM users WHERE email = ?';
			
			const [results] = await connection.execute(sql, [email]);

			if (results.length === 0) {
				return res.status(400).json({ status: false, error: 'invalid_credentials', message: 'Incorrect credentials' });
			}

			const user = results[0];

			const passwordMatch = await bcrypt.compare(password, user.password);

			if (!passwordMatch) {
				return res.status(401).json({ status: false, error: 'invalid_credentials', message: 'Incorrect credentials' });
			}

			const token = jwt.sign(
				{
					id: user.id,
					email: user.email,
				},
				process.env.JWT_SECRET,
				{ expiresIn: '1w' }
			);

			return res.status(200).json({
				status: true,
				message: 'Login successful',
				token,
			});
		}
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'server_error', message: 'Internal server error' });
  }
});

router.post('/email-available', async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			res.status(400).json({ status: false, error: 'email_not_provided' });
		} else {
			const sql = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';

			connection.execute(sql, [email])
			.then(([result]) => {
				const isEmailTaken = result[0].count;

				if (isEmailTaken) {
					res.status(200).json({ status: false, message: 'email_taken' });
				} else {
					res.status(200).json({ status: true, message: 'email_available' });
				}
			})
			.catch(err => {
				console.error('Database error:', err);
				res.status(500).json({ status: false, error: 'database_error' });
			});
		}
	} catch (error) {
		console.error('Error:', error);
    res.status(500).json({ status: false, error: 'server_error' });
	}
})

module.exports = router;