import { useEffect, useState } from 'react';
import { createDepartment, createUser, getMe, listDepartments, listUsers, updateUserRole } from '../api';
import Sidebar from '../components/Sidebar';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    department_id: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await getMe();
      setUser(userRes.data);
      
      const [deptRes, usersRes] = await Promise.all([listDepartments(), listUsers()]);
      setDepartments(deptRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDept) return;
    try {
      await createDepartment(newDept);
      setNewDept('');
      fetchData();
    } catch (err) {
      alert("Failed to create department");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser({
        ...newUser,
        department_id: newUser.role === 'DEPARTMENT' && newUser.department_id ? Number(newUser.department_id) : null,
      });
      setNewUser({ name: '', email: '', password: '', role: 'STUDENT', department_id: '' });
      fetchData();
    } catch (err) {
      alert("Failed to create user");
    }
  };

  const handleRoleChange = async (id, role, departmentId) => {
    try {
      await updateUserRole(id, {
        role,
        department_id: role === 'DEPARTMENT' && departmentId ? Number(departmentId) : null,
      });
      fetchData();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar role="ADMIN" name={user?.name} />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Create Department</h2>
              <form onSubmit={handleCreateDepartment} className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Department Name"
                  className="flex-1 px-4 py-2 border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Create User</h2>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="px-4 py-2 border rounded-lg outline-none focus:border-primary" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} required />
                <input className="px-4 py-2 border rounded-lg outline-none focus:border-primary" placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required />
                <input className="px-4 py-2 border rounded-lg outline-none focus:border-primary" placeholder="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required />
                <select className="px-4 py-2 border rounded-lg outline-none focus:border-primary bg-white" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                  <option value="STUDENT">Student</option>
                  <option value="DEPARTMENT">Department</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {newUser.role === 'DEPARTMENT' && (
                  <select className="px-4 py-2 border rounded-lg outline-none focus:border-primary bg-white md:col-span-2" value={newUser.department_id} onChange={(e) => setNewUser({...newUser, department_id: e.target.value})} required>
                    <option value="">Assign Department</option>
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </select>
                )}
                <button type="submit" className="md:col-span-2 bg-secondary hover:bg-secondary/90 text-white font-medium px-6 py-2 rounded-lg transition-colors">Add User</button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
            <h2 className="text-xl font-bold text-gray-800 p-6 border-b">Existing Departments</h2>
            <ul className="divide-y">
              {departments.map(dept => (
                <li key={dept.id} className="p-6 flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-900">{dept.name}</span>
                  <span className="text-sm text-gray-500">ID: {dept.id}</span>
                </li>
              ))}
              {departments.length === 0 && (
                <li className="p-6 text-center text-gray-500">No departments found.</li>
              )}
            </ul>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <h2 className="text-xl font-bold text-gray-800 p-6 border-b">Users & Roles</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500">Name</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Email</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Role</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-gray-600">{item.email}</td>
                      <td className="px-6 py-4">
                        <select
                          className="px-3 py-2 border rounded-lg bg-white"
                          value={item.role}
                          onChange={(e) => handleRoleChange(
                            item.id,
                            e.target.value,
                            e.target.value === 'DEPARTMENT' ? (item.department_id || departments[0]?.id) : null
                          )}
                        >
                          <option value="STUDENT">Student</option>
                          <option value="DEPARTMENT">Department</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          className="px-3 py-2 border rounded-lg bg-white disabled:bg-gray-100"
                          value={item.department_id || ''}
                          disabled={item.role !== 'DEPARTMENT'}
                          onChange={(e) => handleRoleChange(item.id, item.role, e.target.value)}
                        >
                          <option value="">None</option>
                          {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
