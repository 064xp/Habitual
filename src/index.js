const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const authRouter = require("./routes/auth");
const habitRouter = require("./routes/habits");
const verifyToken = require("./routes/verifyToken");

// app.use("/", express.static(path.join(__dirname, "public")));
app.use(express.static("public"));
//Middleware
app.use(express.json());
//Invalid JSON error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next();
});
app.use(cookieParser());

//Routers
app.use("/api/user", authRouter);
app.use("/api/habits", habitRouter);

app.listen(3002, () => console.log("Server listening on port 3002"));
