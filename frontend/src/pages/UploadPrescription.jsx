import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadPrescription } from '../services/pharmacistService';
import { validateFile } from '../utils/fileUploadUtils';
import { showSuccessToast } from '../utils/toast';
import samplePrescriptionImg from '../assets/sample-prescription.png';
import './Auth.css';

const UploadPrescription = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSampleModal, setShowSampleModal] = useState(false);

    // Doctor details state
    const [doctorName, setDoctorName] = useState('');
    const [doctorRegistrationNumber, setDoctorRegistrationNumber] = useState('');
    const [consultationType, setConsultationType] = useState('offline');
    const [clinicOrHospitalName, setClinicOrHospitalName] = useState('');
    const [consultationDate, setConsultationDate] = useState('');

    const handleFileChange = (e) => {
        console.log('File input changed');
        const selectedFile = e.target.files[0];
        console.log('Selected file:', selectedFile);

        if (selectedFile) {
            // Validate file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            const validation = validateFile(selectedFile, allowedTypes, maxSize);
            console.log('File validation result:', validation);

            if (!validation.isValid) {
                setError(validation.error);
                return;
            }

            setFile(selectedFile);
            setError('');

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        console.log('Event:', e);
        console.log('Current file:', file);

        if (!file) {
            setError('Please select a prescription file');
            return;
        }

        if (!doctorName) {
            setError('Please enter the doctor name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create FormData to send the actual file and doctor details
            const formData = new FormData();
            formData.append('prescriptionFile', file);
            formData.append('doctorName', doctorName);
            formData.append('doctorRegistrationNumber', doctorRegistrationNumber);
            formData.append('consultationType', consultationType);
            formData.append('clinicOrHospitalName', clinicOrHospitalName);
            formData.append('consultationDate', consultationDate);

            console.log('FormData created with file:', file);
            console.log('FormData entries:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Use the service function to upload prescription
            console.log('Calling uploadPrescription service');
            const response = await uploadPrescription(formData);
            console.log('Upload response received:', response);

            if (response.order) {
                showSuccessToast('Prescription uploaded successfully!');
                navigate(`/view-order/${response.order.orderId}`);
            }
        } catch (err) {
            console.error('Error uploading prescription:', err);
            console.error('Error stack:', err.stack);
            setError(err.message || 'Failed to upload prescription. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = () => {
        console.log('Manual submit button clicked');
        if (formRef.current) {
            console.log('Submitting form manually');
            formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Left Column - Upload Form */}
            <div className="auth-container" style={{ flex: '1', margin: '0' }}>
                <div className="auth-form">
                    <h2>Upload Prescription</h2>
                    <p>Hello {user?.name}, please upload your prescription</p>

                    {error && <div className="error-message">{error}</div>}

                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Prescription File (Image/PDF)</label>
                            <div
                                className="file-upload-area"
                                onClick={() => document.getElementById('prescriptionInput').click()}
                                style={{
                                    border: '2px dashed #3498db',
                                    borderRadius: '8px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: '#f8f9fa',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: '#2c3e50' }}>
                                    {file ? file.name : 'Click to upload prescription'}
                                </p>
                                <div className="file-hint">
                                    Supported formats: JPEG, JPG, PNG, GIF, PDF (Max size: 5MB)
                                </div>
                            </div>
                            <input
                                id="prescriptionInput"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                required
                            />
                        </div>

                        {/* Doctor Details Section */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1.5rem',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                        }}>
                            <h3 style={{
                                margin: '0 0 1rem 0',
                                fontSize: '1.1rem',
                                color: '#2c3e50',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                👨‍⚕️ Doctor Details
                            </h3>

                            <div className="form-group">
                                <label>Doctor Name <span style={{ color: '#e74c3c' }}>*</span></label>
                                <input
                                    type="text"
                                    value={doctorName}
                                    onChange={(e) => setDoctorName(e.target.value)}
                                    placeholder="Enter doctor's full name"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Doctor Registration Number</label>
                                <input
                                    type="text"
                                    value={doctorRegistrationNumber}
                                    onChange={(e) => setDoctorRegistrationNumber(e.target.value)}
                                    placeholder="Medical council registration number (optional)"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Consultation Type <span style={{ color: '#e74c3c' }}>*</span></label>
                                <select
                                    value={consultationType}
                                    onChange={(e) => setConsultationType(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: '#fff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="offline">Offline (Physical Clinic Visit)</option>
                                    <option value="online">Online Consultation</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Clinic/Hospital Name</label>
                                <input
                                    type="text"
                                    value={clinicOrHospitalName}
                                    onChange={(e) => setClinicOrHospitalName(e.target.value)}
                                    placeholder="Name of clinic or hospital (optional)"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Consultation Date</label>
                                <input
                                    type="date"
                                    value={consultationDate}
                                    onChange={(e) => setConsultationDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>

                        {preview && (
                            <div className="file-preview">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0 }}>Preview:</h4>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            setPreview(null);
                                            setError('');
                                            // Reset file input
                                            const fileInput = document.getElementById('prescriptionInput');
                                            if (fileInput) fileInput.value = '';
                                        }}
                                        style={{
                                            background: '#e74c3c',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.5rem 1rem',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            transition: 'background 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#c0392b'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#e74c3c'}
                                    >
                                        ✕ Remove
                                    </button>
                                </div>
                                {file?.type?.startsWith('image/') ? (
                                    <img src={preview} alt="Prescription preview" className="preview-image" />
                                ) : (
                                    <div className="pdf-preview">
                                        <div className="pdf-icon">📄</div>
                                        <p>PDF File: {file.name}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {loading && (
                            <div className="upload-progress">
                                <div className="progress-text">Uploading...</div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Upload Prescription'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Your prescription will be reviewed by our pharmacist team.</p>
                        <p className="note">Note: For security reasons, uploaded prescriptions are encrypted and stored securely.</p>
                    </div>
                </div>
            </div>

            {/* Right Column - Guidelines */}
            <div style={{
                flex: '0 0 400px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {/* Illustration */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <svg width="200" height="200" viewBox="0 0 200 200" style={{ margin: '0 auto' }}>
                        {/* Person */}
                        <ellipse cx="85" cy="45" rx="12" ry="15" fill="#f4a5a5" />
                        <rect x="70" y="55" width="30" height="40" rx="5" fill="#ff9999" />
                        <rect x="65" y="60" width="10" height="20" fill="#ff9999" />
                        <rect x="100" y="60" width="10" height="20" fill="#ff9999" />
                        <rect x="73" y="95" width="10" height="35" fill="#7a7a7a" />
                        <rect x="87" y="95" width="10" height="35" fill="#7a7a7a" />

                        {/* Prescription papers */}
                        <g transform="translate(110, 70)">
                            <rect x="0" y="0" width="30" height="40" rx="2" fill="#fff" stroke="#3498db" strokeWidth="1.5" />
                            <line x1="5" y1="8" x2="25" y2="8" stroke="#3498db" strokeWidth="1" />
                            <line x1="5" y1="14" x2="25" y2="14" stroke="#3498db" strokeWidth="1" />
                            <line x1="5" y1="20" x2="20" y2="20" stroke="#3498db" strokeWidth="1" />
                        </g>

                        <g transform="translate(125, 85) rotate(15)">
                            <rect x="0" y="0" width="30" height="40" rx="2" fill="#ffcccc" stroke="#e74c3c" strokeWidth="1.5" />
                            <circle cx="15" cy="20" r="8" fill="none" stroke="#c0392b" strokeWidth="1.5" />
                            <text x="15" y="24" fontSize="10" textAnchor="middle" fill="#c0392b" fontWeight="bold">Rx</text>
                        </g>

                        {/* Mailbox */}
                        <rect x="100" y="140" width="80" height="50" rx="5" fill="#ffb3ba" />
                        <path d="M 100 140 L 140 115 L 180 140" fill="#ffb3ba" stroke="#ff7f8a" strokeWidth="2" />
                        <rect x="130" y="145" width="20" height="15" rx="2" fill="#fff" />
                    </svg>
                </div>

                {/* Note Section */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        gap: '0.5rem'
                    }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#000',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>ℹ</div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>
                            Note: Prescription should contain -
                        </h3>
                    </div>

                    <ol style={{
                        margin: '0',
                        padding: '0 0 0 1.5rem',
                        color: '#5a6c7d',
                        lineHeight: '2'
                    }}>
                        <li>Doctor Name and Signature</li>
                        <li>Patient Name</li>
                        <li>Date of Prescription</li>
                        <li>Don't crop out any part of the image</li>
                        <li>Avoid blurred image</li>
                        <li>Include Details of doctor and patient + clinic visit date</li>
                        <li>Medicines will be dispensed as per prescription</li>
                    </ol>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowSampleModal(true);
                            }}
                            style={{
                                color: '#3498db',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                cursor: 'pointer'
                            }}
                        >
                            View Sample Prescription
                        </a>
                    </div>
                </div>
            </div>

            {/* Sample Prescription Modal */}
            {showSampleModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '2rem'
                    }}
                    onClick={() => setShowSampleModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            padding: '2rem',
                            maxWidth: '800px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowSampleModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: '#e74c3c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                fontSize: '20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}
                        >
                            ×
                        </button>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2c3e50' }}>
                            Sample Prescription Format
                        </h3>
                        <div style={{ textAlign: 'center' }}>
                            <img
                                src={samplePrescriptionImg}
                                alt="Sample Prescription"
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#fff3cd',
                            borderRadius: '8px',
                            border: '1px solid #ffc107'
                        }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                                <strong>Note:</strong> This is a sample format. Your actual prescription should contain all the details shown above, including doctor's signature and clinic seal.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadPrescription;