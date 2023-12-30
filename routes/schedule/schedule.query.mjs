import express from "express";
import tryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";

const router = express.Router();

router.get(
   "/",
   tryCatch(async (req, res) => {
      const schedule = await prisma.schedule.findMany({
         take: 6,
         skip: req.query.skip * 6,
         orderBy: {
            createdAt: req.query.orderby,
         },
         include: {
            User: {
               include: {
                  profile: true,
               },
            },
            Car: true,
            Reason: true,
         },
      });

      res.json(schedule);
   })
);

router.get(
   "/getSearchAppointments",
   tryCatch(async (req, res) => {
      const schedule = await prisma.schedule.findMany({
         where: {
            scheduleID: {
               contains: req.query.search,
               mode: "insensitive",
            },
         },
         include: {
            Car: true,
            Reason: true,
            User: {
               include: { profile: true },
            },
         },
      });

      res.json(schedule);
   })
);

router.get(
   "/getAllMyAppointments/:id",
   tryCatch(async (req, res) => {
      const schedule = await prisma.schedule.findMany({
         where: {
            User: {
               some: {
                  userID: req.params.id,
               },
            },
         },
         take: 6,
         skip: req.query.skip * 6,
         include: {
            User: {
               include: {
                  profile: true,
               },
            },
            Car: true,
            Reason: true,
         },
      });

      res.json(schedule);
   })
);
router.get(
   "/:id",
   tryCatch(async (req, res) => {
      const schedule = await prisma.schedule.findMany({
         where: {
            scheduleID: req.params.id,
         },
         include: {
            User: {
               include: {
                  profile: true,
               },
            },
            Car: true,
            Reason: true,
         },
      });

      res.json(schedule);
   })
);

export default router;
