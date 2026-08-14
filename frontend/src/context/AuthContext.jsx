import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    }, []);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            console.log('Setting Authorization header with token:', token.substring(0, 20) + '...');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            console.log('Removing Authorization header');
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Restore user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('Restoring user from localStorage:', parsedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        }
    }, []);

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Explicitly set authorization header for verification request
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                await axios.get('/api/auth/verify');
                setLoading(false);
            } catch (error) {
                console.error('Token verification failed:', error);
                logout();
            }
        };

        verifyToken();
    }, [token, logout]);

    // Global Axios Response Interceptor to handle expired or invalid token (401 Unauthorized)
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    console.warn('Unauthorized request, logging out user...');
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [logout]);

    const login = useCallback(async (email, password, expectedRole = null) => {
        try {
            let endpoint = '/api/auth/login';
            console.log('Attempting login with endpoint:', endpoint, 'Expected role:', expectedRole);

            // Use specific endpoints for different roles
            if (expectedRole === 'doctor') {
                endpoint = '/api/doctors/login';
            } else if (expectedRole === 'pharmacist') {
                endpoint = '/api/pharmacists/login';
            }

            console.log('Using login endpoint:', endpoint);
            const response = await axios.post(endpoint, {
                email,
                password,
                role: expectedRole // Send expected role to backend for verification
            });
            const { token, user } = response.data;
            console.log('Login response:', { token: token?.substring(0, 20) + '...', user });

            // Validate role if specified
            if (expectedRole && user.role !== expectedRole) {
                console.log('Role mismatch:', { expected: expectedRole, actual: user.role });
                return {
                    success: false,
                    message: `This account is registered as ${user.role}. Please use the ${user.role} login page.`
                };
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setToken(token);
            setUser(user);

            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setToken(token);
            setUser(user);

            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true, user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    }, []);

    // Helper function to get dashboard path based on role
    const getRoleDashboard = useCallback((role) => {
        const dashboardMap = {
            patient: '/dashboard',
            doctor: '/dashboard/doctor',
            pharmacist: '/dashboard/pharmacist',
            admin: '/dashboard/admin'
        };
        return dashboardMap[role] || '/dashboard';
    }, []);

    // Helper function to ensure token is set before API calls
    const ensureAuthHeaders = useCallback(() => {
        const currentToken = localStorage.getItem('token');
        console.log('Ensuring auth headers, current token:', currentToken ? currentToken.substring(0, 20) + '...' : 'null');
        if (currentToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, []);

    // Update user data in context and localStorage
    const updateUser = useCallback((updatedUser) => {
        console.log('Updating user in context:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        getRoleDashboard,
        ensureAuthHeaders,
        updateUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};