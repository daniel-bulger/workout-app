import React from 'react';
import useWorkout from './useWorkout';

function WorkoutComponent({ workoutId, userId }) {
    const workoutData = useWorkout(workoutId, userId);

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

export default WorkoutComponent;