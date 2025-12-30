
import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircleIcon, XCircleIcon } from './icons';

const Notification: React.FC = () => {
  const { notification } = useNotification();

  if (!notification) {
    return null;
  }

  const { message, type } = notification;
  const isSuccess = type === 'success';

  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const icon = isSuccess ? <CheckCircleIcon className="w-6 h-6 mr-3" /> : <XCircleIcon className="w-6 h-6 mr-3" />;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center p-4 rounded-lg shadow-lg text-white ${bgColor} animate-fade-in-down`}
      role="alert"
    >
      {icon}
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default Notification;
