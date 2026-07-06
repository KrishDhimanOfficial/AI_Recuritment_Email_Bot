import Tokens from 'csrf';
import config from '../config/config.js';

const tokens = new Tokens();

export const csrfMiddleware = (req, res, next) => {
  // Bearer-token API calls are not vulnerable to browser cookie CSRF because
  // the Authorization header is supplied explicitly by trusted application code.
  const authorization = req.headers.authorization || '';
  const hasBearerToken = authorization.startsWith('Bearer ');

  // 1. Get or create a secret
  let secret = req.cookies.csrfSecret;
  if (!secret) {
    secret = tokens.secretSync();
    // Set the secret as an HttpOnly cookie so it cannot be accessed by JS
    res.cookie('csrfSecret', secret, {
      httpOnly: true,
      secure: config.isProd,
      sameSite: 'strict',
      path: '/'
    });
  }

  // 2. Generate a token if the XSRF-TOKEN cookie is missing.
  // We avoid generating a new token on every request to prevent race conditions.
  if (!req.cookies['XSRF-TOKEN']) {
    const token = tokens.create(secret);
    // Set the token as a non-HttpOnly cookie so Axios can read it automatically
    res.cookie('XSRF-TOKEN', token, {
      secure: config.isProd,
      sameSite: 'strict',
      path: '/'
    });
  }

  // 3. Verify the token on state-changing cookie-based requests
  if (!hasBearerToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const tokenFromHeader = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];

    if (!tokenFromHeader || !tokens.verify(secret, tokenFromHeader)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or missing CSRF token'
      });
    }
  }

  next();
};
