import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`toast ${type}`}>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>&times;</button>
        </div>
    );
};

export default Toast;
