import express from "express";
import ServiceQuery from "./service.query.mjs";
import ServiceMutation from "./service.mutation.mjs";

const router = express.Router();

router.use("/services", ServiceQuery);
router.use("/services", ServiceMutation);

export default router;
