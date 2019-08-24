// const bcrypt = require('bcryptjs');

// const Users = require('./users/users-model.js');

module.exports = (req, res, next) => {
  if (req.session && (req.session.loggedin === true)) {
    console.log('you pass through the gate safely')
    next()
  } else {
    res.status(400).json({ message: "Stop! Who approaches the Bridge of Death must answer me these questions three, 'ere the other side he see." })
  }
}