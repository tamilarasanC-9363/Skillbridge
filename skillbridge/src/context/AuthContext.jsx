import { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginUser, 
  logoutUser, 
  registerUser, 
  sendPasswordReset,
  subscribeToAuth 
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state updates
    const unsubscribe = subscribeToAuth((user) => {
      if (user) {
        setCurrentUser(user);
        setUserRole(user.role || null);
        setUserProfile(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      const normalizedUser = user ? { ...user, role: user.role || userRole || null } : user;
      setCurrentUser(normalizedUser);
      setUserRole(normalizedUser?.role || null);
      setUserProfile(normalizedUser);
      return normalizedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserRole(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name, phone, role) => {
    setLoading(true);
    try {
      const user = await registerUser(email, password, name, phone, role);
      const safeRole = user?.role || role || null;
      const normalizedUser = user ? { ...user, role: safeRole } : user;
      setCurrentUser(normalizedUser);
      setUserRole(safeRole);
      setUserProfile(normalizedUser);
      return normalizedUser;
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = !!currentUser;

  const value = {
    currentUser,
    userRole,
    userProfile,
    isLoggedIn,
    loading,
    login,
    logout,
    register,
    resetPassword: sendPasswordReset
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
