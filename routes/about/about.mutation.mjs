import express from "express";
import TryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
import { RandomGenerateId } from "../../helpers/randomString.mjs";

const router = express.Router();

router.post(
   "/createAbout",
   TryCatch(async (req, res) => {
      const { title, description, userID } = req.body;

      if (!title || !description || !userID)
         res.status(500).send("Filed shoud not be empty");
      const about = await prisma.about.create({
         data: {
            title,
            id: RandomGenerateId(6),
            description,
            User: {
               connect: {
                  userID,
               },
            },
         },
      });

      res.json(about);
   })
);

router.patch(
   "/updateAbout/:id",
   TryCatch(async (req, res) => {
      const { title, description } = req.body;

      if (!title || !description)
         res.status(500).send("Filed shoud not be empty");

      const about = await prisma.about.update({
         where: { aboutID: req.params.id },
         data: { title, description },
      });

      res.json(about);
   })
);

router.delete(
   "/deleteAbout/:id",
   TryCatch(async (req, res) => {
      const about = await prisma.about.delete({
         where: {
            aboutID: req.params.id,
         },
      });

      res.json(about);
   })
);
export default router;
