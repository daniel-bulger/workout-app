import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import WorkoutComponent from './WorkoutComponent';
import WorkoutList from './WorkoutList';
import NavBar from './NavBar';
import WorkoutPlansPage from './WorkoutPlansPage';
import WorkoutPlanCreationPage from './WorkoutPlanCreationPage';
import ExercisePage from './ExercisePage';
import CreateWorkoutPage from './CreateWorkoutPage';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/workouts" element={<WorkoutList />} />
        <Route path="/create-workout" element={<CreateWorkoutPage />} />
        <Route path="/workout" element={<WorkoutComponent />} />  // Assuming you have a WorkoutComponent
        <Route path="/workout-plans" element={<WorkoutPlansPage />} />
        <Route path="/create-workout-plan" element={<WorkoutPlanCreationPage />} />
        <Route path="/modify-workout-plan/:planId" element={<WorkoutPlanCreationPage />} />
        <Route path="/exercises" element={<ExercisePage />} />
      </Routes>
    </Router>
  );
}

export default App;