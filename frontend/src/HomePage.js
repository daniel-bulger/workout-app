import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { selectWorkoutId, selectUserId } from './workoutSlice';



function HomePage() {
    const workoutId = useSelector(selectWorkoutId);
    const userId = useSelector(selectUserId);
    const [unfinishedWorkouts, setUnfinishedWorkouts] = useState([]);
    const [currentWorkoutProgress, setCurrentWorkoutProgress] = useState(null);
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const navigate = useNavigate();

    // Helper function to get the workout plan name using its id
    const getWorkoutPlanName = (planId) => {
        const plan = workoutPlans.find(p => p.id === planId);
        return plan ? plan.name : '';
    };

    const handleJoinWorkout = (workoutId) => {
        // Here, you'd send a request to the server to join this workout
        axios.post(`http://localhost:5000/workouts/${workoutId}/join`, { user_id: userId })
            .then(response => {
                if (response.status === 200) {
                    alert('Successfully joined the workout!');
                    // You can also redirect the user to the workout page or refresh the list of workouts
                } else {
                    alert('Failed to join the workout.');
                }
            })
            .catch(error => {
                console.error('Error joining the workout:', error);
                alert('Failed to join the workout.');
            });
    };


    useEffect(() => {
        // If no user is logged in, navigate to the login page
        if (!userId) {
            navigate('/login');
        } else {
            if (workoutId) {
                axios.get(`http://localhost:5000/workouts/${workoutId}/progress`)
                    .then(response => {
                        setCurrentWorkoutProgress(response.data);
                    });
            } else {
                axios.get('http://localhost:5000/workouts/unfinished')
                    .then(response => {
                        setUnfinishedWorkouts(response.data);
                    });
            }
        }
    }, [userId, workoutId, navigate]);

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

    return (
        <div>
            <h1>Welcome to the Workout App</h1>
            
            {workoutId && currentWorkoutProgress ? (
                <div>
                    <h2>Your Current Workout Progress:</h2>
                    {/* Display the workout progress details here */}
                    <p>Workout Details: {currentWorkoutProgress.details}</p>
                </div>
            ) : (
                <div>
                    <h2>Available Workouts to Join:</h2>
                    <ul>
                        {unfinishedWorkouts.map(workout => (
                            <li key={workout.id}>
                                {new Date(workout.creation_time).toISOString().split('T')[0]} : {getWorkoutPlanName(workout.plan_id)}
                                <button onClick={() => handleJoinWorkout(workout.id)}>Join</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default HomePage;