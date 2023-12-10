import OrderQuery from "./order.query.mjs";
import OrderMutation from "./order.mutation.mjs";

import express from "express";

const router = express.Router();

router.use("/order", OrderQuery);
router.use("/order", OrderMutation);

export default router;
