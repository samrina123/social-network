import React from 'react';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const ToastContainer = () => {
  const { toasts } = useSocket();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="toast-item">
          <img src={toast.senderAvatar} alt="" className="toast-avatar" />
          <div className="toast-text">
            <span className="toast-sender">{toast.senderName}</span> {toast.text}
          </div>
          <Bell size={16} color="var(--ig-primary)" />
        </div>
      ))}
    </div>
  );
};
