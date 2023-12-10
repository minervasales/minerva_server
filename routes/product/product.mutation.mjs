import express from "express";

const router = express.Router();
import tryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
import { uploadImage } from "../../helpers/aws.mjs";
import { RandomGenerateId } from "../../helpers/randomString.mjs";

router.post(
   "/createProduct",
   uploadImage.any("file"),
   tryCatch(async (req, res) => {
      const { name, quantity, price, descriptions, category, stock, userID } =
         req.body;

      if ((!name || !quantity || !price || !descriptions, !category || !stock))
         throw new Error("Fields cannot be empty");

      const imageArray = [];
      req.files.map(({ location }) => {
         imageArray.push(location);
      });

      const products = await prisma.product.create({
         data: {
            image: imageArray,
            id: `#${RandomGenerateId(6)}`,
            name,
            stock,
            quantity: parseInt(quantity),
            category,
            price: parseFloat(price),
            descriptions,
            User: {
               connect: {
                  userID,
               },
            },
         },
      });

      await prisma.logs.create({
         data: {
            title: "Added New Product",
            User: {
               connect: {
                  userID,
               },
            },
         },
      });
      res.json(products);
   })
);

router.delete(
   "/deleteProduct/:id",
   tryCatch(async (req, res) => {
      const { userID } = req.body;
      const prodcuts = await prisma.product.delete({
         where: {
            productID: req.params.id,
         },
      });
      await prisma.logs.create({
         data: {
            title: "Deleted Product",
            User: {
               connect: {
                  userID,
               },
            },
         },
      });
      res.json(prodcuts);
   })
);

router.patch(
   "/updateProduct/:id",
   tryCatch(async (req, res) => {
      const { name, descriptions, quantity, price, category, stock, userID } =
         req.body;
      const products = await prisma.product.update({
         data: {
            name,
            price: parseFloat(price),
            descriptions,
            category,
            stock,
            quantity: parseInt(quantity),
         },
         where: {
            productID: req.params.id,
         },
      });

      await prisma.logs.create({
         data: {
            title: "Edited Product Details",
            User: {
               connect: {
                  userID,
               },
            },
         },
      });

      res.json(products);
   })
);

router.put(
   "/updateProductQuantity/:id",
   tryCatch(async (req, res) => {
      const { quantity, userID } = req.body;
      const products = await prisma.product.update({
         data: {
            quantity,
         },
         where: {
            productID: req.params.id,
         },
      });

      await prisma.logs.create({
         data: {
            title: "Edited Inventory Details",
            User: {
               connect: {
                  userID,
               },
            },
         },
      });

      res.json(products);
   })
);

export default router;
