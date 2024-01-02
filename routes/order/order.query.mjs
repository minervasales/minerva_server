import express from "express";
import tryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
import { format } from "date-fns";
const router = express.Router();

router.get(
   "/getAllMyOrders/:id",
   tryCatch(async (req, res) => {
      const orders = await prisma.orders.findMany({
         where: {
            User: {
               some: {
                  userID: req.params.id,
               },
            },
         },
         include: {
            Reason: true,
         },
         take: 6,
         skip: req.query.skip * 6,
         orderBy: {
            createdAt: req.query.orderby,
         },
      });

      res.json(orders);
   })
);

router.get(
   "/getAllOrders",
   tryCatch(async (req, res) => {
      const schedule = await prisma.orders.findMany({
         where: {
            orders: {
               contains: req.query.search,
               mode: "insensitive",
            },
         },
         include: {
            Reason: true,
         },
      });

      res.json(schedule);
   })
);

router.get(
   "/getGeneratedReport",
   tryCatch(async (req, res) => {
      const orders = await prisma.orders.findMany({
         where: {
            createdAt: {
               gte: new Date(req.query.startDate),
               lte: new Date(req.query.endDate),
            },
         },
         include: {
            Product: true,
            User: {
               include: {
                  profile: true,
               },
            },
         },
      });

      res.json(orders);
   })
);

router.get(
   "/",
   tryCatch(async (req, res) => {
      const orders = await prisma.orders.findMany({
         take: 6,
         skip: req.query.skip * 6,
         include: {
            User: {
               include: {
                  profile: true,
               },
            },
            Reason: true,
         },
         orderBy: {
            createdAt: req.query.orderby,
         },
      });
      res.json(orders);
   })
);

router.get(
   "/getmyorders/:id",
   tryCatch(async (req, res) => {
      const order = await prisma.orders.findMany({
         where: {
            orderID: req.params.id,
         },
         include: {
            User: {
               include: {
                  profile: true,
               },
            },
            Reason: true,
         },
      });

      res.json(order);
   })
);
export default router;
