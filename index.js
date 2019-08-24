const express = require('express')
const session = require('express-session')
const knexSessionStore = require('connect-session-knex')(session)

const helmet = require('helmet')
const cors = require('cors')

const bcrypt = require('bcryptjs')

const Users = require('./users/users-model.js')
const restricted = require('./restricted-middleware.js')

const sessionOptions = {
  name: 'mycokkie',
  secret: 'cookiesareyumyummewantcookies',
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false,
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: false,
  store: new knexSessionStore({
    knex: require('./database/dbConfig.js'),
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 60
  })
}

const server = express()

server.use(helmet())
server.use(express.json())
server.use(cors())
server.use(session(sessionOptions))

server.get('/', (req, res) => {
  res.send("The database is live! 🚀")
})

server.delete('api/logout', (req, res) => {
  console.log(req.session)
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(400).json({ message: 'you cannot leave this place...' })
      } else {
        res.json({ message: 'Elvis has left the building' })
      }
    })
  } else {
    res.status(500).json({ message: 'internal server error' })
  }
})

server.post('/api/register', (req, res) => {
  let user = req.body
  const hash = bcrypt.hashSync(user.password, 10)
  user.password = hash

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved)
    })
    .catch(error => {
      res.status(500).json(error)
    })
})

server.post('/api/login', validate, (req, res) => {
  let { username, password } = req.headers

  req.session.loggedin = false

  Users.findBy({ username })
  .first()
  .then(user => {
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.loggedin = true;
      res.status(200).json({message: `Welcome ${username}! 🔥`,})
    } else {
      res.status(401).json({ message: 'Nice try. But, no. Try. Try again.' })
    }
  })
  .catch(error => {
    res.status(500).json(error)
  })
})

server.get('/api/users', restricted, (req, res) => {

  Users.find()
    .then(users => {
      res.json(users)
    })
    .catch(err => res.send(err))
})

function validate(req, res, next) {
  const {username, password} = req.headers
  if (username && password) {
    Users.findBy({username})
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        next()
      } else {
        res.status(401).json({message: "You shall not pass 🛑"})
      }
    })
    .catch(err => {
      res.status(500).json({message:"unexpected error 🤷‍"})
    })
  } else {
    res.status(400).json({message:"no credentials provided 🤥"})
  }
}

const port = process.env.PORT || 5000
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`))