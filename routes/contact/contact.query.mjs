import express from "express";
import TryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
const router = express.Router();

router.get(
   "/getAllContact",
   TryCatch(async (req, res) => {
      const contact = await prisma.contacts.findMany({
         include: {
            User: true,
         },
      });
      res.json(contact);
   })
);

router.get(
   "/getAllAContact/:id",
   TryCatch(async (req, res) => {
      const contact = await prisma.contacts.findMany({
         where: { contactsID: req.params.id },
         include: {
            User: true,
         },
      });

      res.json(contact);
   })
);
export default router;
