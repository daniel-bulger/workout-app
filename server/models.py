# SQLAlchemy model definitions based on the provided protobuf data model

import datetime
from sqlalchemy import ARRAY, create_engine, Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from sqlalchemy.dialects.postgresql import JSON


from sqlalchemy import create_engine
engine = create_engine('sqlite:///workout_tracker.db')

Base = declarative_base()

# Association table for many-to-many relationship between ExerciseRound and Exercise
exercise_round_association = Table('exercise_round_association', Base.metadata,
                                  Column('exercise_id', Integer, ForeignKey('exercises.id')),
                                  Column('exercise_round_id', Integer, ForeignKey('exercise_rounds.id'))
                                  )

class BaseModel(Base):
    __abstract__ = True  # Declare class as abstract so it won't be mapped to a table

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

# Define the User model
class User(BaseModel):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False, unique=True)
    display_name = Column(String)
    preferred_ordering_index = Column(Integer)
    lift_records = relationship('LiftRecord', backref='user')

# Define the Exercise model
class Exercise(BaseModel):
    __tablename__ = 'exercises'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    tutorial_link = Column(String)
    recommended_rep_count = Column(Integer)

# Define the WorkoutPlan model
class WorkoutPlan(BaseModel):
    __tablename__ = 'workout_plans'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    rounds = relationship('ExerciseRound', backref='workout_plan')

# Define the ExerciseRound model
class ExerciseRound(BaseModel):
    __tablename__ = 'exercise_rounds'

    id = Column(Integer, primary_key=True)
    workout_plan_id = Column(Integer, ForeignKey('workout_plans.id'))
    set_count = Column(Integer)
    # Exercises can be done in parallel within a round.
    exercises = relationship('Exercise', secondary=exercise_round_association, backref='exercise_rounds')

# Define the LiftRecord model
class LiftRecord(BaseModel):
    __tablename__ = 'lift_records'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    exercise_id = Column(Integer, ForeignKey('exercises.id'))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    pounds = Column(Float)
    reps = Column(Integer)
    is_confirmed = Column(Boolean, default=False)
    workout_plan_id = Column(Integer, ForeignKey('workout_plans.id'))
    set_index = Column(Integer)

workout_user_association = Table('workout_user_association', Base.metadata,
    Column('workout_id', Integer, ForeignKey('workouts.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

# Define the Workout model
class Workout(BaseModel):
    __tablename__ = 'workouts'

    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey('workout_plans.id'))
    creation_time = Column(DateTime, default=datetime.datetime.utcnow)
    state = relationship('WorkoutState', uselist=False, backref='workout')
    participants = relationship('User', secondary=workout_user_association, backref='participating_workouts')

# Define the WorkoutState model
class WorkoutState(BaseModel):
    __tablename__ = 'workout_states'

    id = Column(Integer, primary_key=True)
    workout_id = Column(Integer, ForeignKey('workouts.id'))
    rounds_completed = Column(Integer)
    current_round = Column(Integer)
    current_set = Column(Integer)
    completed_exercises = Column(JSON)



