import { createSlice } from '@reduxjs/toolkit';

export const workoutSlice = createSlice({
    name: 'workout',
    initialState: {
        workoutId: null,
        userId: null,
    },
    reducers: {
        setWorkoutId: (state, action) => {
            state.workoutId = action.payload;
        },
        setUserId: (state, action) => {
            state.userId = action.payload;
        },
    },
});

export const { setWorkoutId, setUserId } = workoutSlice.actions;

export const selectWorkoutId = (state) => state.workout.workoutId;
export const selectUserId = (state) => state.workout.userId;

export default workoutSlice.reducer;
