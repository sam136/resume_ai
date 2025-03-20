import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export const showToast = (props: ToastProps) => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg ${
    props.type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white transition-opacity duration-500`;
  toast.textContent = props.message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 500);
  }, 3000);
};
