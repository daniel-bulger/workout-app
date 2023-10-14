import json
from flask import Flask, jsonify, request
from flask import stream_with_context, Response
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from models import Exercise, ExerciseRound, LiftRecord, User, Workout, WorkoutPlan, Base, engine
from flask_cors import CORS
from sqlalchemy.orm.exc import NoResultFound

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"])


# Create a session to interact with the database
Session = sessionmaker(bind=engine)
session = scoped_session(Session)

@app.route('/')
def index():
    return "Workout Tracker API"

@app.route('/exercises', methods=['GET', 'POST'])
def exercises_route():
    if request.method == 'POST':
        # Add a new exercise
        data = request.json
        exercise = Exercise(name=data['name'], description=data.get('description', ''),
                            tutorial_link=data.get('tutorial_link', ''),
                            recommended_rep_count=data.get('recommended_rep_count', 0))
        session.add(exercise)
        try:
            session.commit()
            return jsonify({"message": "Exercise added", "id": exercise.id}), 201
        except Exception as e:
            session.rollback()
            return jsonify({"error": str(e)}), 500        
    else:
        # Retrieve all exercises
        exercises = session.query(Exercise).all()
        return jsonify([exercise.as_dict() for exercise in exercises])

@app.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
        # Retrieve all users
        users = session.query(User).all()
        return jsonify([user.as_dict() for user in users])

    elif request.method == 'POST':
        # Create a new user
        data = request.json
        new_user = User(username=data['username'])  # Add more fields if needed
        session.add(new_user)
        try:
            session.commit()
            return jsonify({"message": "User added", "id": new_user.id}), 201
        except Exception as e:
            session.rollback()
            return jsonify({"error": str(e)}), 500

@app.route('/workout-plans', methods=['GET'])
def get_workout_plans():
    plans = session.query(WorkoutPlan).all()
    return jsonify([{
        'id': plan.id,
        'name': plan.name,
        'rounds': [{'id': round.id, 'exercise_ids': [exercise.id for exercise in round.exercises]} for round in plan.rounds]
    } for plan in plans])

@app.route('/workout-plans', methods=['POST'])
def add_workout_plan():
    data = request.json
    plan_name = data.get('name', '').strip()
    rounds = data.get('rounds', [])

    if not plan_name:
        return jsonify({'error': 'Workout plan name is required!'}), 400

    new_plan = WorkoutPlan(name=plan_name)
    for round_data in rounds:
        exercise_ids = round_data.get('exercises', [])  # changed 'exercise_ids' to 'exercises'
        set_count = round_data.get('set_count', 1)  # added set_count handling
        new_round = ExerciseRound(
            set_count=set_count,  # added set_count
            exercises=[session.query(Exercise).get(ex_id) for ex_id in exercise_ids]
        )
        new_plan.rounds.append(new_round)

    session.add(new_plan)
    try:
        session.commit()
        return jsonify({'id': new_plan.id, 'name': new_plan.name}), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': 'An error occurred while adding the workout plan: {}'.format(e)}), 500

@app.route('/workout-plans/<int:plan_id>', methods=['GET'])
def get_workout_plan(plan_id):
    workout_plan = session.query(WorkoutPlan).filter_by(id=plan_id).first()
    if not workout_plan:
        return jsonify({"error": "Workout plan not found"}), 404
    
    response_data = {
        "id": workout_plan.id,
        "name": workout_plan.name,
        "rounds": [
            {
                "id": round.id,
                "set_count": round.set_count,
                "exercise_ids": [exercise.id for exercise in round.exercises]
            }
            for round in workout_plan.rounds
        ] if workout_plan.rounds else []
    }
    return jsonify(response_data)

@app.route('/workout-plans/<int:plan_id>', methods=['PUT'])
def modify_workout_plan(plan_id):
    data = request.json
    plan_name = data.get('name', '').strip()
    rounds_data = data.get('rounds', [])

    plan = session.query(WorkoutPlan).filter_by(id=plan_id).first()
    if not plan:
        return jsonify({'error': 'WorkoutPlan not found'}), 404

    if not plan_name:
        return jsonify({'error': 'Workout plan name is required!'}), 400

    # Update plan name
    plan.name = plan_name

    # Handle rounds
    # For simplicity, I'm deleting all existing rounds and recreating them.
    # You could optimize this to modify only changed rounds in a real-world scenario.
    for round_obj in plan.rounds:
        session.delete(round_obj)

    for round_data in rounds_data:
        exercise_ids = round_data.get('exercises', [])
        set_count = round_data.get('set_count', 1)
        new_round = ExerciseRound(
            set_count=set_count,
            exercises=[session.query(Exercise).get(ex_id) for ex_id in exercise_ids]
        )
        plan.rounds.append(new_round)

    try:
        session.commit()
        return jsonify({'id': plan.id, 'name': plan.name}), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': 'An error occurred while modifying the workout plan: {}'.format(e)}), 500

