import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (usernameOrEmail: string, pass: string) => { success: boolean; error?: string };
  signup: (data: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    jobTitle: string;
    department: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
  recoverPassword: (email: string) => { success: boolean; message: string };
  changePassword: (currentPass: string, newPass: string) => { success: boolean; error?: string };
  switchDemoRole: (role: UserRole) => void;
  validatePasswordStrength: (password: string) => {
    isValid: boolean;
    hasLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('fikra_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fikra_current_user');
    if (saved) return JSON.parse(saved);
    // Default initial user for instant seamless experience
    return INITIAL_USERS[0];
  });

  // Simulated password storage in local storage for the demo
  const [userPasswords, setUserPasswords] = useState<{ [username: string]: string }>(() => {
    const saved = localStorage.getItem('fikra_user_passwords');
    return saved ? JSON.parse(saved) : {
      'sjc_innovator': 'SjcPass@2026',
      'committee_chair': 'Committee@2026',
      'sjc_admin': 'Admin@2026',
    };
  });

  useEffect(() => {
    localStorage.setItem('fikra_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('fikra_user_passwords', JSON.stringify(userPasswords));
  }, [userPasswords]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fikra_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fikra_current_user');
    }
  }, [currentUser]);

  const validatePasswordStrength = (password: string) => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: hasLength && hasUpper && hasLower && hasNumber && hasSpecial,
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    };
  };

  const login = (usernameOrEmail: string, pass: string) => {
    const user = users.find(
      u => u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
           u.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const savedPass = userPasswords[user.username];
    // In mock demo allow matching or default standard
    if (savedPass && savedPass !== pass && pass !== 'demo123' && pass !== '123456') {
      return { success: false, error: 'Invalid password' };
    }

    setCurrentUser(user);
    return { success: true };
  };

  const signup = (data: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    jobTitle: string;
    department: string;
  }) => {
    const exists = users.some(
      u => u.username.toLowerCase() === data.username.toLowerCase() ||
           u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (exists) {
      return { success: false, error: 'User already exists' };
    }

    const strength = validatePasswordStrength(data.password);
    if (!strength.isValid) {
      return { success: false, error: 'Password does not meet security criteria' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      role: 'employee',
      jobTitle: data.jobTitle,
      department: data.department,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.username}`,
      points: 50, // Welcome points
      badges: ['عضو جديد (New Member)'],
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    setUserPasswords(prev => ({ ...prev, [data.username]: data.password }));
    setCurrentUser(newUser);

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const recoverPassword = (email: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      // Mock instant reset link simulation
      const newTempPass = 'SjcReset@2026';
      setUserPasswords(prev => ({ ...prev, [user.username]: newTempPass }));
      return {
        success: true,
        message: `تم إرسال تعليمات الاستعادة إلى ${email}. (كلمة المرور المؤقتة التجريبية: ${newTempPass})`
      };
    }
    return {
      success: true,
      message: `إذا كان البريد ${email} مسجلاً لدينا، فستتلقى رابط الاستعادة قريباً.`
    };
  };

  const changePassword = (currentPass: string, newPass: string) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };

    const savedPass = userPasswords[currentUser.username] || 'SjcPass@2026';
    if (currentPass !== savedPass && currentPass !== 'demo123') {
      return { success: false, error: 'Current password incorrect' };
    }

    const strength = validatePasswordStrength(newPass);
    if (!strength.isValid) {
      return { success: false, error: 'New password does not meet security requirements' };
    }

    setUserPasswords(prev => ({ ...prev, [currentUser.username]: newPass }));
    return { success: true };
  };

  const switchDemoRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role) || {
      id: `user-${role}`,
      username: `demo_${role}`,
      fullName: role === 'admin' ? 'مدير النظام التجريبي' : role === 'committee' ? 'عضو لجنة التقييم التجريبي' : 'موظف تجريبي',
      email: `${role}@sjc.gov.qa`,
      role,
      jobTitle: role === 'admin' ? 'مدير إدارة' : role === 'committee' ? 'مستشار قانوني' : 'مهندس برمجيات',
      department: 'إدارة نظم المعلومات',
      points: 300,
      badges: ['مستخدم تجريبي'],
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(targetUser);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        signup,
        logout,
        recoverPassword,
        changePassword,
        switchDemoRole,
        validatePasswordStrength,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
