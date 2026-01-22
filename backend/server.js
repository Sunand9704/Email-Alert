// Backend updated to support tempEmail, primaryEmail, and alertDate
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Email = require('./models/Email');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Variables
const PORT = process.env.PORT || 8000;

// Database Connection
mongoose
    .connect("mongodb+srv://hosannaking2019_db_user:KSLPT7LuGynb17Ae@cluster0.2hev2lt.mongodb.net/?appName=Cluster0")
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Cron Job: Run every minute to check for alerts due
cron.schedule('* * * * *', async () => {
    console.log('Checking for due email alerts...');
    try {
        const now = new Date();

        // Find emails where alertDate is less than or equal to now
        const pendingEmails = await Email.find({
            alertDate: { $lte: now },
            notificationSent: false,
        });

        if (pendingEmails.length === 0) {
            return;
        }

        for (const emailDoc of pendingEmails) {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: emailDoc.primaryEmail,
                subject: 'Email Revocation Alert',
                html: `
                    <h3>Email Revocation Notification</h3>
                    <p>Your mail is revoked: <strong>${emailDoc.tempEmail}</strong></p>
                `,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Alert sent to ${emailDoc.primaryEmail} for temp email: ${emailDoc.tempEmail}`);

                // Remove the email from the list after sending the alert
                await Email.findByIdAndDelete(emailDoc._id);
            } catch (err) {
                console.error(`Failed to send alert to ${emailDoc.primaryEmail}:`, err);
            }
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

// Routes

// 1. Fetch all stored emails
app.get('/api/emails', async (req, res) => {
    try {
        const emails = await Email.find().sort({ alertDate: 1 });
        res.json(emails);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching emails', error: error.message });
    }
});

// 2. Add a new email alert
app.post('/api/emails', async (req, res) => {
    try {
        const { tempEmail, primaryEmail, alertDate } = req.body;

        if (!tempEmail || !primaryEmail || !alertDate) {
            return res.status(400).json({ message: 'All fields (tempEmail, primaryEmail, alertDate) are required' });
        }

        const newEmail = new Email({
            tempEmail,
            primaryEmail,
            alertDate: new Date(alertDate)
        });
        await newEmail.save();

        res.status(201).json({ message: 'Email alert scheduled successfully', email: newEmail });
    } catch (error) {
        res.status(500).json({ message: 'Error scheduling alert', error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
