const express = require('express')
const router = new express.Router()
const Task = require('../models/tasks')

const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    // task.save().then(()=>{
    //     console.log(task)
    //     res.status(201).send(task)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body, //copies all the properties form body to this object
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


router.get('/tasks', auth, async (req, res) => {
    const match = {}
    if (req.query.completed !== undefined) {
        match.completed = req.query.completed
    }
    //   const pagi ={}

    //   if(req.query.limit !== undefined){
    //       pagi.limit = req.query.limit
    //   }
   const sort = {}
   if(req.query.sortby){
       const parts = req.query.sortby.split(':')
       sort[parts[0]] = parts[1]
   }

    try {
        const tasks = await Task.find({
            owner: req.user._id, ...match
        },
            null,
            {
                limit: req.query.limit,
                skip: req.query.skip,
                sort
            }
        )
        if (!tasks) {
            return res.status(404).send("No Task found")
        }
        res.send(tasks)

    } catch (e) {
        res.status(400).send(e)
    }

    // Task.find({}).then((tasks)=>{
    //     if(!tasks){
    //         return res.status(404).send("no tasks found")
    //     }
    //     res.status(201).send(tasks)

    // }).catch((e)=>{
    //     res.status(404).send(e)
    // })

    // try {
    //     if (req.query.completed !== undefined) {


    //         const tasks = await Task.find({ owner: req.user._id, completed: req.query.completed })

    //         if (!tasks) {
    //             return res.status(404).send("No Task found")
    //         }
    //         res.send(tasks)
    //     } else {
    //         const tasks = await Task.find({ owner: req.user._id })
    //         if (!tasks) {
    //             return res.status(404).send("No Task found")
    //         }
    //         res.send(tasks)

    //     }

})

router.get('/tasks/:id', auth, async (req, res) => {
    // Task.findById(req.params.id).then((task)=>{
    //     res.status(201).send(task)
    // }).catch((e)=>{
    //     res.status(500).send(e)
    // })
    try {
        const task = await Task.findById(req.params.id)
        if (!task) {
            return res.status(404).send("No task found")
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidUpdate = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidUpdate) {
        return res.status(404).send("invalid update")
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        // const task = await Task.findById(req.params.id)
        // const task = await Task.findByIdAndUpdate(req.params.id , req.body , {new : true , runValidators : true})
        if (!task) {
            return res.status(404).send("No task found")
        }
        updates.forEach((update) => {
            return task[update] = req.body[update]
        })
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send("no task found")
        }
        // await task.remove()
        // await task.save()
        res.send(task)

    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router