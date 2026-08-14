import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadPrescription } from '../services/pharmacistService';
import { validateFile } from '../utils/fileUploadUtils';
import { showSuccessToast } from '../utils/toast';
import './Auth.css';

const AdvancedUploadPrescription = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [prescriptionData, setPrescriptionData] = useState({
        diagnosis: '',
        notes: ''
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            const validation = validateFile(selectedFile, allowedTypes, maxSize);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPrescriptionData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a prescription file');
            return;
        }

        setLoading(true);
        setError('');
        setUploadProgress(0);

        try {
            // Create FormData to send the actual file
            const formData = new FormData();
            formData.append('prescriptionFile', file);

            // Add additional prescription data
            Object.keys(prescriptionData).forEach(key => {
                if (prescriptionData[key]) {
                    formData.append(key, prescriptionData[key]);
                }
            });

            // Use the service function to upload prescription with progress tracking
            const response = await uploadPrescription(formData, setUploadProgress);

            if (response.order) {
                showSuccessToast('Prescription uploaded successfully!');
                navigate(`/view-order/${response.order._id}`);
            }
        } catch (err) {
            console.error('Error uploading prescription:', err);
            setError(err.message || 'Failed to upload prescription. Please try again.');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Upload Prescription</h2>
                <p>Hello {user?.name}, please upload your prescription</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Prescription File (Image/PDF)</label>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="file-input"
                            required
                        />
                        <div className="file-hint">
                            Supported formats: JPEG, JPG, PNG, GIF, PDF (Max size: 5MB)
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Diagnosis (Optional)</label>
                        <textarea
                            name="diagnosis"
                            value={prescriptionData.diagnosis}
                            onChange={handleInputChange}
                            className="form-input"
                            rows="3"
                            placeholder="Enter diagnosis information"
                        />
                    </div>

                    <div className="form-group">
                        <label>Additional Notes (Optional)</label>
                        <textarea
                            name="notes"
                            value={prescriptionData.notes}
                            onChange={handleInputChange}
                            className="form-input"
                            rows="3"
                            placeholder="Any additional information for the pharmacist"
                        />
                    </div>

                    {preview && (
                        <div className="file-preview">
                            <h4>Preview:</h4>
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
                            <div className="progress-text">{uploadProgress}% uploaded</div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
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
    );
};

export default AdvancedUploadPrescription;