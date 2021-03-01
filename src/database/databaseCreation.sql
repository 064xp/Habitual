-- Database: habitual

-- DROP DATABASE habitual;

CREATE DATABASE habitual
    WITH 
    OWNER = paulo
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
	
CREATE TABLE Users (
	userID SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(50) NOT NULL
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
	name VARCHAR(200),
	userID INTEGER,
	frequency INTEGER,
	type INTEGER,
	startDate DATE = CURRENT_DATE
)
LANGUAGE plpgsql
AS $$
	DECLARE typeDays INTEGER;
	BEGIN
		SELECT days INTO typeDays FROM HabitTypes WHERE typeID = type;
		IF NOT FOUND THEN
			RAISE NOTICE 'Invalid habit type %', type;
			RETURN;
		END IF;
	INSERT INTO Habits (userID, name, frequency, type, startDate, daysPending)
		VALUES (userID, name, frequency, type, startDate, typeDays);
	END
$$;

-- Insert initial data 
INSERT INTO HabitTypes (typeID, name, days)
	VALUES (1, 'Hábito de Madera', 18);

INSERT INTO HabitTypes (typeID, name, days)
	VALUES (2, 'Hábito de Piedra', 66);

INSERT INTO HabitTypes (typeID, name, days)
	VALUES (3, 'Hábito de Acero', 254);