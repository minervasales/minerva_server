import express from "express";
import tryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";

const router = express();

router.post(
   "/createArchive",
   tryCatch(async (req, res) => {
      const { startDate, endDate } = req.body;
      const archive = await prisma.archive.create({
         data: {
            id: `#${RandomGenerateId(6)}`,
            startDate,
            endDate,
         },
      });

      res.json(archive);
   })
);
export default router;
