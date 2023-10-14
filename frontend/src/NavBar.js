// NavBar.js

import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/workouts">Manage Workouts</Link></li>
                <li><Link to="/workout-plans">Workout Plans</Link></li>
                <li><Link to="/exercises">Exercises</Link></li>
            </ul>
        </nav>
    );
}

export default NavBar;
