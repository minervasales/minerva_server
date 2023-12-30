import express from "express";
import TryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";

const router = express.Router();

router.get(
   "/getAllAbout",
   TryCatch(async (req, res) => {
      const about = await prisma.about.findMany({
         include: {
            User: true,
         },
      });
      res.json(about);
   })
);

router.get(
   "/getSearchAbout",
   TryCatch(async (req, res) => {
      const about = await prisma.about.findMany({
         where: {
            title: {
               contains: req.query.search,
               mode: "insensitive",
            },
         },
      });

      res.json(about);
   })
);

router.get(
   "/getAllAbout/:id",
   TryCatch(async (req, res) => {
      const about = await prisma.about.findMany({
         where: {
            aboutID: req.params.id,
         },
         include: {
            User: true,
         },
      });

      res.json(about);
   })
);

export default router;
