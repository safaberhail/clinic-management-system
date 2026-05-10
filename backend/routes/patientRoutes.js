const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// 1. جلب كل المرضى
router.get('/', async (req, res) => {
    try { res.json(await Patient.find()); } 
    catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. إضافة مريض جديد (المطلب 3.3)
router.post('/add', async (req, res) => {
    try {
        const newPatient = new Patient(req.body);
        res.status(201).json(await newPatient.save());
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 3. إضافة سجل طبي/استشارة (المطلب 3.1)
router.post('/:id/records', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        patient.records.push(req.body); // إضافة الاستشارة والوصفة والملخص
        await patient.save();
        res.json(patient);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 4. حذف مريض
router.delete('/:id', async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;