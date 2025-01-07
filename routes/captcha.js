const express = require('express');
const router = express.Router();
const { CaptchaGenerator } = require('captcha-canvas');
const captchaMiddleware = require('../utilities/middlewares/captcha')

function generateCustomText(length) {
  const allowedCharacters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allowedCharacters.length);
    text += allowedCharacters[randomIndex];
  }
  return text;
}

router.get('/create', async (req, res) => {
  const captcha = new CaptchaGenerator()
    .setDimension(60, 170)
    .setCaptcha({ 
      text: generateCustomText(6),
      characters: 6, 
      color: '#1677ff',  
    })
		.setTrace({color: '#1677ff'})
	const captchaImage = await captcha.generate();;
  req.session.captcha = captcha.text;
  req.session.captchaTimestamp = Date.now();
  res.setHeader('Content-Type', 'image/png');
  res.send(captchaImage);
});

router.post('/verify', captchaMiddleware, (req, res) => {
  res.status(200).json({ status: true, });
});

module.exports = router;