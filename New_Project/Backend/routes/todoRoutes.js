const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// POST /submittodoitem - Create a new todo item
router.post('/submittodoitem', async (req, res) => {
    try {
        const { itemName, itemDescription } = req.body;
        
        // Validate input
        if (!itemName || itemName.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Item name is required' 
            });
        }
        
        // Create new todo document
        const newTodo = new Todo({
            itemName: itemName.trim(),
            itemDescription: itemDescription ? itemDescription.trim() : ''
        });
        
        // Save to database
        const savedTodo = await newTodo.save();
        
        // Send success response
        res.status(201).json({
            success: true,
            message: 'Todo item created successfully',
            data: savedTodo
        });
        
    } catch (error) {
        console.error('Error saving todo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Could not save todo item.',
            error: error.message 
        });
    }
});

// GET /gettodos - Fetch all todo items (optional - for displaying tasks)
router.get('/gettodos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: todos
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching todos',
            error: error.message 
        });
    }
});

// DELETE /deletetodo/:id - Delete a todo item (optional)
router.delete('/deletetodo/:id', async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
        
        if (!deletedTodo) {
            return res.status(404).json({
                success: false,
                message: 'Todo item not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Todo item deleted successfully',
            data: deletedTodo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting todo',
            error: error.message
        });
    }
});

module.exports = router;