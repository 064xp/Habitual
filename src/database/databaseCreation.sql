-- Database: habitual

-- DROP DATABASE habitual;

CREATE DATABASE habitual
    WITH
    OWNER = habitual
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

CREATE TABLE Users (
	userID SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	password CHAR(60) NOT NULL
);

CREATE TABLE HabitTypes (
	typeID INTEGER PRIMARY KEY NOT NULL,
	name VARCHAR(50) UNIQUE NOT NULL,
	days INTEGER UNIQUE NOT NULL
);

CREATE TABLE Habits (
	habitID SERIAL PRIMARY KEY NOT NULL,
	userID INTEGER REFERENCES Users (userID) NOT NULL,
	name VARCHAR(200) NOT NULL,
	frequency INTEGER NOT NULL,
	type INTEGER REFERENCES HabitTypes (typeID) NOT NULL,
	startDate DATE NOT NULL,
	daysPending INTEGER NOT NULL
);

CREATE TABLE History (
	entryID SERIAL PRIMARY KEY NOT NULL,
	habitID INTEGER REFERENCES Habits (habitID) NOT NULL,
	dateTime TIMESTAMP NOT NULL
);

-- Stored Procedures
CREATE OR REPLACE PROCEDURE insertHabit(
	_name VARCHAR(200),
	_userID INTEGER,
	_frequency INTEGER,
	_type INTEGER,
	_startDate DATE = CURRENT_DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
	typeDays INTEGER;
BEGIN
	SELECT days INTO typeDays FROM HabitTypes WHERE typeID = _type;
	IF NOT FOUND THEN
		RAISE EXCEPTION 'Invalid habit type %', type;
		RETURN;
	END IF;
	INSERT INTO Habits (userID, name, frequency, type, startDate, daysPending)
		VALUES (_userID, _name, _frequency, _type, _startDate, typeDays);
	RAISE NOTICE 'success';
END
$$;

CREATE OR REPLACE PROCEDURE insertUser(
	_name VARCHAR(100),
	_email VARCHAR(100),
	_password CHAR(60)
)
LANGUAGE plpgsql
AS $$
BEGIN
	INSERT INTO Users (name, email, password)
		VALUES (_name, _email, _password);
	EXCEPTION
		WHEN unique_violation THEN
			RAISE EXCEPTION 'Email is already in use';
END
$$;

CREATE OR REPLACE PROCEDURE updateHabit(
	_habitID INTEGER,
	_name VARCHAR(200),
	_frequency INTEGER,
	_type INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE Habits SET name=_name, frequency=_frequency, type=_type
		WHERE habitID = _habitID;
END
$$;

CREATE OR REPLACE PROCEDURE deleteHabit(
	_habitID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
	DELETE FROM History WHERE habitID = _habitID;
	DELETE FROM Habits WHERE habitID = _habitID;
END
$$;

CREATE OR REPLACE PROCEDURE insertActivity(
	_habitID INTEGER,
	_dateTime TIMESTAMP= CURRENT_DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
	INSERT INTO History (habitID, dateTime)
		VALUES (_habitID,_dateTime);
END
$$;

-- Trigger
CREATE TRIGGER tr_updateDaysPending
AFTER UPDATE ON Habits
FOR EACH ROW
	EXECUTE PROCEDURE updateDaysPending();

-- Functions
CREATE OR REPLACE FUNCTION getDaysPending (_habitID INTEGER, _newType INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
	totalDays INTEGER := (SELECT days FROM HabitTypes WHERE typeId = _newType);
	activitiesDone INTEGER := (SELECT COUNT(DISTINCT dateTime::date) FROM History WHERE habitID = _habitID);
	daysPending INTEGER;
BEGIN
	SELECT totalDays - activitiesDone INTO daysPending;
	IF daysPending < 0 THEN
		RETURN 0;
	ELSE
		RETURN daysPending;
	END IF;
END
$$;

CREATE OR REPLACE FUNCTION getUserHabits (
	_userID INTEGER,
	_ammount INTEGER=20
)
RETURNS TABLE (
	_habitId INTEGER,
	_name VARCHAR(200),
	_frequency INTEGER,
	_type VARCHAR(50),
	_startDate DATE,
	_dayPending INTEGER,
	_totalDays INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      habitId, name, frequency,
      (SELECT name from HabitTypes WHERE typeId=type ),
      startDate,daysPending,
      (SELECT days FROM HabitTypes WHERE typeID=type)
    FROM Habits WHERE userID=_userID
    LIMIT _ammount;
END;
$$

-- Trigger Functions
CREATE OR REPLACE FUNCTION updateDaysPending()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
	IF OLD.type <> NEW.type THEN
		UPDATE Habits SET daysPending=getDaysPending(NEW.habitID, NEW.type)
					WHERE habitID = NEW.habitID;
	END IF;
	RETURN NEW;
END
$$;

-- Insert initial data
INSERT INTO HabitTypes (typeID, name, days)
	VALUES (1, 'Hábito de Madera', 18);

INSERT INTO HabitTypes (typeID, name, days)
	VALUES (2, 'Hábito de Piedra', 66);

INSERT INTO HabitTypes (typeID, name, days)
	VALUES (3, 'Hábito de Acero', 254);
