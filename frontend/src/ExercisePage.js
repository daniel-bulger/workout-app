import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ExercisePage() {
    const [exercises, setExercises] = useState([]);
    const [newExercise, setNewExercise] = useState({
        name: '',
        description: '',
        tutorial_link: '',
        recommended_rep_count: ''
    });

    useEffect(() => {
        // Fetch all exercises from the backend when the component mounts
        axios.get('http://localhost:5000/exercises')
             .then(response => {
                 setExercises(response.data);
             });
    }, []);

    const handleAddExercise = () => {
        axios.post('http://localhost:5000/exercises', newExercise)
             .then(response => {
                 // Reload exercises after adding a new one
                 return axios.get('http://localhost:5000/exercises');
             }).then(response => {
                 setExercises(response.data);
                 setNewExercise({
                     name: '',
                     description: '',
                     tutorial_link: '',
                     recommended_rep_count: ''
                 });  // Clear the form
             });
    };

    return (
        <div>
            <h1>Exercises</h1>
            <ul>
                {exercises.map(exercise => (
                    <li key={exercise.id}>{exercise.name}</li>
                ))}
            </ul>
            <h2>Add New Exercise</h2>
            <div>
                <input 
                    type="text" 
                    value={newExercise.name}
                    placeholder="Name"
                    onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                />
                <textarea 
                    value={newExercise.description}
                    placeholder="Description"
                    onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                />
                <input 
                    type="text" 
                    value={newExercise.tutorial_link}
                    placeholder="Tutorial Link"
                    onChange={(e) => setNewExercise({...newExercise, tutorial_link: e.target.value})}
                />
                <input 
                    type="number" 
                    value={newExercise.recommended_rep_count}
                    placeholder="Recommended Rep Count"
                    onChange={(e) => setNewExercise({...newExercise, recommended_rep_count: e.target.value})}
                />
                <button onClick={handleAddExercise}>Add Exercise</button>
            </div>
        </div>
    );
}

export default ExercisePage;
