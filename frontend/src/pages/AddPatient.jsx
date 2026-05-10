import { useState } from 'react';
import axios from 'axios';

export default function AddPatient() {
    const [patient, setPatient] = useState({ fullName: '', phone: '', allergies: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/api/patients', patient);
        alert("تمت إضافة المريض بنجاح");
    };

    return (
        <div className="p-8 bg-gray-50 h-full">
            <h2 className="text-2xl font-bold mb-6 text-blue-800">إضافة مريض جديد</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-lg">
                <input className="w-full border p-2 mb-4 rounded" placeholder="الاسم الكامل" 
                    onChange={(e) => setPatient({...patient, fullName: e.target.value})} />
                <input className="w-full border p-2 mb-4 rounded" placeholder="رقم الهاتف" 
                    onChange={(e) => setPatient({...patient, phone: e.target.value})} />
                <textarea className="w-full border p-2 mb-4 rounded" placeholder="الحساسية (مثلاً: بنسلين)" 
                    onChange={(e) => setPatient({...patient, allergies: e.target.value})} />
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">حفظ البيانات</button>
            </form>
        </div>
    );
}