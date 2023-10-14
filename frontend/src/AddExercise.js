import React, { useState } from 'react';

function AddExercise() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tutorialLink, setTutorialLink] = useState('');
    const [recommendedRepCount, setRecommendedRepCount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();  // Prevent default form submission behavior

        const exerciseData = {
            name,
            description,
            tutorial_link: tutorialLink,
            recommended_rep_count: recommendedRepCount
        };

        fetch('http://127.0.0.1:5000/exercises', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(exerciseData)
        })
        .then(response => response.json())
        .then(data => {
            if(data.message === 'Exercise added') {
                // Reset the form or give some feedback to the user
                setName('');
                setDescription('');
                setTutorialLink('');
                setRecommendedRepCount('');
                alert('Exercise added successfully!');
            }
        });
    };

    return (
        <div>
            <h2>Add Exercise</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Exercise name"
                    required
                />
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Description"
                />
                <input
                    type="url"
                    value={tutorialLink}
                    onChange={e => setTutorialLink(e.target.value)}
                    placeholder="Tutorial Link (optional)"
                />
                <input
                    type="number"
                    value={recommendedRepCount}
                    onChange={e => setRecommendedRepCount(e.target.value)}
                    placeholder="Recommended Rep Count"
                />
                <button type="submit">Add Exercise</button>
            </form>
        </div>
    );
}

export default AddExercise;
