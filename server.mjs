import express from "express";
import dotenv from "dotenv";
import cookiesParser from "cookie-parser";
import cors from "cors";
import { createServer } from "node:http";
import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";

import Archive from "./routes/archive/archive.mjs";
import User from "./routes/user/user.mjs";
import Product from "./routes/product/product.mjs";
import Orders from "./routes/order/order.mjs";
import Schedule from "./routes/schedule/schedule.mjs";
import Logs from "./routes/logs/logs.mjs";
import errorHandler from "./middleware/errorHandler.mjs";
import Service from "./routes/services/services.mjs";

const app = express();

const server = createServer(app);

dotenv.config();

export const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiesParser());

app.use(
   cors({
      credentials: true,
      origin: ["http://localhost:3000"],
   })
);

app.use(errorHandler);

app.use(User);
app.use(Product);
app.use(Schedule);
app.use(Orders);
app.use(Logs);
app.use(Archive);
app.use(Service);

server.listen({ port: 3001 }, () => {
   console.log("Port is running at http://localhost:3001");
});
