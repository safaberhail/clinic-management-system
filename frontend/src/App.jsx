import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Users, Calendar, Plus, Save, X, 
  Activity, Clipboard, Pill, FileText, Trash2, Search, Clock, Download, TrendingUp, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // --- نظام الأدوية المتعددة ---
  const [consultation, setConsultation] = useState({ details: '', summary: '', cert: false });
  const [currentMed, setCurrentMed] = useState({ medication: '', dose: '', duration: '' });
  const [prescriptionList, setPrescriptionList] = useState([]);

  const [newPatient, setNewPatient] = useState({
    fullName: '', phone: '', medicalHistory: { allergies: '', surgeries: '' }, vitals: { weight: '', height: '' }
  });

  const chartData = [
    { day: 'Mon', visits: 4 }, { day: 'Tue', visits: 7 }, { day: 'Wed', visits: 5 },
    { day: 'Thu', visits: 10 }, { day: 'Fri', visits: 14 }, { day: 'Sat', visits: 6 },
  ];

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_URL}/patients`);
      setPatients(res.data);
    } catch (err) { console.error("Server Error"); }
  };

  useEffect(() => { fetchPatients(); }, []);

  // وظيفة إضافة دواء للقائمة المؤقتة
  const addMedicationToList = () => {
    if (!currentMed.medication) return alert("Please enter medication name");
    setPrescriptionList([...prescriptionList, currentMed]);
    setCurrentMed({ medication: '', dose: '', duration: '' }); // تصغير الحقول بعد الإضافة
  };

  // وظيفة حذف دواء من القائمة المؤقتة
  const removeMedFromList = (index) => {
    setPrescriptionList(prescriptionList.filter((_, i) => i !== index));
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return alert("Select patient first");
    if (prescriptionList.length === 0) return alert("Please add at least one medication");
    
    try {
      const recordObj = {
        consultationDetails: consultation.details,
        treatmentSummary: consultation.summary,
        prescription: prescriptionList, // إرسال القائمة كاملة
        certificateRequested: consultation.cert
      };
      await axios.post(`${API_URL}/patients/${selectedPatient._id}/records`, recordObj);
      alert("Consultation and Multiple Medications Saved!");
      fetchPatients();
      setConsultation({ details: '', summary: '', cert: false });
      setPrescriptionList([]);
    } catch (err) { alert("Save failed."); }
  };

  const generatePDF = (patient, record) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(2, 132, 199);
      doc.text("CLINIC PRO - PRESCRIPTION", 105, 20, { align: 'center' });
      
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text("Professional Medical Center - Phone: +213 000 000", 105, 27, { align: 'center' });
      doc.line(20, 32, 190, 32);

      doc.setFontSize(12); doc.setTextColor(0);
      doc.text(`Patient: ${patient?.fullName || 'N/A'}`, 20, 45);
      doc.text(`Date: ${new Date(record.date).toLocaleDateString()}`, 150, 45);

      const tableBody = record.prescription.map(p => [p.medication, p.dose, p.duration]);

      autoTable(doc, {
        startY: 55,
        head: [['Medication', 'Dosage', 'Duration']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [2, 132, 199] },
      });

      const finalY = doc.lastAutoTable.finalY || 70;
      doc.text("Doctor's Notes:", 20, finalY + 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(record.treatmentSummary || "Regular follow-up.", 20, finalY + 22);

      doc.save(`Prescription_${patient.fullName}.pdf`);
    } catch (error) { alert("PDF Error"); }
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm("Delete patient?")) {
      await axios.delete(`${API_URL}/patients/${id}`);
      setPatients(patients.filter(p => p._id !== id));
    }
  };

  const handleAddPatient = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/patients/add`, newPatient).then(() => {
      setShowModal(false);
      fetchPatients();
      alert("Patient Registered!");
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden" dir="ltr">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-30">
        <div className="p-8 text-2xl font-black border-b border-slate-800 italic">✚ CLINIC Pro</div>
        <nav className="p-4 space-y-2 mt-6 flex-1 text-left">
          <MenuBtn icon={<LayoutDashboard/>} label="Dashboard" active={activeTab==='dashboard'} onClick={()=>setActiveTab('dashboard')}/>
          <MenuBtn icon={<Users/>} label="Patients Database" active={activeTab==='patients'} onClick={()=>setActiveTab('patients')}/>
          <MenuBtn icon={<Clipboard/>} label="Medical Records" active={activeTab==='records'} onClick={()=>setActiveTab('records')}/>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-10 animate-in fade-in">
        <header className="flex justify-between items-center mb-10 text-left">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight capitalize italic">{activeTab}</h1>
          <div className="bg-white p-3 rounded-2xl shadow-sm border flex items-center gap-3">
            <Clock size={18} className="text-blue-600"/>
            <span className="font-bold">{new Date().toLocaleTimeString()}</span>
          </div>
        </header>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard title="Total Patients" value={patients.length} color="bg-blue-600" icon={<Users/>}/>
              <StatCard title="Visits Today" value="12" color="bg-indigo-600" icon={<Activity/>}/>
              <StatCard title="Growth" value="+22%" color="bg-emerald-500" icon={<TrendingUp/>}/>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 min-h-[400px]">
               <h3 className="text-xl font-black mb-6 text-blue-600 italic text-left">Weekly Flow Analysis</h3>
               <div style={{ width: '100%', height: 300 }}>
                 <ResponsiveContainer>
                   <AreaChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} />
                     <YAxis axisLine={false} tickLine={false} />
                     <Tooltip />
                     <Area type="monotone" dataKey="visits" stroke="#2563eb" fill="#dbeafe" strokeWidth={3} />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {/* PATIENTS LIST */}
        {activeTab === 'patients' && (
           <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-in">
              <div className="p-8 border-b flex justify-between items-center bg-white">
                 <h2 className="text-2xl font-black text-slate-800 uppercase italic">Patients Archive</h2>
                 <button onClick={()=>setShowModal(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg"><Plus size={20}/> Add Patient</button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-400">
                  <tr><th className="p-6">Name</th><th className="p-6">Phone</th><th className="p-6 text-center">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {patients.map(p => (
                     <tr key={p._id} className="hover:bg-blue-50/50 transition-colors">
                       <td className="p-6 font-black text-slate-700">{p.fullName}</td>
                       <td className="p-6 font-bold text-slate-500">{p.phone}</td>
                       <td className="p-6 flex justify-center gap-3">
                          <button onClick={()=>{setSelectedPatient(p); setActiveTab('records');}} className="bg-blue-50 text-blue-600 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><FileText size={18}/></button>
                          <button onClick={()=>handleDeletePatient(p._id)} className="bg-rose-50 text-rose-600 p-3 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        )}

        {/* MEDICAL RECORDS - التعديل الجديد هنا */}
        {activeTab === 'records' && (
          <div className="space-y-8 animate-in fade-in text-left">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-xl">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block italic">Search Patient</label>
               <div className="relative">
                  <Search className="absolute left-4 top-4 text-slate-400" size={18}/>
                  <input type="text" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 font-bold"
                    placeholder="Search name..." value={searchTerm} 
                    onChange={(e)=>{setSearchTerm(e.target.value); setShowDropdown(true)}} />
                  {showDropdown && searchTerm && (
                    <div className="absolute z-40 w-full mt-2 bg-white border shadow-2xl rounded-2xl max-h-48 overflow-y-auto p-2">
                      {patients.filter(p=>p.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(p=>(
                        <div key={p._id} onClick={()=>{setSelectedPatient(p); setSearchTerm(p.fullName); setShowDropdown(false)}} className="p-4 hover:bg-blue-50 cursor-pointer rounded-xl font-bold border-b">
                          {p.fullName}
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            {selectedPatient && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in">
                 <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                    <h3 className="text-2xl font-black mb-8 border-b pb-4 italic">Consultation for: <span className="text-blue-600">{selectedPatient.fullName}</span></h3>
                    
                    {/* فورم الاستشارة */}
                    <div className="space-y-6">
                       <textarea className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold italic outline-none focus:ring-4 ring-blue-500/10" rows="3" placeholder="Consultation Details..." value={consultation.details} onChange={e=>setConsultation({...consultation, details: e.target.value})}></textarea>
                       
                       {/* نظام إضافة الأدوية المتعددة */}
                       <div className="bg-blue-50 p-6 rounded-[2rem] space-y-4">
                          <div className="text-[10px] font-black text-blue-600 uppercase italic">Add Medication to Prescription</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <input className="p-4 bg-white rounded-xl border-none font-bold text-sm" placeholder="Medication Name" value={currentMed.medication} onChange={e=>setCurrentMed({...currentMed, medication: e.target.value})} />
                             <input className="p-4 bg-white rounded-xl border-none font-bold text-sm" placeholder="Dose (e.g. 100mg)" value={currentMed.dose} onChange={e=>setCurrentMed({...currentMed, dose: e.target.value})} />
                             <div className="flex gap-2">
                                <input className="p-4 bg-white rounded-xl border-none font-bold text-sm flex-1" placeholder="Duration" value={currentMed.duration} onChange={e=>setCurrentMed({...currentMed, duration: e.target.value})} />
                                <button type="button" onClick={addMedicationToList} className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg"><Plus size={20}/></button>
                             </div>
                          </div>

                          {/* عرض قائمة الأدوية المضافة حالياً */}
                          {prescriptionList.length > 0 && (
                            <div className="mt-4 space-y-2">
                               {prescriptionList.map((m, idx) => (
                                 <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border-l-4 border-blue-500 animate-in fade-in">
                                    <span className="font-bold text-xs">{m.medication} - {m.dose} ({m.duration})</span>
                                    <button onClick={()=>removeMedFromList(idx)} className="text-rose-500 hover:text-rose-700"><X size={16}/></button>
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>

                       <textarea className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold italic outline-none focus:ring-4 ring-blue-500/10" rows="2" placeholder="Final Summary..." value={consultation.summary} onChange={e=>setConsultation({...consultation, summary: e.target.value})}></textarea>
                       <button onClick={handleAddRecord} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">Save Full Consultation</button>
                    </div>
                 </div>

                 {/* تاريخ الزيارات السابق */}
                 <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl overflow-y-auto max-h-[600px]">
                    <h3 className="text-xl font-black mb-6 italic"><Activity size={20} className="text-blue-500 inline mr-2"/> Clinical History</h3>
                    <div className="space-y-6">
                       {selectedPatient.records?.length > 0 ? selectedPatient.records.map((rec, i) => (
                         <div key={i} className="bg-slate-800 p-5 rounded-3xl border-l-4 border-blue-500 animate-in fade-in">
                            <p className="text-[10px] font-black text-slate-500 mb-2">{new Date(rec.date).toLocaleDateString()}</p>
                            <p className="text-sm font-bold mb-3 italic">{rec.treatmentSummary}</p>
                            <div className="text-[9px] text-slate-400 mb-3 italic">Prescribed: {rec.prescription?.length} Medications</div>
                            <button onClick={() => generatePDF(selectedPatient, rec)} className="text-blue-400 text-[10px] font-black uppercase flex items-center gap-2 hover:text-white transition-all">
                               <Download size={14}/> Prescription PDF
                            </button>
                         </div>
                       )) : <p className="text-slate-500 italic text-sm">No clinical history recorded.</p>}
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: ADD PATIENT */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-6">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in text-left">
            <h3 className="text-2xl font-black italic mb-6 border-b pb-4">Register New Patient</h3>
            <form onSubmit={handleAddPatient} className="space-y-6">
              <input required className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold outline-none focus:ring-4 ring-blue-500/10" placeholder="Name" onChange={e=>setNewPatient({...newPatient, fullName: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4">
                <input required className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold outline-none" placeholder="Phone" onChange={e=>setNewPatient({...newPatient, phone: e.target.value})}/>
                <input className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold outline-none" placeholder="Weight (kg)" onChange={e=>setNewPatient({...newPatient, vitals: {...newPatient.vitals, weight: e.target.value}})}/>
              </div>
              <textarea className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold outline-none" rows="3" placeholder="Allergies / Surgical History..." onChange={e=>setNewPatient({...newPatient, medicalHistory: {...newPatient.medicalHistory, allergies: e.target.value}})}></textarea>
              <button className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-blue-200 uppercase tracking-widest">Create Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const MenuBtn = ({icon, label, active, onClick}) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({title, value, color, icon}) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:border-blue-300">
    <div>
      <p className="text-slate-400 font-black uppercase text-[10px] mb-2 italic tracking-widest">{title}</p>
      <h4 className="text-5xl font-black text-slate-800 tracking-tighter">{value}</h4>
    </div>
    <div className={`${color} p-5 rounded-2xl text-white shadow-xl`}>{icon}</div>
  </div>
);

export default App;