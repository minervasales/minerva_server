import express from "express";
import UserQuery from "./user.query.mjs";
import UserMutation from "./user.mutation.mjs";

const app = express.Router();

app.use("/user", UserQuery);
app.use("/user", UserMutation);

export default app;
