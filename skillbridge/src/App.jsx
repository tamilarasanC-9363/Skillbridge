import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ServiceSearch from './pages/customer/ServiceSearch';
import WorkerList from './pages/customer/WorkerList';
import WorkerProfile from './pages/customer/WorkerProfile';
import BookingDetail from './pages/customer/BookingDetail';
import MyBookings from './pages/customer/MyBookings';
import ChatPage from './pages/customer/ChatPage';
import BulkHire from './pages/customer/BulkHire';
import CustomerProfile from './pages/customer/CustomerProfile';

// Worker pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerJobs from './pages/worker/WorkerJobs';
import WorkerProfileSetup from './pages/worker/WorkerProfileSetup';
import WorkerProfileEdit from './pages/worker/WorkerProfileEdit';
import WorkerChat from './pages/worker/WorkerChat';
import Earnings from './pages/worker/Earnings';
import Availability from './pages/worker/Availability';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import VerificationQueue from './pages/admin/VerificationQueue';
import UsersList from './pages/admin/UsersList';
import BookingsList from './pages/admin/BookingsList';
import Reports from './pages/admin/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-gray-bg">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Routes (Guarded: 'customer') */}
              <Route path="/customer" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/customer/search" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ServiceSearch />
                </ProtectedRoute>
              } />
              <Route path="/customer/workers" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <WorkerList />
                </ProtectedRoute>
              } />
              <Route path="/customer/worker/:workerId" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <WorkerProfile />
                </ProtectedRoute>
              } />
              <Route path="/customer/bookings" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MyBookings />
                </ProtectedRoute>
              } />
              <Route path="/customer/booking/:bookingId" element={
                <ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}>
                  <BookingDetail />
                </ProtectedRoute>
              } />
              <Route path="/customer/chat/:chatId" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/customer/bulk-hire" element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <BulkHire />
                </ProtectedRoute>
              } />
              <Route path="/customer/profile" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerProfile />
                </ProtectedRoute>
              } />

              {/* Worker Routes (Guarded: 'worker') */}
              <Route path="/worker" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/worker/profile" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerProfileEdit />
                </ProtectedRoute>
              } />
              <Route path="/worker/profile/setup" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerProfileSetup />
                </ProtectedRoute>
              } />
              <Route path="/worker/bookings" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerJobs />
                </ProtectedRoute>
              } />
              <Route path="/worker/jobs" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerJobs />
                </ProtectedRoute>
              } />
              <Route path="/worker/requests" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerJobs />
                </ProtectedRoute>
              } />
              <Route path="/worker/chat/:chatId" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerChat />
                </ProtectedRoute>
              } />
              <Route path="/worker/earnings" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <Earnings />
                </ProtectedRoute>
              } />
              <Route path="/worker/availability" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <Availability />
                </ProtectedRoute>
              } />

              {/* Admin Routes (Guarded: 'admin') */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/workers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <VerificationQueue />
                </ProtectedRoute>
              } />
              <Route path="/admin/verification" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <VerificationQueue />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersList />
                </ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BookingsList />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/admin/bulk-hire" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BulkHire />
                </ProtectedRoute>
              } />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
