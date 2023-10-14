import { useState, useEffect } from 'react';
import axios from 'axios';

function useWorkout(workoutId, userId) {
    const [workoutData, setWorkoutData] = useState(null);

    useEffect(() => {
        async function joinWorkout() {
            try {
                await axios.post(`http://localhost:5000/workouts/${workoutId}/join`, { user_id: userId });
                watchWorkout();
            } catch (error) {
                console.error("Failed to join workout:", error);
            }
        }

        function watchWorkout() {
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
        }

        joinWorkout();
    }, [workoutId, userId]);

    return workoutData;
}

export default useWorkout;
