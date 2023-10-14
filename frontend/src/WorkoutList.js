import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link

function WorkoutList() {
    const [workouts, setWorkouts] = useState([]);
    const [workoutPlans, setWorkoutPlans] = useState([]);  // NEW: to store the workout plans

    useEffect(() => {
        axios.get('http://localhost:5000/workouts')
            .then(response => {
                if (Array.isArray(response.data.workouts)) {
                    setWorkouts(response.data.workouts);
                } else {
                    console.error('Expected an array for "workouts" from server, but got:', response.data);
                }
            });
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/workout-plans')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setWorkoutPlans(response.data);
                } else {
                    console.error('Expected an array for "workout-plans" from server, but got:', response.data);
                }
            });
    }, []);

    const handleDeleteWorkout = (workoutId) => {
        axios.delete(`http://localhost:5000/workouts/${workoutId}`)
             .then(() => {
                 setWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout.id !== workoutId));
             });
    };  

    // Helper function to get the workout plan name using its id
    const getWorkoutPlanName = (planId) => {
        const plan = workoutPlans.find(p => p.id === planId);
        return plan ? plan.name : '';
    };
    
    return (
        <div>
            <div>
                <Link to="/create-workout">Create New Workout</Link>
            </div>

            <h2>Available Workouts</h2>
            <ul>
                {workouts.map(workout => (
                    <li key={workout.id}>
                        {new Date(workout.creation_time).toISOString().split('T')[0]} : {getWorkoutPlanName(workout.plan_id)}
                        <button onClick={() => handleDeleteWorkout(workout.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default WorkoutList;
