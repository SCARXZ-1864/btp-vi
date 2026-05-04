import { useEffect, useState } from 'react';
import { getMe } from '../api';
import Sidebar from '../components/Sidebar';
import { UserCircle, Mail, Shield } from 'lucide-react';

export default function StudentProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMe();
        setUser(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar role="STUDENT" name={user?.name} activeTab="profile" />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
          
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex items-center gap-6 mb-8 border-b pb-8">
              <div className="bg-primary/10 p-6 rounded-full text-primary">
                <UserCircle size={64} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{user?.name}</h2>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <Shield size={16} /> {user?.role}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="mt-2 flex items-center gap-3 text-lg text-gray-800 bg-gray-50 p-4 rounded-lg border">
                  <Mail className="text-gray-400" />
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Account ID</label>
                <div className="mt-2 text-lg text-gray-800 bg-gray-50 p-4 rounded-lg border font-mono">
                  #{user?.id?.toString().padStart(6, '0')}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
