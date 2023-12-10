import express from "express";
import ScheduleQuery from "./schedule.query.mjs";
import ScheduleMutation from "./schedule.mutation.mjs";

const app = express.Router();

app.use("/schedule", ScheduleQuery);
app.use("/schedule", ScheduleMutation);

export default app;
