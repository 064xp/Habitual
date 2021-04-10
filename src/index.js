const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const schedule = require("node-schedule");

const authRouter = require("./routes/auth");
const habitRouter = require("./routes/habits");
const verifyToken = require("./routes/verifyToken");

const jsonValidation = require("./middleware/jsonValidation");
const logging = require("./middleware/logging");

const checkOverdueHabits = require("./scheduledTasks/checkOverdueHabits");

const app = express();
app.set("trust proxy", true);

//Middleware
app.use("/", express.static(path.join(__dirname, "public")));
app.use(logging);
app.use(express.json());
app.use(jsonValidation);
app.use(cookieParser());

//Scheduled tasks
const overdueHabitsJob = schedule.scheduleJob("0 * * * *", checkOverdueHabits);

//Routers
app.use("/api/user", authRouter);
app.use("/api/habits", habitRouter);

app.listen(3002, () => console.log("Server listening on port 3002"));
