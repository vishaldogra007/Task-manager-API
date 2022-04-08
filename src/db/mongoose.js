const mongoose = require('mongoose')

const connectionUrl = process.env.database_url
mongoose.connect( connectionUrl , { useNewUrlParser : true },()=>{
    console.log("sucessfully connected to the database")
})




