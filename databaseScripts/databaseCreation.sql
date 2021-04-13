-- Database: habitual

-- DROP DATABASE habitual;
-- CREATE DATABASE habitual
--     WITH
--     OWNER = habitual
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'en_US.utf8'
--     LC_CTYPE = 'en_US.utf8'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1;

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
	startDate TIMESTAMP NOT NULL,
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
CREATE OR REPLACE FUNCTION hasActivity (
	_userID INTEGER,
	_habitID INTEGER,
	--default day is current day for user
	_day DATE = NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
	userTzOffset INTEGER := (SELECT tzOffset FROM Users WHERE userID = _userID);
	latestEntry TIMESTAMP := timeAtTz(userTzOffset, (SELECT datetime FROM History WHERE habitID = _habitID ORDER BY datetime DESC LIMIT 1));
	userDay DATE := _day;
BEGIN
	IF userDay IS NULL THEN
		SELECT timeAtTz(userTzOffset)::DATE INTO userDay;
	END IF;

	IF latestEntry < userDay OR latestEntry IS null THEN
		RETURN false;
	END IF;
	RETURN true;
END
$$;

CREATE OR REPLACE FUNCTION insertHabit(
	_name VARCHAR(200),
	_userID INTEGER,
	_frequency INTEGER [],
	_type INTEGER,
	_reminder INTEGER [],
	_startDate TIMESTAMP = NOW()
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
	startDate TIMESTAMP := (SELECT startDate FROM Habits WHERE habitID = _habitID);
	totalDays INTEGER := (SELECT days FROM HabitTypes WHERE typeId = _newType);
	activitiesDone INTEGER := (SELECT COUNT(DISTINCT dateTime::date) FROM History WHERE habitID = _habitID AND dateTime > startDate);
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
	_ammount INTEGER=NULL
)
RETURNS TABLE (
	habitId INTEGER,
	name VARCHAR(200),
	frequency INTEGER [],
	reminderHour INTEGER,
	reminderMinute INTEGER,
	type INTEGER,
	startDate TIMESTAMP,
	daysPending INTEGER,
	isOverdue BOOLEAN,
	totalDays INTEGER,
	doneToday BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      h.habitId, h.name, h.frequency, h.reminderHour, h.reminderMinute,
      h.type, h.startDate, h.daysPending, h.isOverdue,
      (SELECT days FROM HabitTypes WHERE typeID=h.type),
	  ((SELECT * FROM hasActivity(_userID, h.habitID)) OR h.daysPending = 0)
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

CREATE OR REPLACE FUNCTION timeAtTz(
	_tzOffset INTEGER, 
	_time TIMESTAMPTZ = NOW()
)
RETURNS TIMESTAMP
LANGUAGE plpgsql
AS $$
BEGIN
	RETURN _time AT TIME ZONE (_tzOffset*-1||'min')::INTERVAL;
END
$$;

CREATE OR REPLACE FUNCTION insertHistoryEntry(
	_habitID INTEGER, 
	_isOverdueEntry BOOLEAN = false, 
	_dateTime TIMESTAMPTZ = NOW()
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
	newEntryID INTEGER;
BEGIN	
	INSERT INTO History (habitID, dateTime, isOverdueEntry) 
		VALUES (_habitID, _dateTime, _isOverdueEntry)
		RETURNING entryID INTO newEntryID;
	RETURN newEntryID;
END
$$;


-- Views
CREATE OR REPLACE VIEW overdueHabits AS 
SELECT h.habitID, u.userID, h.name, h.isOverdue, h.frequency, h.startDate, u.tzOffset
		FROM Habits h 
		INNER JOIN Users u ON  h.userID = u.userID
		WHERE 
			(SELECT DATE_PART('dow', timeAtTz(u.tzOffset) - '1day'::INTERVAL)) = ANY(h.frequency)
			AND NOT hasActivity(h.userID, h.habitID, (timeAtTz(u.tzOffset) - '1day'::INTERVAL)::DATE)
			AND DATE_PART('hour', timeAtTz(u.tzOffset)) = 0
			AND timeAtTz(u.tzOffset, h.startDate) < timeAtTz(u.tzOffset)::DATE
			AND NOT h.isOverdue;

-- Stored Procedures
CREATE OR REPLACE PROCEDURE setHabitOverdue(_habitID INTEGER) 
LANGUAGE SQL
AS $$
	UPDATE Habits SET isOverdue = true WHERE habitID = _habitID;
	SELECT insertHistoryEntry(_habitID, true, NOW() - '10min'::INTERVAL);
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
	IF NOT hasActivity(userID, NEW.habitID) THEN
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

-- Triggers
CREATE TRIGGER trHabitTypeChange
AFTER UPDATE ON Habits
FOR EACH ROW
	EXECUTE PROCEDURE updateDaysPendingTypeChange();
	
CREATE TRIGGER trHabitActivityIns
BEFORE INSERT ON History
FOR EACH ROW
	EXECUTE PROCEDURE updateDaysPendingActivityIns();

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

GRANT UPDATE(name, email, password, tzOffset), SELECT, INSERT, DELETE ON TABLE Users TO habitualUser;
GRANT USAGE, SELECT ON SEQUENCE users_userid_seq TO habitualUser;
GRANT USAGE, SELECT ON SEQUENCE habits_habitid_seq TO habitualUser;
GRANT UPDATE(name, frequency, type, reminderHour, reminderMinute, daysPending, isOverdue), SELECT, INSERT, DELETE ON TABLE Habits TO habitualUser;
GRANT SELECT, INSERT, DELETE ON TABLE History TO habitualUser;
GRANT USAGE, SELECT ON SEQUENCE history_entryid_seq TO habitualUser;
GRANT SELECT ON TABLE HabitTypes TO habitualUser;
GRANT SELECT ON overdueHabits TO habitualUser;
