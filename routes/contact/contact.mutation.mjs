import express from "express";
import TryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
import { uploadImage } from "../../helpers/aws.mjs";
import { RandomGenerateId } from "../../helpers/randomString.mjs";
const router = express.Router();

router.post(
   "/contactCreate",
   TryCatch(async (req, res) => {
      const { title, description, userID } = req.body;
      if (!title || !description || !userID)
         throw new Error("Filed shoud not be empty");
      const contacts = await prisma.contacts.create({
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

      res.json(contacts);
   })
);

router.patch(
   "/updateContact/:id",
   TryCatch(async (req, res) => {
      const { title, description } = req.body;

      if (!title || !description) throw new Error("Filed shoud not be empty");

      const contact = await prisma.contacts.update({
         data: {
            title,
            description,
         },
         where: {
            contactsID: req.params.id,
         },
      });

      res.json(contact);
   })
);

router.delete(
   "/deleteContact/:id",
   TryCatch(async (req, res) => {
      const contact = await prisma.contacts.delete({
         where: {
            contactsID: req.params.id,
         },
      });
      res.json(contact);
   })
);

export default router;
