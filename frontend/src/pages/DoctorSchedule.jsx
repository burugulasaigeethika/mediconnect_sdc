import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [newSlot, setNewSlot] = useState({
        day: 'Monday',
        startTime: '09:00',
        endTime: '17:00'
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/doctors/schedule');
            setSchedule(response.data.schedule || []);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load schedule' });
        } finally {
            setLoading(false);
        }
    };

    const addSlot = () => {
        if (newSlot.startTime >= newSlot.endTime) {
            setMessage({ type: 'error', text: 'End time must be after start time' });
            return;
        }

        const updatedSchedule = [...schedule, { ...newSlot }];
        setSchedule(updatedSchedule);
        setNewSlot({ day: 'Monday', startTime: '09:00', endTime: '17:00' });
    };

    const removeSlot = (index) => {
        const updatedSchedule = schedule.filter((_, i) => i !== index);
        setSchedule(updatedSchedule);
    };

    const saveSchedule = async () => {
        try {
            setLoading(true);
            await axios.put('/api/doctors/schedule', { availableSlots: schedule });
            setMessage({ type: 'success', text: 'Schedule updated successfully!' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update schedule'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="schedule-page">
            <div className="container">
                <h1>Manage Your Schedule</h1>
                <p>Set your available time slots for patient appointments</p>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="schedule-grid">
                    <div className="add-slot-section">
                        <h2>Add New Slot</h2>
                        <div className="form-group">
                            <label>Day</label>
                            <select
                                value={newSlot.day}
                                onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                                className="form-input"
                            >
                                {days.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>

                        <div className="time-inputs">
                            <div className="form-group">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    value={newSlot.startTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    value={newSlot.endTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <button onClick={addSlot} className="btn btn-secondary">
                            Add Slot
                        </button>
                    </div>

                    <div className="current-schedule">
                        <h2>Current Schedule</h2>
                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : schedule.length > 0 ? (
                            <div className="slots-list">
                                {schedule.map((slot, index) => (
                                    <div key={index} className="slot-card">
                                        <div className="slot-info">
                                            <strong>{slot.day}</strong>
                                            <span>{slot.startTime} - {slot.endTime}</span>
                                        </div>
                                        <button
                                            onClick={() => removeSlot(index)}
                                            className="btn-remove"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-state">No slots added yet. Add your first slot!</p>
                        )}

                        <button
                            onClick={saveSchedule}
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Schedule'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorSchedule;
