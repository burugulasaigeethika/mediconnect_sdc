import { toast } from 'react-toastify';

// Success toast (green)
export const showSuccessToast = (message) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

// Error toast (red)
export const showErrorToast = (message) => {
    toast.error(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

// Info toast (blue) - optional
export const showInfoToast = (message) => {
    toast.info(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};
