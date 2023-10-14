import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateWorkoutPage() {
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);

    const [allExercises, setAllExercises] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/exercises')
            .then(response => {
                setAllExercises(response.data);
            });
    }, []);

    useEffect(() => {
        // Fetch all workout plans from the server
        axios.get('http://localhost:5000/workout-plans')
            .then(response => {
                setWorkoutPlans(response.data);
            });
    }, []);

    useEffect(() => {
        // Fetch details of the selected workout plan
        if (selectedPlanId) {
            axios.get(`http://localhost:5000/workout-plans/${selectedPlanId}`)
                .then(response => {
                    setSelectedPlanDetails(response.data);
                });
        }
    }, [selectedPlanId]);

    const handleSubmit = () => {
        // Ensure a workout plan has been selected
        if (!selectedPlanId) {
            alert("Please select a workout plan.");
            return;
        }
    
        const workoutData = {
            plan_id: selectedPlanId
        };
    
        axios.post('http://localhost:5000/workouts', workoutData)
            .then(response => {
                if (response.status === 201) {
                    alert('Workout Created Successfully!');
                    // Optionally, you can redirect the user to another page or reset the form here.
                } else {
                    alert('There was an error creating the workout.');
                }
            })
            .catch(error => {
                console.error('There was an error sending the data:', error);
                alert('There was an error creating the workout.');
            });
    };

    const getExerciseName = (exerciseId) => {
        const exercise = allExercises.find(ex => ex.id === exerciseId);
        return exercise ? exercise.name : '';
    };

    return (
        <div>
            <h1>Create a New Workout</h1>
            
            <label>Select a Workout Plan:</label>
            <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)}>
                <option value="">Select a plan</option>
                {workoutPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
            </select>
    
            {selectedPlanDetails && (
                <div>
                    <h2>Plan Details</h2>
                    <ul>
                        {selectedPlanDetails.rounds.map((round, index) => (
                            <li key={index}>
                                <strong>Round {index + 1}:</strong>
                                <ul>
                                    <li>Set Count: {round.set_count}</li>
                                    <li>Exercises: {round.exercise_ids.map(id => getExerciseName(id)).join(', ')}</li>
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            )}            
            <button onClick={handleSubmit}>Create Workout</button>
        </div>
    );
}

export default CreateWorkoutPage;