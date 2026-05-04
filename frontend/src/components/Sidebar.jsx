import { LogOut, LayoutDashboard, FileText, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ role, name, activeTab = 'dashboard' }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getButtonClass = (tabName) => {
    const isActive = activeTab === tabName;
    return `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors w-full ${
      isActive 
        ? 'bg-primary/10 text-primary' 
        : 'text-gray-600 hover:bg-gray-50'
    }`;
  };

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-primary">No-Dues</h2>
        <p className="text-sm text-gray-500 mt-1">{role} Portal</p>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-2 px-4">
        <button 
          onClick={() => navigate(role === 'STUDENT' ? '/student' : role === 'DEPARTMENT' ? '/department' : '/admin')}
          className={getButtonClass('dashboard')}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </button>
        {role === 'STUDENT' && (
          <>
            <button 
              onClick={() => navigate('/student/certificate')}
              className={getButtonClass('certificate')}
            >
              <FileText size={20} />
              Certificate
            </button>
            <button 
              onClick={() => navigate('/student/profile')}
              className={getButtonClass('profile')}
            >
              <UserCircle size={20} />
              Profile
            </button>
          </>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium text-gray-900">{name}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
