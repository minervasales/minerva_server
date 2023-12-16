import express from "express";
import AboutQuery from "./about.query.mjs";
import AboutMutation from "./about.mutation.mjs";

const app = express.Router();

app.use("/about", AboutQuery);
app.use("/about", AboutMutation);

export default app;
