const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('Current working directory:', process.cwd());
console.log('Loading .env from:', path.resolve(__dirname, '.env'));
console.log('PORT from .env:', process.env.PORT);
console.log('MONGO_URI from .env:', process.env.MONGO_URI);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Email = require('./models/Email');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// const MONGO_URI = "mongodb+srv://sunandvemavarapu_db_user:RuNL2Xg0onlWLFg9@cluster0.zcp5b9u.mongodb.net/";
mongoose
    .connect("mongodb+srv://sunandvemavarapu_db_user:RuNL2Xg0onlWLFg9@cluster0.zcp5b9u.mongodb.net/")
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes

// 1. Fetch all stored emails
app.get('/api/emails', async (req, res) => {
    try {
        const emails = await Email.find().sort({ createdAt: -1 });
        res.json(emails);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching emails', error: error.message });
    }
});

// 2. Add a new email
app.post('/api/emails', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check total count
        const count = await Email.countDocuments();
        if (count >= 3) {
            return res.status(400).json({ message: 'Email limit reached (Max 3 allowed)' });
        }

        const newEmail = new Email({ email });
        await newEmail.save();

        res.status(201).json({ message: 'Email added successfully', email: newEmail });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Error adding email', error: error.message });
    }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
