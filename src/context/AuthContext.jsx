import { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { allMenuNames } from '../constants/menuItems';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch employee data from Firestore
          const employeesRef = collection(db, 'employees');
          const q = query(employeesRef, where('uid', '==', firebaseUser.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const employeeData = querySnapshot.docs[0].data();
            const employeeId = querySnapshot.docs[0].id;
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              employeeId: employeeId,
              employeeName: employeeData.employeeName,
              userAccess: employeeData.userAccess,
              accessMenus: employeeData.accessMenus || []
            });
          } else {
            // Employee not found in Firestore, but exists in Auth - grant Admin access
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              employeeId: 'ADMIN',
              employeeName: firebaseUser.email.split('@')[0],
              userAccess: 'Admin',
              accessMenus: allMenuNames
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    const auth = getAuth();
    await firebaseSignOut(auth);
    setUser(null);
  };

  const hasAccess = (menu) => {
    if (!user) return false;
    if (user.userAccess === 'Admin') return true;
    return user.accessMenus.includes(menu);
  };

  const canEdit = (menu) => {
    if (!user) return false;
    if (user.userAccess === 'Admin') return true;
    if (user.userAccess === 'Can Edit' && user.accessMenus.includes(menu)) return true;
    return false;
  };

  const canView = (menu) => {
    if (!user) return false;
    if (user.userAccess === 'Admin') return true;
    if ((user.userAccess === 'Can View' || user.userAccess === 'Can Edit') && user.accessMenus.includes(menu)) return true;
    return false;
  };

  const isAdmin = () => {
    return user?.userAccess === 'Admin';
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
    hasAccess,
    canEdit,
    canView,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
