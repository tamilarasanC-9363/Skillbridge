import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Users as UsersIcon, FileBarChart2, Clock, 
  Calendar, ShieldAlert, Briefcase, Mail, Phone 
} from 'lucide-react';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve users from simulated local database
    const loadUsers = () => {
      try {
        const mockUsers = JSON.parse(localStorage.getItem('sb_mock_users') || '{}');
        const list = Object.values(mockUsers);
        setUsers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const sidebarLinks = [
    { label: 'Overview', path: '/admin', icon: FileBarChart2, end: true },
    { label: 'Worker Queue', path: '/admin/verification', icon: Clock },
    { label: 'All Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'User Directory', path: '/admin/users', icon: UsersIcon },
    { label: 'Bulk Hiring', path: '/customer/bulk-hire', icon: Briefcase },
    { label: 'Reports', path: '/admin/reports', icon: ShieldAlert }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-4 animate-fade-in text-left">
      <Sidebar links={sidebarLinks} title="Admin Panel" />

      <div className="flex-grow space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">User Directory</h1>
          <p className="text-xs text-gray-500 mt-1">Audit customer profiles, phone credentials, and registered roles.</p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : users.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 shadow-3xs">
            <UsersIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Users Registered</h3>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Phone</th>
                    <th className="py-3 px-2">Role Type</th>
                    <th className="py-3 px-2">Account ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {users.map(user => (
                    <tr key={user.uid} className="hover:bg-gray-50/50">
                      <td className="py-4 px-2 font-bold text-gray-900">{user.name}</td>
                      <td className="py-4 px-2 flex items-center gap-1.5 mt-1 text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {user.email}
                      </td>
                      <td className="py-4 px-2 font-semibold text-gray-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {user.phone || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-left">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                            : user.role === 'worker' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                              : 'bg-blue-50 text-primary border border-blue-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-mono text-gray-400 text-[10px]">{user.uid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
