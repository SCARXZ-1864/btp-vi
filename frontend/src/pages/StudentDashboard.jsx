import { useEffect, useState } from 'react';
import { getMe, applyClearance, getClearanceStatus, generateCertificate } from '../api';
import Sidebar from '../components/Sidebar';
import StatusCard from '../components/StatusCard';
import { FileDown, RefreshCw } from 'lucide-react';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await getMe();
      setUser(userRes.data);
      
      try {
        const statusRes = await getClearanceStatus();
        setStatus(statusRes.data);
      } catch (err) {
        setStatus(null); // No request yet
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async () => {
    try {
      await applyClearance();
      fetchData();
    } catch (err) {
      alert("Failed to apply for clearance");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await generateCertificate(status.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificate.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download certificate. Make sure all departments approved.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar role="STUDENT" name={user?.name} activeTab="dashboard" />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Clearance Status</h1>
            <button onClick={fetchData} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
              <RefreshCw size={24} />
            </button>
          </div>

          {!status ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">You haven't applied yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Start your clearance process by submitting an application. This will notify all relevant departments.</p>
              <button 
                onClick={handleApply}
                className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 rounded-lg transition-colors text-lg"
              >
                Apply for Clearance
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Overall Status</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    status.status === 'APPROVED' ? 'text-green-600' : 
                    status.status === 'REJECTED' ? 'text-red-600' : 
                    status.status === 'QUERY' ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {status.status}
                  </p>
                </div>
                {status.status === 'APPROVED' && (
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    <FileDown size={20} />
                    Download Certificate
                  </button>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Department Approvals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {status.approvals.map(app => (
                    <StatusCard 
                      key={app.id} 
                      departmentName={app.department_name || `Department ${app.department_id}`} 
                      status={app.status} 
                      remarks={app.remarks} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
