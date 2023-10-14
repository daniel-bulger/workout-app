import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function WorkoutPlansPage() {
    const [workoutPlans, setWorkoutPlans] = useState([]);

    useEffect(() => {
        // Fetch all workout plans from the backend when the component mounts
        axios.get('http://localhost:5000/workout-plans')
             .then(response => {
                 setWorkoutPlans(response.data);
             });
    }, []);

    return (
        <div>
            <h1>Workout Plans</h1>
            <ul>
                {workoutPlans.map(plan => (
                    <li key={plan.id}>
                        {plan.name}
                        <Link to={`/modify-workout-plan/${plan.id}`}>
                            <button>Modify</button>
                        </Link>
                    </li>
                ))}
            </ul>
            
            <Link to="/create-workout-plan">Create New Workout Plan</Link>
        </div>
    );
}

export default WorkoutPlansPage;