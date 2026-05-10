const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: String,
    birthDate: Date,
    gender: String,
    medicalHistory: {
        allergies: { type: String, default: "None" }, // مثال: Penicillin
        surgeries: String,
        obstetricHistory: String // Gynecological history
    },
    vitals: {
        weight: Number,
        height: Number,
        bloodPressure: String
    },
    records: [{
        date: { type: Date, default: Date.now },
        consultationDetails: String,
        prescription: [{ 
            medication: String, 
            dose: String, 
            duration: String 
        }],
        treatmentSummary: String,
        certificateRequested: { type: Boolean, default: false }
    }]
});

module.exports = mongoose.model('Patient', PatientSchema);