@app.route('/workouts/in-progress', methods=['GET'])
def list_in_progress_workouts():
    # Assuming a field in the Workout model indicating if it's in progress
    workouts = session.query(Workout).filter_by(in_progress=True).all()
    return jsonify(workouts=[workout.as_dict() for workout in workouts])


# Helper function to check if a workout is unfinished
def is_workout_unfinished(workout):
    if not workout.state:
        return True
    return workout.state.rounds_completed < len(workout.plan.rounds)

@app.route('/workouts/unfinished', methods=['GET'])
def get_unfinished_workouts():
    # Fetch all workouts
    all_workouts = session.query(Workout).all()
    
    # Filter out the workouts which are in progress
    unfinished_workouts = [workout for workout in all_workouts if is_workout_unfinished(workout)]

    # Convert the result to JSON format
    result = [{
        'id': workout.id,
        'plan_id': workout.plan_id,
        'creation_time': workout.creation_time.strftime('%Y-%m-%d %H:%M:%S')
    } for workout in unfinished_workouts]

    return jsonify(result)


@app.route('/workouts', methods=['GET'])
def list_all_workouts():
    workouts = session.query(Workout).all()
    return jsonify(workouts=[workout.as_dict() for workout in workouts])

@app.route('/workouts', methods=['POST'])
def add_workout():
    data = request.json
    plan_id = data.get('plan_id')

    # Check if plan_id is provided
    if not plan_id:
        return jsonify({'error': 'Workout plan ID is required!'}), 400

    # Create a new workout instance using the provided plan_id
    new_workout = Workout(plan_id=plan_id)

    # Add to database
    session.add(new_workout)
    try:
        session.commit()
        return jsonify({'id': new_workout.id, 'plan_id': new_workout.plan_id}), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': 'An error occurred while adding the workout: {}'.format(e)}), 500


@app.route('/workouts/<int:workout_id>/join', methods=['POST'])
def join_workout(workout_id):
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        # Fetch the workout and user by their IDs
        workout = session.query(Workout).filter_by(id=workout_id).one()
        user = session.query(User).filter_by(id=user_id).one()

        # Check if the user is already a participant
        if user in workout.participants:
            return jsonify({"error": "User is already a participant in this workout"}), 400
        
        # Add the user to the workout's participants
        workout.participants.append(user)
        session.commit()

        return jsonify({"message": "Successfully joined the workout"}), 200

    except NoResultFound:
        return jsonify({"error": "Workout or User not found"}), 404
    except Exception as e:
        session.rollback()
        return jsonify({"error": "An error occurred: {}".format(e)}), 500

@app.route('/workouts/<int:workout_id>/advance', methods=['POST'])
def advance_workout(workout_id):
    # Here, we'd typically update the state of the workout.
    # For simplicity, let's increment a rounds_completed field in the Workout model.
    workout = session.query(Workout).filter_by(id=workout_id).first()
    if not workout:
        return jsonify({"error": "Workout not found"}), 404
    workout.rounds_completed += 1
    session.commit()
    return jsonify({"message": "Workout advanced", "rounds_completed": workout.rounds_completed})

@app.route('/workouts/<int:workout_id>/watch', methods=['GET'])
def watch_workout(workout_id):
    def generate():
        # Here we would typically have a loop or some mechanism to check for updates.
        # For this example, I'm simulating a simple update every 5 seconds.
        import time
        count = 0
        while count < 5:  # Send 5 updates and then stop for demonstration purposes
            time.sleep(5)
            count += 1
            # Fetch the current workout state from the database
            workout = session.query(Workout).filter_by(id=workout_id).first()
            if not workout:
                yield "data: {}\n\n"
            else:
                yield f"data: {json.dumps(workout.as_dict())}\n\n"
            
    return Response(stream_with_context(generate()), content_type='text/event-stream')

@app.route('/lifts', methods=['POST'])
def record_lift():
    data = request.json
    lift_record = LiftRecord(
        user_id=data['lift_record']['user_id'],
        exercise_id=data['lift_record']['exercise_id'],
        pounds=data['lift_record']['pounds'],
        reps=data['lift_record']['reps'],
        # ... Add other fields ...
    )
    session.add(lift_record)
    session.commit()
    return jsonify({"message": "Lift recorded"})














@app.teardown_appcontext
def remove_session(exception=None):
    session.remove()

if __name__ == '__main__':
    app.run(debug=True)