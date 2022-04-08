const express = require('express')

const app = express()
const port = process.env.PORT
require('./db/mongoose')


app.use(express.json()) //to parse the incoming Data into json data

const userRouter = require('./routes/users')
app.use(userRouter)
const taskRouter = require('./routes/tasks')
app.use(taskRouter)

app.listen(port, () => {
    console.log("server is up on " + port)
})



