const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <--- تأكد من هذا
require('dotenv').config();

const app = express();

app.use(cors()); // <--- يسمح للـ Frontend بالاتصال
app.use(express.json()); // <--- يسمح للسيرفر بقراءة بيانات JSON المرسلة

// الربط مع المجلدات
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.log("❌ DB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));