import express from "express";
import { prisma } from "../../server.mjs";
import TryCatch from "../../middleware/trycatch.mjs";

const router = express.Router();

router.get(
   "/getAllServices",
   TryCatch(async (req, res) => {
      const services = await prisma.services.findMany({
         take: 3,
         skip: req.query.skip * 3,
         orderBy: {
            updatedAt: req.query.orderby,
         },
      });

      return res.json(services);
   })
);

router.get(
   "/getSearchServices",
   TryCatch(async (req, res) => {
      const services = await prisma.services.findMany({
         where: {
            services: {
               contains: req.query.search,
               mode: "insensitive",
            },
         },
      });

      res.json(services);
   })
);

router.get(
   "/getAllServices/:id",
   TryCatch(async (req, res) => {
      const services = await prisma.services.findMany({
         where: {
            servicesID: req.params.id,
         },
      });

      return res.json(services);
   })
);

export default router;
