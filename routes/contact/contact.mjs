import express from "express";
import contactQuery from "./contact.query.mjs";
import contactMutation from "./contact.mutation.mjs";

const app = express.Router();

app.use("/contact", contactQuery);
app.use("/contact", contactMutation);

export default app;
