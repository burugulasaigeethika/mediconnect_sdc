import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorLogin from './pages/DoctorLogin';
import DoctorRegister from './pages/DoctorRegister';
import PharmacistLogin from './pages/PharmacistLogin';
import PharmacistRegister from './pages/PharmacistRegister';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import PatientLogin from './pages/PatientLogin';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Pharmacy from './pages/Pharmacy';
import Cart from './pages/Cart';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
// Prescription Order Workflow Components
import UploadPrescription from './pages/UploadPrescription';
import AdvancedUploadPrescription from './pages/AdvancedUploadPrescription';
import PatientAccount from './pages/PatientAccount';
import MyAddresses from './pages/MyAddresses';
import ViewOrder from './pages/ViewOrder';
import PaymentPage from './pages/PaymentPage';
import PharmacistAccount from './pages/PharmacistAccount';

function AppContent() {
    console.log('AppContent rendering');
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/login/doctor" element={<DoctorLogin />} />
                    <Route path="/login/pharmacist" element={<PharmacistLogin />} />
                    <Route path="/login/admin" element={<AdminLogin />} />
                    <Route path="/login/patient" element={<PatientLogin />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register/doctor" element={<DoctorRegister />} />
                    <Route path="/register/pharmacist" element={<PharmacistRegister />} />
                    <Route path="/register/admin" element={<AdminRegister />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/pharmacy" element={<Pharmacy />} />
                    <Route path="/cart" element={<Cart />} />

                    {/* Patient Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/account" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <PatientAccount />
                        </ProtectedRoute>
                    } />
                    <Route path="/addresses" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <MyAddresses />
                        </ProtectedRoute>
                    } />
                    <Route path="/upload-prescription" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <UploadPrescription />
                        </ProtectedRoute>
                    } />
                    <Route path="/advanced-upload-prescription" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <AdvancedUploadPrescription />
                        </ProtectedRoute>
                    } />
                    <Route path="/view-order/:orderId" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <ViewOrder />
                        </ProtectedRoute>
                    } />
                    <Route path="/payment/:orderId" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <PaymentPage />
                        </ProtectedRoute>
                    } />

                    {/* Doctor Routes */}
                    <Route path="/dashboard/doctor" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <DoctorDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Pharmacist Routes */}
                    <Route path="/dashboard/pharmacist" element={
                        <ProtectedRoute allowedRoles={['pharmacist']}>
                            <PharmacistDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/account/pharmacist" element={
                        <ProtectedRoute allowedRoles={['pharmacist']}>
                            <PharmacistAccount />
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/dashboard/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            <Footer />
            <ToastContainer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <AppContent />
                    <ChatWidget />
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;