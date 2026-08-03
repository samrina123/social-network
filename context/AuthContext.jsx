import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/apiConfig';

const DEFAULT_INITIAL_USER = {
  id: 'user_samrina_default',
  name: 'Samrina Mughal',
  username: 'samrina',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  bio: '✨ Creator & Explorer on InstaPulse.',
  postsCount: 1,
  followersCount: 142,
  followingCount: 89,
  isOnline: true,
  privacy: { isPrivateProfile: false, showOnlineStatus: true, allowTagging: 'everyone' }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Restore persisted registered users from localStorage or default initial user
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('instapulse_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [DEFAULT_INITIAL_USER];
    } catch (e) {
      return [DEFAULT_INITIAL_USER];
    }
  });

  // Restore persisted active current user session from localStorage or default initial user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('instapulse_active_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
      return users[0] || DEFAULT_INITIAL_USER;
    } catch (e) {
      return users[0] || DEFAULT_INITIAL_USER;
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

  // Fetch real registered users from backend on startup with robust HTTPS fallback
  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    fetch(`${baseUrl}/api/users`)
      .then(res => {
        if (!res.ok) throw new Error('Network response failed');
        return res.json();
      })
      .then(fetchedUsers => {
        if (Array.isArray(fetchedUsers) && fetchedUsers.length > 0) {
          setUsers(prev => {
            const merged = [...fetchedUsers];
            prev.forEach(pUser => {
              if (!merged.some(m => m.id === pUser.id || m.username === pUser.username)) {
                merged.push(pUser);
              }
            });
            return merged;
          });
        }
      })
      .catch(() => {
        // Fallback to locally persisted users if offline or serverless cold start
      });
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
