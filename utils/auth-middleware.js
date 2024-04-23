const jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken#readme

// verify JSON web token (JWT)
// FORMAT OF TOKEN: `Authorization: Bearer <access_token>`
exports.verifyToken = (req, res, next) => {
  // get auth header value
  const authHeader = req.headers.authorization;

  // if no authHeader: forbidden
  if (typeof authHeader === 'undefined')
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });

  // if bearer is not undefined: get token
  // eslint-disable-next-line prefer-destructuring
  const token = authHeader.split(' ')[1];
  // console.log('token', token);

  jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
    // if err: forbidden
    if (err)
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: err,
      });

    // if no error: set authData
    req.authData = authData;
    next();
  });
};
