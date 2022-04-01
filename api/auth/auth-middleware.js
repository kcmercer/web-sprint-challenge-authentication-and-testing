const Users = require('../users/users-model')

const usernameFree = async (req, res, next) => {
  try {
    const [user] = await Users.getBy({
      username: req.body.username
    })

    if (user) {
      res.status(422).json({
        message: 'This username is already taken'
      })
    } else {
      req.user = user
      next()
    }
  }

  catch(error) {
    next(error)
  }
}

const usernameValid = async (req, res, next) => {
  try {
    const [user] = await Users.getBy({
      username: req.body.username
    })

    if (!user) {
      res.status(422).json({
        message: 'This username is invalid'
      })
    } else {
      req.user = user
      next()
    }
  }

  catch(error) {
    next(error)
  }
}

const inputValid = async (req, res, next) => {
  const { username, password } = req.body

  if(!username || !password || !username.trim() || !password.trim()) {
    res.status(422).json({
      message: 'Username and password are required'
    })
  } else {
    next()
  }
}

module.exports = { usernameFree, usernameValid, inputValid }