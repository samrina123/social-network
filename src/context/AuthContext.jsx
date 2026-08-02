import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Restore persisted registered users from localStorage
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('instapulse_registered_users');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Restore persisted active current user session from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('instapulse_active_user');
      return saved ? JSON.parse(saved) : (users[0] || null);
    } catch (e) {
      return users[0] || null;
    }
  });

  // Save active user and users list to localStorage on state changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('instapulse_active_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('instapulse_active_user');
      }
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('instapulse_registered_users', JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  // Fetch real registered users from backend on startup
  useEffect(() => {
    const host = window.location.hostname || 'localhost';
    fetch(`http://${host}:5000/api/users`)
      .then(res => res.json())
      .then(fetchedUsers => {
        if (Array.isArray(fetchedUsers) && fetchedUsers.length > 0) {
          setUsers(fetchedUsers);
          setCurrentUser(prev => prev ? (fetchedUsers.find(u => u.id === prev.id) || prev) : fetchedUsers[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Sign In / Login Existing Registered User
  const loginUser = (usernameInput, passwordInput) => {
    const cleanUsername = usernameInput.trim().toLowerCase().replace(/[@\s]+/g, '_');
    const userMatch = users.find(u => u.username === cleanUsername);

    if (!userMatch) {
      throw new Error(`No registered account found for @${cleanUsername}. Please Sign Up first!`);
    }

    // Login successful
    setCurrentUser(userMatch);
    return userMatch;
  };

  // Sign Out / Log Out User Session
  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('instapulse_active_user');
  };

  const switchUser = (userId) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const addNewUser = (newUserObj) => {
    setUsers(prev => [newUserObj, ...prev.filter(u => u.id !== newUserObj.id)]);
    setCurrentUser(newUserObj);
  };

  const updateProfile = (updatedFields) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedFields } : u));
    setCurrentUser(prev => ({ ...prev, ...updatedFields }));
  };

  const updatePrivacy = (newPrivacySettings) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      privacy: { ...currentUser.privacy, ...newPrivacySettings }
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      loginUser,
      logoutUser,
      switchUser,
      addNewUser,
      updateProfile,
      updatePrivacy
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
