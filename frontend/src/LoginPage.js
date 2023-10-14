import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserId } from './workoutSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // <-- Added this import

function LoginPage() {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();  // <-- Get the navigate function

    useEffect(() => {
        // Fetch all users from the backend when the component mounts
        axios.get('http://localhost:5000/users').then(response => {
            setUsers(response.data);
        });
    }, []);

    const handleLogin = () => {
        dispatch(setUserId(selectedUserId));
        navigate('/');  // <-- Redirect to home page after login
    };

    const handleCreateUser = () => {
        axios.post('http://localhost:5000/users', { username: newUsername }).then(response => {
            const createdUserId = response.data.id;
            dispatch(setUserId(createdUserId));
            navigate('/');  // <-- Redirect to home page after creating and logging in
        });
    };

    return (
        <div>
            <h1>Login</h1>
            <div>
                <label>Select an existing user:</label>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                    <option value="">Select a user</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>
                <button onClick={handleLogin}>Login</button>
            </div>
            
            <h2>Or create a new user</h2>
            <div>
                <input 
                    type="text" 
                    value={newUsername}
                    placeholder="Enter new username"
                    onChange={(e) => setNewUsername(e.target.value)}
                />
                <button onClick={handleCreateUser}>Create and Login</button>
            </div>
        </div>
    );
}

export default LoginPage;
