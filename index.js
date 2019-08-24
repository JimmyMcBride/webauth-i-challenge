const express = require('express')
const helmet = require('helmet')
const cors = require('cors')

const bcrypt = require('bcryptjs')

const db = require('./database/dbConfig.js')
const Users = require('./users/users-model.js')

const server = express()

server.use(helmet())
server.use(express.json())
server.use(cors())

server.get('/', (req, res) => {
  res.send("The database is live!")
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
  let { username } = req.headers
  res.status(200).json({ message: `Welcome ${user.username}!` })
})

server.get('/api/users', validate, (req, res) => {

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
        res.status(401).json({message: "Invalid credentials"})
      }
    })
    .catch(err => {
      res.status(500).json({message:"unexpected error"})
    })
  } else {
    res.status(400).json({message:"no credentials provided"})
  }
}

const port = process.env.PORT || 5000
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`))