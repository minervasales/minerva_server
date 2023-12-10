import express from "express";
import tryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
import TryCatch from "../../middleware/trycatch.mjs";
const router = express.Router();

router.get(
   "/getAllProduct/",
   tryCatch(async (req, res) => {
      const products = await prisma.product.findMany({
         take: 6,
         skip: req.query.skip * 6,
         orderBy: {
            price: req.query.orderby,
         },
      });

      return res.json(products);
   })
);

router.get(
   "/getProductsByCategory/Tires",
   TryCatch(async (req, res) => {
      const { take, offset, orders } = req.body;

      const products = await prisma.product.findMany({
         where: {
            category: req.params.category,
         },
         take,
         skip: offset,
         orderBy: {
            createdAt: orders,
         },
      });

      return res.json(products);
   })
);

router.get(
   "/getProductsByCategory/",
   TryCatch(async (req ,res) => {
      const products = await prisma.product.findMany({
         where: {
            category: {
               contains:  req.query.category,
               mode: "insensitive"
            },
         },
         take: 6,
         skip: req.query.skip * 6,
         orderBy: {
            price: req.query.orderby,
         },
      });

      return res.json(products);
   })
);

router.get(
   "/getProductById/:id",
   tryCatch(async (req, res) => {
      const product = await prisma.product.findMany({
         where: {
            productID: req.params.id,
         },
      });

      return res.json(product);
   })
);

router.get(
   "/getSearchProduct",
   tryCatch(async (req, res) => {
      const products = await prisma.product.findMany({
         where: {
            name: {
               contains: req.query.search,
               mode: "insensitive",
            },
         },
      });

      return res.json(products);
   })
);
export default router;
