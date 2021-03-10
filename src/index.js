const express = require("express");
const app = express();
const authRouter = require("./routes/auth");

app.use(express.json());
app.use("/api/user", authRouter);

app.listen(3002, () => console.log("Server listening on port 3000"));
