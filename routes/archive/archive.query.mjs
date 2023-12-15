import express from "express";
import tryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
const router = express();

router.get(
   "/getAllArchive",
   tryCatch(async (req, res) => {
      const { filter, skip } = req.query;
      switch (filter) {
         case "Daily":
            const Dailyarchvive = await prisma.$queryRawUnsafe(`
            SELECT "Archive".*, "User"."email" AS "user_email","Profile"."firstname" AS "firstname", "Profile"."lastname" as "lastname"
            FROM "Archive"
            JOIN "User" ON "Archive"."userID" = "User"."userID"
            JOIN "Profile" ON "Profile"."userID" = "User"."userID"
            LIMIT 6
            OFFSET 6*${skip}
			`);

            res.json(Dailyarchvive);
            break;
         case "Weekly":
            const WeeklyArchvive = await prisma.$queryRawUnsafe(`
            SELECT "Archive".*, "User"."email" AS "user_email","Profile"."firstname" AS "firstname", "Profile"."lastname" as "lastname"
            FROM "Archive"
            JOIN "User" ON "Archive"."userID" = "User"."userID"
            JOIN "Profile" ON "Profile"."userID" = "User"."userID"
            WHERE EXTRACT(WEEK FROM "Archive"."createdAt") = EXTRACT(WEEK FROM NOW())
            LIMIT 6
            OFFSET 6*${skip}`);

            res.json(WeeklyArchvive);
            break;
         case "Monthly":
            const MonthlyArchvive = await prisma.$queryRawUnsafe(`
            SELECT "Archive".*, "User"."email" AS "user_email","Profile"."firstname" AS "firstname", "Profile"."lastname" as "lastname"
            FROM "Archive"
            JOIN "User" ON "Archive"."userID" = "User"."userID"
            JOIN "Profile" ON "Profile"."userID" = "User"."userID"
            WHERE EXTRACT(MONTH FROM "Archive"."createdAt") = EXTRACT(MONTH FROM NOW())
            LIMIT 6
            OFFSET 6*${skip}`);

            res.json(MonthlyArchvive);
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
