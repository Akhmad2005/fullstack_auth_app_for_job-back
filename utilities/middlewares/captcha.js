const captchaMiddleware = (req, res, next) => {
  const { captchaInput } = req.body;
	const { captcha, captchaTimestamp } = req.session;

  if (!captchaInput) {
    return res.status(400).json({ status: false, error: 'captcha_not_provided' });
  }

  if (!captcha || !captchaTimestamp) {
    return res.status(400).json({ status: false, error: 'renew_captcha', message: 'No captcha or captcha timestamp in session' });
  }

  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;

  if (now - captchaTimestamp > FIVE_MINUTES) {
    return res.status(400).json({ status: false, error: 'renew_captcha' });
  }

  if (captchaInput === captcha) {
    next();
  } else {
    return res.status(400).json({ status: false, error: 'incorrect_captcha' });
  }
};

module.exports = captchaMiddleware;