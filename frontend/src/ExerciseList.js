import React, { useState, useEffect } from 'react';

function ExerciseList() {
    const [exercises, setExercises] = useState([]);

    useEffect(() => {
        // Fetch exercises from the backend
        fetch('http://127.0.0.1:5000/exercises')
            .then(response => response.json())
            .then(data => setExercises(data));
    }, []);

    return (
        <div>
            <h2>Exercises</h2>
            <ul>
                {exercises.map(exercise => (
                    <li key={exercise.id}>{exercise.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default ExerciseList;
