import React, { useState } from 'react';
import { sendPrescriptionForAppointment } from '../services/doctorService';
import './PrescriptionUploadModal.css';

const PrescriptionUploadModal = ({ appointment, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) {
            setFile(null);
            setPreview(null);
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Please select a valid file (JPEG, PNG, or PDF)');
            setFile(null);
            setPreview(null);
            return;
        }

        // Validate file size (5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            setFile(null);
            setPreview(null);
            return;
        }

        setError('');
        setFile(selectedFile);

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('prescription', file);

            const response = await sendPrescriptionForAppointment(appointment._id, formData);

            if (response.data.success) {
                onSuccess(response.data.appointment);
                onClose();
            }
        } catch (err) {
            console.error('Error uploading prescription:', err);
            setError(err.response?.data?.message || 'Failed to upload prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Upload Prescription</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="appointment-info">
                        <p><strong>Patient:</strong> {appointment.patientId?.name || 'Unknown'}</p>
                        <p><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {appointment.timeSlot}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="prescription-file">
                                Select Prescription File (PDF or Image)
                            </label>

                            {/* Hidden file input */}
                            <input
                                type="file"
                                id="prescription-file"
                                accept=".pdf,image/jpeg,image/jpg,image/png"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            {/* Visible button to trigger file selection */}
                            <button
                                type="button"
                                className="file-select-button"
                                onClick={() => document.getElementById('prescription-file').click()}
                            >
                                📁 Choose File
                            </button>

                            {/* Show selected file name */}
                            {file && (
                                <div className="selected-file-info">
                                    ✅ Selected: <strong>{file.name}</strong>
                                    <span className="file-size">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                            )}

                            <p className="help-text">
                                Accepted formats: PDF, JPEG, PNG • Max size: 5MB
                            </p>
                        </div>

                        {preview && (
                            <div className="preview-container">
                                <p><strong>Preview:</strong></p>
                                <img src={preview} alt="Prescription preview" className="preview-image" />
                            </div>
                        )}

                        {file && !preview && (
                            <div className="file-info">
                                <p>📄 {file.name}</p>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !file}
                            >
                                {loading ? 'Uploading...' : 'Upload & Send'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionUploadModal;
