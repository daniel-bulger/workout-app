import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function WorkoutPlanCreationPage() {
    const [planName, setPlanName] = useState('');
    const [exercises, setExercises] = useState([]); // List of all available exercises
    const [rounds, setRounds] = useState([]); // List of {setCount: x, selectedExercises: [x, y, z]}
    const { planId } = useParams();

    useEffect(() => {
        if (planId) {  // if editing an existing plan
            axios.get(`http://localhost:5000/workout-plans/${planId}`).then(response => {
                const planData = response.data;
                setPlanName(planData.name);
                
                const roundsData = planData.rounds.map(r => ({
                    setCount: r.set_count,
                    selectedExercises: r.exercise_ids
                }));
                setRounds(roundsData);
            });
        }
        }, [planId]);    

    useEffect(() => {
        // Load available exercises from the server
        axios.get('http://localhost:5000/exercises')
             .then(response => {
                 setExercises(response.data);
             });
    }, []);

    const addRound = () => {
        // Create a new round with default values
        const newRound = {
            setCount: 3,  // default set count
            selectedExercises: []  // empty exercise list
        };

        // Add the new round to the rounds state
        setRounds(prevRounds => [...prevRounds, newRound]);
    };

    const updateRound = (index, updatedRound) => {
        const newRounds = [...rounds];
        newRounds[index] = updatedRound;
        setRounds(newRounds);
    };

    const removeRound = (index) => {
        const newRounds = [...rounds];
        newRounds.splice(index, 1);
        setRounds(newRounds);
    };

    const handleSubmit = () => {
        // Construct the data object for the new workout plan
        const workoutPlanData = {
            name: planName,
            rounds: rounds.map(round => ({
                set_count: round.setCount,
                exercises: round.selectedExercises
            }))
        };
    
        if (planId) {
            // Update existing workout plan
            axios.put(`http://localhost:5000/workout-plans/${planId}`, workoutPlanData)
                .then(response => {
                    if (response.status === 200) {
                        alert('Workout Plan Updated Successfully!');
                    } else {
                        alert('There was an error updating the workout plan.');
                    }
                })
                .catch(error => {
                    console.error('There was an error sending the data:', error);
                    alert('There was an error updating the workout plan.');
                });
        } else {
            // Create a new workout plan
            axios.post('http://localhost:5000/workout-plans', workoutPlanData)
                .then(response => {
                    if (response.status === 201) {
                        alert('Workout Plan Created Successfully!');
                    } else {
                        alert('There was an error creating the workout plan.');
                    }
                })
                .catch(error => {
                    console.error('There was an error sending the data:', error);
                    alert('There was an error creating the workout plan.');
                });
        }
    };
    
    return (
        <div>
            <h1>Create a New Workout Plan</h1>
            
            <input 
                type="text" 
                value={planName}
                placeholder="Plan Name"
                onChange={(e) => setPlanName(e.target.value)}
            />

            {rounds.map((round, index) => (
                <RoundInput 
                    key={index} 
                    round={round} 
                    exercises={exercises} 
                    onUpdate={(updatedRound) => updateRound(index, updatedRound)}
                    onRemove={() => removeRound(index)}
                />
            ))}

            <button onClick={addRound}>Add Round</button>
            <button onClick={handleSubmit}>
                {planId ? 'Update Workout Plan' : 'Create Workout Plan'}
            </button>
        </div>
    );
}

function RoundInput({ round, exercises, onUpdate, onRemove }) {
    const [setCount, setSetCount] = useState(round.setCount);
    const [selectedExercises, setSelectedExercises] = useState(round.selectedExercises || []);

    const handleSetCountChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setSetCount(value);
        onUpdate({ ...round, setCount: value });
    };

    const handleExerciseChange = (exerciseId) => {
        let updatedExercises;
        if (selectedExercises.includes(exerciseId)) {
            updatedExercises = selectedExercises.filter(id => id !== exerciseId);
        } else {
            updatedExercises = [...selectedExercises, exerciseId];
        }
        setSelectedExercises(updatedExercises);
        onUpdate({ ...round, selectedExercises: updatedExercises });
    };

    return (
        <div>
            <label>Set Count:</label>
            <input 
                type="number" 
                value={setCount}
                onChange={handleSetCountChange}
            />
            <div>
                <label>Select Exercises:</label>
                {exercises.map(exercise => (
                    <div key={exercise.id}>
                        <input 
                            type="checkbox" 
                            checked={selectedExercises.includes(exercise.id)}
                            onChange={() => handleExerciseChange(exercise.id)}
                        />
                        {exercise.name}
                    </div>
                ))}
            </div>
            <button onClick={onRemove}>Remove Round</button>
        </div>
    );
}

export default WorkoutPlanCreationPage;