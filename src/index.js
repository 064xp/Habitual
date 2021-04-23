const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const schedule = require("node-schedule");

const authRouter = require("./routes/auth");
const habitRouter = require("./routes/habits");
const usersRouter = require("./routes/users");
const activityRouter = require("./routes/activities");
const verifyToken = require("./routes/verifyToken");

const jsonValidation = require("./middleware/jsonValidation");
const logging = require("./middleware/logging");

const checkOverdueHabits = require("./scheduledTasks/checkOverdueHabits");
const notifyUsers = require("./scheduledTasks/notifyUsers");
const dynoWake = require("./scheduledTasks/dynoWake");

const app = express();
app.set("trust proxy", true);

//Middleware
app.use(
  "/",
  express.static(path.join(__dirname, "public"), {
    extensions: ["html"],
  })
);
app.use(logging);
app.use(express.json());
app.use(jsonValidation);
app.use(cookieParser());

//Scheduled tasks
//Every hour
const overdueHabitsJob = schedule.scheduleJob("0 * * * *", checkOverdueHabits);
//prettier-ignore
//Every Minute
const notificationsJob = schedule.scheduleJob("*/1 * * * *", notifyUsers);
//prettier-ignore
//Every 28 mins keep heroku dyno awake
const notificationsJob = schedule.scheduleJob("*/28 * * * *", dynoWake);

//Routers
app.use("/api/auth", authRouter);
app.use("/api/habits", habitRouter);
app.use("/api/activities", activityRouter);
app.use("/api/users", usersRouter);

app.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}`)
);
