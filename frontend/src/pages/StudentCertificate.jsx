import { useEffect, useState } from 'react';
import { getMe, getClearanceStatus, generateCertificate } from '../api';
import Sidebar from '../components/Sidebar';
import { FileDown, Award, Clock } from 'lucide-react';

export default function StudentCertificate() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, []);

  const handleDownload = async () => {
    try {
      const res = await generateCertificate(status.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Clearance_Certificate_${user?.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download certificate. Make sure all departments approved.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const isApproved = status?.status === 'APPROVED';

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar role="STUDENT" name={user?.name} activeTab="certificate" />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Certificate</h1>
          
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            {isApproved ? (
              <div className="flex flex-col items-center">
                <div className="bg-green-100 text-green-600 p-6 rounded-full mb-6">
                  <Award size={64} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Congratulations!</h2>
                <p className="text-gray-600 text-lg mb-8 max-w-lg">
                  Your No-Dues clearance has been fully approved by all departments. Your official digital certificate is ready for download.
                </p>
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-3 bg-secondary hover:bg-secondary/90 text-white font-medium px-8 py-4 rounded-xl transition-colors text-lg shadow-lg shadow-secondary/30"
                >
                  <FileDown size={24} />
                  Download Official PDF
                </button>
              </div>
            ) : status ? (
              <div className="flex flex-col items-center">
                <div className="bg-yellow-100 text-yellow-600 p-6 rounded-full mb-6">
                  <Clock size={64} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Clearance In Progress</h2>
                <p className="text-gray-600 text-lg mb-2 max-w-md">
                  Your clearance request is currently <strong>{status.status}</strong>.
                </p>
                <p className="text-gray-500 mb-8 max-w-md">
                  You can only generate and download your certificate once all departments have approved your request. Please check the Dashboard for department-wise status.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 text-gray-400 p-6 rounded-full mb-6">
                  <FileDown size={64} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No Clearance Request Found</h2>
                <p className="text-gray-600 mb-8">
                  You haven't applied for clearance yet. Head over to the Dashboard to submit your application.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
