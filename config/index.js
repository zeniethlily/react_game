const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')

app.use(express.static(path.join(__dirname, './../client/src')))

app.use(cors())

module.exports = app