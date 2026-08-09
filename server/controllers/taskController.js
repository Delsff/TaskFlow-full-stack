const Task = require('../models/Task');

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({user: req.user._id}).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tasks', error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, priority, status, dueDate, userId } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Task name is required.' });
    }
    const newTask = await Task.create({
      title,
      priority: priority || 'MEDIUM',
      status: status || 'pending',
      dueDate,
      user: req.user._id,
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if(!task) {
      return res.status(404).json({message: 'Task not found'})
    }
    if(task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({message: 'You do not have permission to modify this task.'})
    }
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id)
    if(!task) {
      return res.status(404).json({message: 'Task not found'})
    }
    if(task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({message: 'You do not have permission to delete this task.'})
    }
    await task.deleteOne()
    res.status(200).json({ message: 'The task has been successfully deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
