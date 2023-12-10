import express from "express";
import { prisma } from "../../server.mjs";

const router = express.Router();

router.get("/getUsers", async (req, res) => {
   const users = await prisma.user.findMany({
      take: 6,
      skip: req.query.skip * 6,
      include: {
         profile: true,
      },
   });
   res.json(users);
});

router.get("/getUserCustomer", async (req, res) => {
   const users = await prisma.user.findMany({
      where: {
         role: "customer",
      },
      take: 6,
      skip: req.query.skip * 6,
      include: {
         profile: true,
      },
   });

   res.json(users);
});

router.get("/getUsersId/:id", async (req, res) => {
   const users = await prisma.user.findMany({
      where: { userID: req.params.id },
      include: {
         profile: true,
      },
   });
   res.json(users);
});

export default router;
