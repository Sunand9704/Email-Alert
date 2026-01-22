const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    tempEmail: {
        type: String,
        required: true,
    },
    primaryEmail: {
        type: String,
        required: true,
    },
    alertDate: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    notificationSent: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Email', emailSchema);
