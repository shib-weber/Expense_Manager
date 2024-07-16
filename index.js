const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const userRouter = require('./routes/user')

const app = express();
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static(path.join(__dirname, './public')))

const MongoURI= process.env.MONGODB_URI;

mongoose.connect(MongoURI, {

  }).then(console.log("database connected"))

app.set('view engine', 'ejs')
app.set('views', path.resolve('./views'))

app.use(userRouter);

const PORT = 8001 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`)
})