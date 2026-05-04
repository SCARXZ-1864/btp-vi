import { useEffect, useState } from 'react';
import { getMe, getAssignedRequests, takeAction } from '../api';
import Sidebar from '../components/Sidebar';
import { Check, X, AlertCircle, RotateCcw } from 'lucide-react';

export default function DepartmentDashboard() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksInput, setRemarksInput] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await getMe();
      setUser(userRes.data);
      
      const reqRes = await getAssignedRequests();
      setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (reqId, deptId, actionStatus) => {
    const key = `${reqId}-${deptId}`;
    try {
      await takeAction(reqId, {
        status: actionStatus,
        remarks: remarksInput[key] || ''
      });
      setRemarksInput(prev => ({...prev, [key]: ''}));
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const pendingRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'QUERY');
  const completedRequests = requests.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED');

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar role="DEPARTMENT" name={user?.name} />
      
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Department Dashboard</h1>
          
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Actions ({pendingRequests.length})</h2>
            {pendingRequests.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border text-center text-gray-500">
                No pending requests.
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingRequests.map(req => {
                  const key = `${req.request_id}-${req.department_id}`;
                  return (
                    <div key={key} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{req.student_name}</h3>
                        <p className="text-sm text-gray-500">Request ID: #{req.request_id}</p>
                        <p className="text-sm text-blue-600 font-medium mt-1">Current Status: {req.status}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <input 
                          type="text" 
                          placeholder="Optional remarks..."
                          className="px-4 py-2 border rounded-lg text-sm flex-1 md:w-48 outline-none focus:border-primary"
                          value={remarksInput[key] || ''}
                          onChange={(e) => setRemarksInput(prev => ({...prev, [key]: e.target.value}))}
                        />
                        <div className="flex gap-2">
                          {req.status === 'QUERY' ? (
                            <button 
                              onClick={() => handleAction(req.request_id, req.department_id, 'PENDING')}
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-lg flex items-center justify-center"
                              title="Move back to pending"
                            >
                              <RotateCcw size={20} />
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleAction(req.request_id, req.department_id, 'APPROVED')}
                                className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg flex items-center justify-center"
                                title="Approve"
                              >
                                <Check size={20} />
                              </button>
                              <button 
                                onClick={() => handleAction(req.request_id, req.department_id, 'QUERY')}
                                className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 p-2 rounded-lg flex items-center justify-center"
                                title="Raise Query"
                              >
                                <AlertCircle size={20} />
                              </button>
                              <button 
                                onClick={() => handleAction(req.request_id, req.department_id, 'REJECTED')}
                                className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg flex items-center justify-center"
                                title="Reject"
                              >
                                <X size={20} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500">Student Name</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {completedRequests.slice(0, 10).map(req => (
                    <tr key={`${req.request_id}-${req.department_id}`}>
                      <td className="px-6 py-4 text-gray-900">{req.student_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{req.remarks || '-'}</td>
                    </tr>
                  ))}
                  {completedRequests.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No completed actions yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
