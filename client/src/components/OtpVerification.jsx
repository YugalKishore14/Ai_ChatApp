import React, { useState } from 'react';
import axios from 'axios';

const OtpVerification = ({ email }) => {
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                email,
                otp
            });

            setMessage(res.data.message || 'OTP Verified Successfully ✅');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Verification failed ❌');
        }

        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <h2>Enter OTP</h2>
            <form onSubmit={handleVerifyOtp} style={styles.form}>
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    required
                    style={styles.input}
                />
                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        maxWidth: 400,
        margin: 'auto',
        padding: 20,
        border: '1px solid #ccc',
        borderRadius: 8,
        textAlign: 'center'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
    },
    input: {
        padding: 10,
        fontSize: 16
    },
    button: {
        padding: 10,
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer'
    },
    message: {
        marginTop: 10,
        fontWeight: 'bold'
    }
};

export default OtpVerification;
