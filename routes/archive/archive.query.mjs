import express from "express";
import tryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
import { subWeeks, subMonths, subDays } from "date-fns";
const router = express();

const currentDateToday = new Date();

router.get(
   "/getAllArchive",
   tryCatch(async (req, res) => {
      const { filter, skip } = req.query;
      switch (filter) {
         case "Daily":
            const Dailyarchvive = await prisma.$queryRawUnsafe(`
            SELECT "Archive".*, "User".*, "Profile".*
            FROM "Archive"
            JOIN "User" ON "Archive"."userID" = "User"."userID"
            JOIN "Profile" ON "Profile"."userID" = "User"."userID"
            LIMIT 6
            OFFSET ${skip}*0`);

            return res.json(Dailyarchvive);
            break;
         case "Weekly":
            const WeeklyArchvive = await prisma.$queryRawUnsafe(`
            SELECT "Archive".*, "User".*,"Profile".*
            FROM "Archive"
            JOIN "User" ON "Archive"."userID" = "User"."userID"
            JOIN "Profile" ON "Profile"."userID" = "User"."userID"
            WHERE EXTRACT(WEEK FROM "Archive"."createdAt") = EXTRACT(WEEK FROM NOW())
            LIMIT 6
            OFFSET ${skip}*0`);

            return res.json(WeeklyArchvive);
            break;
         case "Monthly":
            const MonthlyArchvive = await prisma.$queryRawUnsafe(`
            SELECT "Archive".*, "User".*,"Profile".*
            FROM "Archive"
            JOIN "User" ON "Archive"."userID" = "User"."userID"
            JOIN "Profile" ON "Profile"."userID" = "User"."userID"
            WHERE EXTRACT(MONTH FROM "Archive"."createdAt") = EXTRACT(MONTH FROM NOW())
            LIMIT 6
            OFFSET ${skip}*0`);

            return res.json(MonthlyArchvive);
            break;
      }
   })
);

router.get(
   "/getAllArchive/:id",
   tryCatch(async (req, res) => {
      const archives = await prisma.archive.findUnique({
         where: {
            archieveID: req.params.id,
         },
      });
      const archive = await prisma.archive.findFirst({
         where: {
            archieveID: req.params.id,
         },
         include: {
            Orders: {
               where: {
                  createdAt: {
                     gte: archives.startDate,
                     lte: archives.endDate,
                  },
               },
               include: {
                  User: {
                     include: {
                        profile: true,
                     },
                  },
                  Product: {
                     include: true,
                  },
               },
            },
            User: {
               include: {
                  profile: true,
               },
            },
         },
      });
      res.json(archive);
   })
);

export default router;
