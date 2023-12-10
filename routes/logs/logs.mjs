import express from "express";
import LogQuery from "./logs.query.mjs";

const router = express.Router();

router.use("/logs", LogQuery);

export default router;
