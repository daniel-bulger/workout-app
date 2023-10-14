import React, { useState, useEffect } from 'react';

function WorkoutWatcher({ workoutId }) {
    const [workoutData, setWorkoutData] = useState(null);

    useEffect(() => {
        const eventSource = new EventSource(`http://localhost:5000/workouts/${workoutId}/watch`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setWorkoutData(data);
        };

        eventSource.onerror = (error) => {
            console.error("EventSource failed:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [workoutId]);

    return (
        <div>
            {workoutData ? (
                <div>
                    {/* Render the workout data here */}
                    <pre>{JSON.stringify(workoutData, null, 2)}</pre>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default WorkoutWatcher;