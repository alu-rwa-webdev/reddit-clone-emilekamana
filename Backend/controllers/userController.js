const _ = require('lodash');
const taskModel = require('../models/user')
// const data = require('../data/tasks')

// Display list of all tasks
exports.list_tasks = async (req, res) => {
    console.log('listing')
    const tasks = await taskModel.find({});
    try {
        res.send({tasks: tasks});
      } catch (error) {
        res.status(500).send(error);
      }
};

// create a new task
exports.create_task = async (req, res) => {
    const task = new taskModel(req.body);
  
    try {
      await task.save();
      res.status(201).send(task);
    } catch(error) {
      res.status(500).send(error);
    }
};

// Delete a task
exports.delete_task = async (req,res) =>{
    try{
        const taskId = req.params.taskId
        await taskModel.deleteOne({_id: taskId});
        res.status(204).send("Deleted");
    }catch(error){
        res.status(500).send(error);
    }
}

// retrieve a task by ID
exports.retrieve_task = async (req, res) => {
  try {
      const taskId = req.params.taskId
      const task = await taskModel.findOne({ _id: taskId });  
      if( task != null)
      res.send(task);
      else
      res.status(404).send({error: "There is no task at that id"})
  } catch (error) {
    res.status(500).send(error);
  }
};

// update a task by ID
exports.update_task = async (req, res) => {
    try {
        const taskId = req.params.taskId
        const { title, is_completed } = req.body
        const task= await taskModel.findOneAndUpdate({_id:taskId},{$set: {title: title, is_completed: is_completed}})
        if (task != null)
        res.send("Updated");
        else
        res.status(404).send({error: "There is no task at that id"})
    } catch (error) {
      res.status(500).send(error);
    }
  };