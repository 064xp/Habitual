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

-- Tables
CREATE TABLE Users (
	userID SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	password CHAR(60) NOT NULL,
	tzOffset INTEGER
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
	frequency INTEGER [],
	type INTEGER REFERENCES HabitTypes (typeID) NOT NULL,
	startDate DATE NOT NULL,
	daysPending INTEGER NOT NULL,
	reminderHour INTEGER,
	reminderMinute INTEGER,
	isOverdue BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE History (
	entryID SERIAL PRIMARY KEY NOT NULL,
	habitID INTEGER REFERENCES Habits (habitID) NOT NULL,
	dateTime TIMESTAMP NOT NULL,
	isOverdueEntry BOOLEAN NOT NULL DEFAULT false
);


-- Functions
CREATE OR REPLACE FUNCTION insertHabit(
	_name VARCHAR(200),
	_userID INTEGER,
	_frequency INTEGER [],
	_type INTEGER,
	_reminder INTEGER [],
	_startDate DATE = CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
	typeDays INTEGER;
	insertedHabit INTEGER;
BEGIN
	SELECT days INTO typeDays FROM HabitTypes WHERE typeID = _type;
	IF NOT FOUND THEN
		RAISE EXCEPTION 'Invalid habit type %', _type;
		RETURN -1;
	END IF;
	INSERT INTO Habits (userID, name, frequency, type, reminderHour, reminderMinute, startDate, daysPending)
		VALUES (_userID, _name, _frequency, _type, _reminder[1], _reminder[2], _startDate, typeDays) RETURNING habitID INTO insertedHabit;
	RAISE NOTICE 'success';
	RETURN insertedHabit;
END
$$;

CREATE OR REPLACE FUNCTION insertUser(
	_name VARCHAR(100),
 	_email VARCHAR(100),
	_password CHAR(60)
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$

DECLARE
	uid INTEGER;
BEGIN
	INSERT INTO Users (name, email, password)
				VALUES (_name, _email, _password) RETURNING userId INTO uid;
	RETURN uid;

EXCEPTION
	WHEN unique_violation THEN
		RAISE EXCEPTION USING message = 'Email is already in use', errcode = '23505';
END
$$;

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

CREATE OR REPLACE FUNCTION hasActivityToday (
	_userID INTEGER,
	_habitID INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
	userTzOffset INTEGER := (SELECT tzOffset FROM Users WHERE userID = _userID);
	latestEntry TIMESTAMP := (SELECT datetime FROM History WHERE habitID = _habitID ORDER BY datetime DESC LIMIT 1);
	userDay DATE := (SELECT (now() AT TIME ZONE ('-' || userTzOffset || 'min')::INTERVAL)::DATE);
BEGIN
	IF latestEntry < userDay OR latestEntry IS null THEN
		RETURN false;
	END IF;
	RETURN true;
END
$$;

CREATE OR REPLACE FUNCTION getUserHabits (
	_userID INTEGER,
	_ammount INTEGER=NULL
)
RETURNS TABLE (
	habitId INTEGER,
	name VARCHAR(200),
	frequency INTEGER [],
	reminderHour INTEGER,
	reminderMinute INTEGER,
	type INTEGER,
	startDate DATE,
	dayPending INTEGER,
	totalDays INTEGER,
	completed BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      h.habitId, h.name, h.frequency, h.reminderHour, h.reminderMinute,
      h.type, h.startDate, h.daysPending,
      (SELECT days FROM HabitTypes WHERE typeID=h.type),
	  (SELECT * FROM hasActivityToday(_userID, h.habitID))
    FROM Habits as h WHERE userID=_userID
    LIMIT _ammount;
END
$$;

CREATE OR REPLACE FUNCTION emailExists(_email VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
	exists BOOLEAN := (SELECT EXISTS(SELECT * FROM Users WHERE email = _email));
BEGIN
	RETURN exists;
END
$$;

CREATE OR REPLACE FUNCTION updateHabit(
	_userID INTEGER,
	_habitID INTEGER,
	_name VARCHAR(200),
	_frequency INTEGER [],
	_type INTEGER,
	_reminder INTEGER []
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
	updatedHabit INTEGER;
BEGIN	
	UPDATE Habits SET name=_name, frequency=_frequency, type=_type, reminderHour=_reminder[1], reminderMinute=_reminder[2]
		WHERE habitID = _habitID RETURNING habitID into updatedHabit;

	RAISE NOTICE 'success';
	RETURN updatedHabit;
END
$$;

CREATE OR REPLACE FUNCTION deleteHabit(
	_userID INTEGER,
	_habitID INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
	deletedHabit INTEGER;
BEGIN	
	DELETE FROM Habits WHERE habitID = _habitID AND userID = _userID RETURNING habitID into deletedHabit;

	RAISE NOTICE 'success';
	RETURN deletedHabit;
END
$$;


-- Trigger Functions
CREATE OR REPLACE FUNCTION updateDaysPendingTypeChange()
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

CREATE OR REPLACE FUNCTION updateDaysPendingActivityIns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE userID INTEGER := (SELECT userID FROM Habits WHERE habitID = NEW.habitID);
BEGIN
	IF NOT hasActivityToday(userID, NEW.habitID) THEN
		UPDATE Habits SET daysPending = daysPending - 1 WHERE habitID = NEW.habitID;
	END IF;
	RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION updateDaysPendingActivityDel()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
	UPDATE Habits SET daysPending = daysPending + 1 WHERE habitID = OLD.habitID;
	RETURN NEW;
END
$$;

-- Trigger
CREATE TRIGGER trHabitTypeChange
AFTER UPDATE ON Habits
FOR EACH ROW
	EXECUTE PROCEDURE updateDaysPendingTypeChange();
	
CREATE TRIGGER trHabitActivityIns
BEFORE INSERT ON History
FOR EACH ROW
	EXECUTE PROCEDURE updateDaysPendingActivityIns();

drop TRIGGER trHabitActivityDel ON history;

CREATE TRIGGER trHabitActivityDel
AFTER DELETE ON History
FOR EACH ROW
	EXECUTE PROCEDURE updateDaysPendingActivityDel();


-- Insert initial data
INSERT INTO HabitTypes (typeID, name, days)
	VALUES (1, 'Hábito de Madera', 18);

INSERT INTO HabitTypes (typeID, name, days)
	VALUES (2, 'Hábito de Piedra', 66);

INSERT INTO HabitTypes (typeID, name, days)
	VALUES (3, 'Hábito de Acero', 254);

-- User role
CREATE ROLE habitualUser
	WITH encrypted password '' LOGIN;

GRANT UPDATE(name, email, password), SELECT, INSERT, DELETE ON TABLE Users TO habitualUser;
GRANT USAGE, SELECT ON SEQUENCE users_userid_seq TO habitualUser;
GRANT USAGE, SELECT ON SEQUENCE habits_habitid_seq TO habitualUser;
GRANT UPDATE(name, frequency, type, reminderHour, reminderMinute, daysPending), SELECT, INSERT, DELETE ON TABLE Habits TO habitualUser;
GRANT SELECT, INSERT, DELETE ON TABLE History TO habitualUser;
GRANT SELECT ON TABLE HabitTypes TO habitualUser;
