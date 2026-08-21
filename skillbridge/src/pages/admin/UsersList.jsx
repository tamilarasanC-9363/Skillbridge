import { useEffect, useState } from 'react';
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
          <h1 className="text-2xl font-extrabold text-[#283845] dark:text-white leading-tight font-heading">User Directory</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Audit customer profiles, phone credentials, and registered roles.</p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-12 text-center text-stone-500 shadow-xs">
            <UsersIcon className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#283845] dark:text-white font-heading">No Users Registered</h3>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-3xl p-6 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EBE5DE] dark:border-white/10 text-stone-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Phone</th>
                    <th className="py-3 px-2">Role Type</th>
                    <th className="py-3 px-2">Account ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE5DE] dark:divide-white/10 text-stone-700 dark:text-stone-300">
                  {users.map(user => (
                    <tr key={user.uid} className="hover:bg-stone-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2 font-bold text-[#283845] dark:text-white">{user.name}</td>
                      <td className="py-4 px-2 flex items-center gap-1.5 mt-1 text-stone-600 dark:text-stone-300">
                        <Mail className="w-3.5 h-3.5 text-[#FFA649]" />
                        {user.email}
                      </td>
                      <td className="py-4 px-2 font-semibold text-stone-600 dark:text-stone-300">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#FFA649]" />
                          {user.phone || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-left">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-[#283845]/20 text-[#283845] dark:text-[#FFA649] border border-[#283845]/30 dark:border-[#FFA649]/30' 
                            : user.role === 'worker' 
                              ? 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] border border-[#FFA649]/30' 
                              : 'bg-stone-100 dark:bg-[#11171E] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-mono text-stone-400 text-[10px]">{user.uid}</td>
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
