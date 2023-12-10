import express from "express";
import ProductQuery from "./product.query.mjs";
import ProductMutation from "./product.mutation.mjs";

const app = express.Router();

app.use("/product", ProductQuery);
app.use("/product", ProductMutation);

export default app;
