const jwt = require ('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'shh'

module.exports = (req, res, next) => {
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */


  const token = req.headers.authorization

  if (!token) {
    res.status(401).json({
      message: 'Authorization Token Required'
    })
  } else {
    jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
      if(error) {
        res.status(401).json({
          message: 'Authorization Token Invalid'
        })
      } else {
        req.decodedToken = decodedToken
        next()
      }
    })
  }
};
