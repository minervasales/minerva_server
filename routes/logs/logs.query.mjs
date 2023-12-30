import express from "express";
import tryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
const router = express.Router();

router.get(
   "/",
   tryCatch(async (req, res) => {
      const logs = await prisma.logs.findMany({
         take: 6,
         skip: req.query.skip * 6,
         include: {
            User: {
               include: {
                  profile: true,
               },
            },
         },
         orderBy: {
            createdAt: req.query.orderby,
         },
      });

      res.json(logs);
   })
);

router.get(
   "/getSearchLogs",
   tryCatch(async (req, res) => {
      const logs = await prisma.logs.findMany({
         where: {
            title: {
               contains: req.query.search,
               mode: "insensitive",
            },
         },
      });
      res.json(logs);
   })
);

export default router;
