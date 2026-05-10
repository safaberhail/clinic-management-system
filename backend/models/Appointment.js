const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    patientName: String,
    date: Date,
    time: String,
    status: { type: String, default: 'Scheduled' } // Scheduled, Completed, Cancelled
});

module.exports = mongoose.model('Appointment', AppointmentSchema);