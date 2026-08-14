import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import './DoctorSchedulePage.css';

const DoctorSchedulePage = () => {
    const [weeklySchedule, setWeeklySchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchWeeklySchedule();
    }, []);

    const fetchWeeklySchedule = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/doctor/weekly-schedule', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWeeklySchedule(res.data);
        } catch (err) {
            console.error('Error fetching weekly schedule:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (index, field, value) => {
        const updated = [...weeklySchedule];
        updated[index][field] = value;
        setWeeklySchedule(updated);
        setHasChanges(true);
    };

    const handleAvailabilityToggle = (index) => {
        const updated = [...weeklySchedule];
        updated[index].isAvailable = !updated[index].isAvailable;
        setWeeklySchedule(updated);
        setHasChanges(true);
    };

    const handleSaveSchedule = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/doctor/weekly-schedule',
                { weeklySchedule },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSuccessToast('Schedule saved successfully!');
            setHasChanges(false);
        } catch (err) {
            console.error('Error saving schedule:', err);
            showErrorToast('Failed to save schedule');
        }
    };

    return (
        <div className="doctor-schedule-page">
            <div className="content-header">
                <div>
                    <h1>Manage Schedule</h1>
                    <p className="subtitle">Set your availability and appointment slots</p>
                </div>
                {hasChanges && (
                    <button className="btn btn-primary" onClick={handleSaveSchedule}>
                        Save Changes
                    </button>
                )}
            </div>

            <div className="schedule-container">
                <div className="working-hours-section">
                    <h2>Working Hours</h2>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="schedule-rows">
                            {weeklySchedule.map((day, index) => (
                                <div key={day.day} className="schedule-row">
                                    <div className="day-name">{day.day}</div>

                                    <div className="time-inputs">
                                        <div className="time-input-group">
                                            <input
                                                type="time"
                                                value={day.startTime}
                                                onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                                                disabled={!day.isAvailable}
                                                className="time-input"
                                            />
                                            <span className="time-icon">🕐</span>
                                        </div>

                                        <span className="time-separator">to</span>

                                        <div className="time-input-group">
                                            <input
                                                type="time"
                                                value={day.endTime}
                                                onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                                                disabled={!day.isAvailable}
                                                className="time-input"
                                            />
                                            <span className="time-icon">🕐</span>
                                        </div>
                                    </div>

                                    <div className="availability-toggle">
                                        <label className="checkbox-container">
                                            <input
                                                type="checkbox"
                                                checked={day.isAvailable}
                                                onChange={() => handleAvailabilityToggle(index)}
                                            />
                                            <span className="checkmark"></span>
                                            <span className="checkbox-label">Available</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorSchedulePage;
