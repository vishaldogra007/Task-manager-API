const express = require('express')
const { findById } = require('../models/user')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const Task = require('../models/tasks')
const sharp = require('sharp')

//library to upload files
const multer = require('multer')
const upload = multer({
    
    limits: {
        fileSize : 1000000
    },
    fileFilter(req, file , cb){
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)){
            return cb(new Error("please upload png , jpeg or jpg file"))
        }
        cb(undefined , true)
    }
})


router.post('/users', async (req, res) => {
    const user = new User(req.body)
    // user.save().then(()=>{
    //     console.log(user)

    //     res.status(201).send(user)
    // }).catch((error)=>{
    //     res.staus(400).send(error)
    // })
    try {
        // await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })

    } catch (e) {
        res.status(400).send(e)
    }


})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })

    } catch (e) {
        res.status(500).send(e)
    }
})

//logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//logout of all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }


})

router.get('/users/me', auth, async (req, res) => {
    // User.find({}).then((users)=>{   //find({}) it will return all the documetns in a collection
    //     res.status(200).send(users)
    // }).catch((error)=>{
    //     res.status(500).send(error)
    // })
    // try {
    //     const users = await User.find({})
    //     res.send(users)
    // } catch (e) {
    //     res.status(404).send("Users not found")

    // }

    res.send(req.user)
})




// router.get('/users/:id', async (req, res) => {

//     // User.findById( req.params.id ).then((user)=>{
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }
//     //     res.status(201).send(user)
//     // }).catch((e)=>{
//     //     res.status(500).send()
//     // })
//     try {
//         const user = await User.findById(req.params.id)
//         if (!user) {
//             res.status(404).send("No user found")
//         } else {
//             res.send(user)
//         }
//     } catch (e) {
//         res.status(400).send(e)
//     }

// })






router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidUpdate = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidUpdate) {
        return res.status(400).send("inavlid update")
    }
    try {
        // const user = await User.findById(req.user._id)
        //   const user = await User.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators : true})
        updates.forEach((update) =>
            req.user[update] = req.body[update]
        )
        await req.user.save()
        // if(!user){
        //     return res.status(404).send("No user found")
        // }
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }

})


router.delete('/users/me', auth, async (req, res) => {
    try {
        // const task = await Task.find({owner : req.user._id})
        //  await Task.deleteMany({owner : req.user._id})

        // or
        // we can use the middleware pre to remoe all the tasks ralted to the user

        //  const user = await User.findByIdAndDelete(req.user._id)
        //  if(!user){
        //      return res.status(400).send("User not found")
        //  }
        //  res.send(user)
        //   or 
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }

})


//image upload
router.post('/users/me/upload', auth , upload.single('upload') , async (req,res)=>{
   const buffer= await sharp(req.file.buffer).resize({height : 250 , width : 250}).png().toBuffer()
   req.user.uploads = buffer
   await req.user.save()
    res.send()
},(error ,req,res,next)=>{
    res.status(404).send({error : error.message})
})

//delete image

router.delete('/users/me/upload' , auth , async (req,res)=>{
   
    req.user.uploads = undefined
    await req.user.save()
    res.status(200).send()
    
})

//fetching the user id

router.get('/users/:id/upload' , async(req,res)=>{
    try{
        const user = await User.findById({_id : req.params.id})
        if(!user || user.uploads === undefined){
           throw new Error("no data found")
        }
        // res.set('Content-type' , 'image/png')

        
       res.send(user.uploads)
    }catch(e){
        res.status(404).send(e)

    }
})

module.exports = router