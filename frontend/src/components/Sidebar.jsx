import { Users, Calendar, FileText, Home } from 'lucide-react';

export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-blue-900 text-white p-5 space-y-6">
            <h1 className="text-2xl font-bold">عيادتي - Clinic</h1>
            <nav className="space-y-4">
                <a href="/" className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded"><Home size={20}/> الرئيسية</a>
                <a href="/patients" className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded"><Users size={20}/> المرضى</a>
                <a href="/appointments" className="flex items-center gap-3 p-2 hover:bg-blue-700 rounded"><Calendar size={20}/> المواعيد</a>
            </nav>
        </div>
    );
}