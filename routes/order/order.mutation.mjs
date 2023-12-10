import express from "express";
import tryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
import { SENDMAIL } from "../../helpers/sengrid.mjs";
import { GenerateRandomORDER } from "../../helpers/randomGenerateORDER.mjs";
import TryCatch from "../../middleware/trycatch.mjs";
import { RandomGenerateId } from "../../helpers/randomString.mjs";
import { format } from "date-fns";
const router = express.Router();

router.post(
   "/createOrders",
   tryCatch(async (req, res) => {
      const { productID, quantity, payment, userID } = req.body;

      const users = await prisma.user.findUnique({
         where: {
            userID,
         },
         include: {
            profile: true,
         },
      });

      if (!users.verified)
         throw new Error("You must need to be verified to create an oreder");

      const prod = await prisma.product.findUnique({
         where: {
            productID,
         },
      });

      const order = await prisma.orders.create({
         data: {
            orders: `#${GenerateRandomORDER(8)}`,
            quantity,
            payment,
            Product: {
               connect: {
                  productID: prod.productID,
               },
            },
            User: {
               connect: {
                  userID,
               },
            },
            total: prod.price * quantity,
            status: "Pending",
         },
      });

      await prisma.product.update({
         data: {
            quantity: prod.quantity - quantity,
         },
         where: { productID },
      });

      if (payment === "GCASH" || "MAYA" || "Bank Transfer") {
         SENDMAIL(
            users.email,
            "Waiting Payment Confirmation",
            `<html lang="en">
   
         <head>
             <meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, initial-scale=1.0">
             <link href="/index.css" rel="stylesheet" />
             <link href="https://fonts.googleapis.com/css2?family=Oxygen&family=Arial:wght@200&family=Rubik&display=swap"
                 rel="stylesheet">
             <title>Document</title>
         
         <body style="box-sizing:  border-box; margin: 0; padding: 0;">
             <table style="width: 500px; height: auto; ">
                 <tr style="height: 60px;">
                     <td style="font-family: Poppins;">Hello ${users.profile.firstname} ${users.profile.lastname}</h2>
                     </td>
                 </tr>
                 <tr style=" height: 60px;">
                     <td style="font-family: Poppins;">Your payment for order ${order.orders} as been received. Your order is being
                         processed as of the moment. We will notify you again via email once there are updates.
                     </td>
                 </tr>
                 <tr style="height: 60px;">
                     <td style="font-family: Poppins;">
                         For any inquries, log in to your Minerva Sales Corp. Account and inquire via chatbox or message our
                         Facebook page. Thank you.
                     </td>
                 </tr>
                 <tr style="height: 60px;">
                     <td style="font-family: Poppins;">
                         If you did not request a new password, please ignore this email
                     </td>
                 </tr>
                 <tr style="height: 30px; ">
                     <td style="width: 100%; text-align: center; ">
                         <img src="
                     http://cdn.mcauto-images-production.sendgrid.net/c19fbca0252c8257/91bb1b2a-746f-431b-97d7-482bdcdbad63/1537x546.png"
                             alt="minerva.logo" height="100" width="300" />
                     </td>
                 </tr>
                 <tr>
                     <td style="text-align: center; height: 35px;">
                         <p style="font-family: Poppins; height: 0;">
                             Sent by Minerva Sales Corp
                         </p>
                     </td>
                 </tr>
                 <tr>
                     <td style="text-align: center; height: 35px;">
                         <p style="font-family: Poppins; height: 0;">
                             General Malvar Street, Barangay Tubigan, Binan City, Laguna, 4024
                         </p>
                     </td>
                 </tr>
             </table>
         </body>
         
             </html>`
         );
      }

      await prisma.logs.create({
         data: {
            title: "Submitted Order",
            User: {
               connect: {
                  userID,
               },
            },
         },
      });
      res.json(order);
   })
);

router.post(
   "/orderCancellation/:id",
   TryCatch(async (req, res) => {
      const orders = await prisma.orders.update({
         data: {
            status: "Order Cancelled",
         },
         where: {
            orderID: req.params.id,
         },
         include: {
            User: true,
         },
      });

      const users = await prisma.user.findMany({
         where: {
            Orders: {
               some: {
                  orders: orders.orderID,
               },
            },
         },
         include: {
            profile: true,
         },
      });

      SENDMAIL(
         users[0].email,
         `Order Cancelled`,
         `<html lang="en">

      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="/index.css" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Oxygen&family=Arial:wght@200&family=Rubik&display=swap"
              rel="stylesheet">
          <title>Document</title>
      
      <body style="box-sizing:  border-box; margin: 0; padding: 0;">
          <table style="width: 500px; height: auto; ">
              <tr style="height: 60px;">
                  <td style="font-family: Poppins;">Hello ${users[0].profile.firstname} ${users[0].profile.lastname}</h2>
                  </td>
              </tr>
              <tr style=" height: 60px;">
                  <td style="font-family: Poppins;">Your order ${orders.orders} has been canceled. We hope to do business with you
                      again. For more details regarding the cancellation, kindly login and view the order status.
                  </td>
              </tr>
              <tr style=" height: 60px;">
                  <td style="font-family: Poppins;">
                      For any inquires, log in to your Minerva Sales Corp. account and inquire via chatbox or message our
                      Facebook page. Thank you.
                  </td>
              </tr>
              <tr style="height: 60px;">
                  <td style="font-family: Poppins;">
                      If you did
                      not request
                      verification, please ignore this email
                  </td>
              </tr>
              <tr style="height: 30px; ">
                  <td style="width: 100%; text-align: center; ">
                      <img src="
                      http://cdn.mcauto-images-production.sendgrid.net/c19fbca0252c8257/91bb1b2a-746f-431b-97d7-482bdcdbad63/1537x546.png"
                          alt="minerva.logo" height="100" width="300" />
                  </td>
              </tr>
              <tr>
                  <td style="text-align: center; height: 35px;">
                      <p style="font-family: Poppins; height: 0;">
                          Sent by Minerva Sales Corp
                      </p>
                  </td>
              </tr>
              <tr>
                  <td style="text-align: center; height: 35px;">
                      <p style="font-family: Poppins; height: 0;">
                          General Malvar Street, Barangay Tubigan, Binan City, Laguna, 4024
                      </p>
                  </td>
              </tr>
          </table>
      </body>
      
      </html>`
      );

      await prisma.logs.create({
         data: {
            title: "Submitted order cancellation request",
            User: {
               connect: {
                  userID: users[0].userID,
               },
            },
         },
      });
      return res.json(orders);
   })
);

router.post(
   "/generateReport",
   TryCatch(async (req, res) => {
      const { startDate, endDate, userID } = req.body;

      const orders = await prisma.orders.findMany({
         where: {
            createdAt: {
               gte: new Date(startDate),
               lte: new Date(endDate),
            },
         },
      });

      orders.map(({ orderID }) => {
         console.log(orderID);
      });

      await prisma.archive.create({
         data: {
            id: `#${RandomGenerateId(6)}`,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            Orders: {
               connect: orders.map(({ orderID }) => {
                  return { orderID: orderID };
               }),
            },
            User: {
               connect: {
                  userID,
               },
            },
         },
      });

      await prisma.logs.create({
         data: {
            title: "Generated Report",
            User: {
               connect: {
                  userID,
               },
            },
         },
      });

      return res.json(orders);
   })
);

router.put(
   "/updateOrderStatus/:id",
   tryCatch(async (req, res) => {
      const { status, adminUserID } = req.body;

      const orders = await prisma.orders.update({
         data: {
            status,

            updatedAt: new Date(Date.now()),
         },
         where: {
            orderID: req.params.id,
         },
         include: {
            Product: true,
            User: {
               include: {
                  profile: true,
               },
            },
         },
      });

      switch (status) {
         case "Ready for pick-up":
            SENDMAIL(
               orders.User[0].email,
               "Ready for Pick-up",
               `<html lang="en">
                  <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <link href="/index.css" rel="stylesheet" />
                  <link href="https://fonts.googleapis.com/css2?family=Oxygen&family=Arial:wght@200&family=Rubik&display=swap"
                     rel="stylesheet">
                  <title>Document</title>
                     <body style="box-sizing:  border-box; margin: 0; padding: 0;">
                        <table style="width: 500px; height: auto; ">
                           <tr style="height: 60px;">
                                 <td style="font-family: Poppins;">Hello ${orders.User[0].profile.firstname} ${orders.User[0].profile.lastname}</h2>
                                 </td>
                           </tr>
                           <tr style=" height: 60px;">
                                 <td style="font-family: Poppins;">Your order ${orders.orders} is now ready for pickup. Kindly bring the
                                    acknowledgment receipt or order form as proof of your transaction.
                                 </td>
                           </tr>
                           <tr style="height: 60px;">
                                 <td style="font-family: Poppins;">
                                    For any inquries, log in to your Minerva Sales Corp. Account and inquire via chatbox or message our
                                    Facebook page. Thank you.
                                 </td>
                           </tr>
                           <tr style="height: 60px;">
                                 <td style="font-family: Poppins;">
                                    If you did not request a new password, please ignore this email
                                 </td>
                           </tr>
                           <tr style="height: 30px; ">
                                 <td style="width: 100%; text-align: center; ">
                                    <img src="
                                 http://cdn.mcauto-images-production.sendgrid.net/c19fbca0252c8257/91bb1b2a-746f-431b-97d7-482bdcdbad63/1537x546.png"
                                       alt="minerva.logo" height="100" width="300" />
                                 </td>
                           </tr>
                           <tr>
                                 <td style="text-align: center; height: 35px;">
                                    <p style="font-family: Poppins; height: 0;">
                                       Sent by Minerva Sales Corp
                                    </p>
                                 </td>
                           </tr>
                           <tr>
                                 <td style="text-align: center; height: 35px;">
                                    <p style="font-family: Poppins; height: 0;">
                                       General Malvar Street, Barangay Tubigan, Binan City, Laguna, 4024
                                    </p>
                                 </td>
                           </tr>
                        </table>
                     </body>
      </html>
            `
            );

            if (payment === "GCASH" || "MAYA" || "Bank Transfer") {
               SENDMAIL(
                  orders.User[0].email,
                  "Ready for Pick for GCASH/MAYA/Bank Transfer",
                  `<html lang="en">

                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <link href="/index.css" rel="stylesheet" />
                      <link href="https://fonts.googleapis.com/css2?family=Oxygen&family=Arial:wght@200&family=Rubik&display=swap"
                          rel="stylesheet">
                      <title>Document</title>
                  
                  <body style="box-sizing:  border-box; margin: 0; padding: 0 20px;">
                      <table style="width:1000px; height: auto; ">
                          <tr style="height: 5px;">
                              <td style="font-family: Poppins; text-align: center;">Minerva Sales Corporation</h2>
                              </td>
                          </tr>
                          <tr style="height: 5px;">
                              <td style="font-family: Poppins; text-align: center;">General Malvar Street, Barangay Tubigan</h2>
                              </td>
                          </tr>
                          <tr style="height: 5px;">
                              <td style="font-family: Poppins; text-align: center;">Binan City, Laguna, 4024</h2>
                              </td>
                          </tr>
                          <tr style="height: 45px;">
                              <td style="font-family: Poppins; text-align: center;"><b>Acknowledgement Receipt</b></h2>
                              </td>
                          </tr>
                      </table>
                      <table style="width:1200px;">
                          <tr style="height: 45px;">
                              <td style="font-family: Poppins;  width: 250px;"><b>Order ID:</b> 
                                  ${orders.orders} 
                              </td>
                              <td style="font-family: Poppins;  width: 200px;"><b>Payment Method:</b>
                                 ${orders.payment}
                              </td>
                          </tr>
                          <tr style="height: 20px;">
                              <td style="font-family: Poppins;  width: 250px;"><b>Customer Name:</b>${
                                 orders.User[0].profile.firstname
                              } ${orders.User[0].profile.lastname}</td>
                              <td style="font-family: Poppins;  width: 200px;"><b>Date Ordered:</b>
                                 ${format(
                                    new Date(orders.createdAt),
                                    "MMMM dd yyyy"
                                 )}
                              </td>
                          </tr>
                      </table>
                      <table style="border: 1px solid #000; border-collapse: collapse; margin: 10px 0;">
                          <tr style="height: 35px;">
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>Qty:</b></td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>Product
                                      Name:</b>
                              </td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>Price:</b>
                              </td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>Total:</b>
                              </td>
                          </tr>
                          <tr style="height: 35px;">
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>
                              ${orders.quantity}</b></td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>${
                                 orders.Product[0].name
                              }</b>
                              </td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>
                              ${orders.Product[0].price}</b>
                              </td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>
                                 ${Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "PHP",
                                 }).format(orders.total)}
                             </b>
                              </td>
                          </tr>
                          <tr style="height: 35px;">
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>TOTAL AMOUNT
                                      DUE</b></td>
                              <td style="font-family: Poppins;  width: 130px; ; padding: 0 10px;"><b>    ${Intl.NumberFormat(
                                 "en-US",
                                 {
                                    style: "currency",
                                    currency: "PHP",
                                 }
                              ).format(orders.total)}</b>
                              </td>
                          </tr>
                      </table>
                      <table>
                          <tr>
                              <td style="font-family: Poppins; font-size: 15px;">This acknowledgment receipt is your official receipt to
                                  claim your order
                                  at Minerva Sales Corporation.
                                  It is proof that you
                              </td>
                          </tr>
                          <tr>
                              <td style="font-family: Poppins;">have pre-paidyour order either via Gcash, Maya, or Bank Transfer. Kindly
                                  print this
                                  form and present it to one of
                              </td>
                          </tr>
                          <tr>
                              <td style="font-family: Poppins;">
                                  the
                                  establishment's official staff to receive your order.
                              </td>
                          </tr>
                          <tr style="height: 30px;">
                              <td style="font-family: Poppins;">
                  
                              </td>
                          </tr>
                          <tr>
                              <td style="font-family: Poppins;">
                                  Please note that this form does not equate to your official receipt/invoice. An official hard copy will
                                  be provided
                              </td>
                          </tr>
                          <tr>
                              <td style="font-family: Poppins;"> once the transaction is completed.</td>
                          </tr>
                      </table>
                  
                      <table style="border-collapse: separate; width: 900px;">
                          <tr style="height: 50px;">
                  
                          </tr>
                          <tr>
                              <td
                                  style="font-family: Poppins;  width: 50px;  border: none; border-top: 1px solid #000; padding: 0 10px; text-align: center;">
                                  Customer Name &
                                  Signature</td>
                              <td
                                  style="font-family: Poppins;  width: 100px;  border: none; border-top: 1px solid #000; padding: 0 10px;  text-align: center;">
                                  Cashier/
                                  Authorized Representative</td>
                          </tr>
                      </table>
                      <table style="width:900px;">
                          <tr style="height: 30px;">
                  
                          </tr>
                          <tr>
                              <td style=" width: 200px; text-align: center">
                                  <img src="
                                    http://cdn.mcauto-images-production.sendgrid.net/c19fbca0252c8257/91bb1b2a-746f-431b-97d7-482bdcdbad63/1537x546.png"
                                      alt="minerva.logo" height="100" width="250" />
                              </td>
                          </tr>
                      </table>
                  </body>
                  
                  </html>`
               );
            } else {
               SENDMAIL(
                  orders.User[0].email,
                  "Ready for Pick for Pay Upon Pick Cash/Card",
                  `<html lang="en">

                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <link href="/index.css" rel="stylesheet" />
                      <link href="https://fonts.googleapis.com/css2?family=Oxygen&family=Arial:wght@200&family=Rubik&display=swap"
                          rel="stylesheet">
                      <title>Document</title>
                  
                  <body style="box-sizing:  border-box; margin: 0; padding: 0 20px;">
                      <table style="width:1000px; height: auto; ">
                          <tr style="height: 5px;">
                              <td style="font-family: Poppins; text-align: center;">Minerva Sales Corporation</h2>
                              </td>
                          </tr>
                          <tr style="height: 5px;">
                              <td style="font-family: Poppins; text-align: center;">General Malvar Street, Barangay Tubigan</h2>
                              </td>
                          </tr>
                          <tr style="height: 5px;">
                              <td style="font-family: Poppins; text-align: center;">Binan City, Laguna, 4024</h2>
                              </td>
                          </tr>
                          <tr style="height: 45px;">
                              <td style="font-family: Poppins; text-align: center;"><b>Order Form</b></h2>
                              </td>
                          </tr>
                      </table>
                      <table style="width:1200px;">
                          <tr style="height: 45px;">
                              <td style="font-family: Poppins;  width: 10px;"><b>Order ID:</b> ${
                                 orders.orders
                              } </td>
                              <td style="font-family: Poppins;  width: 20px;"><b>Payment Method:</b> Pay-Upon-Pick - ${
                                 orders.payment
                              } </td>
                          </tr>
                          <tr style="height: 20px;">
                              <td style="font-family: Poppins;  width: 140px;"><b>Customer Name:</b> >${
                                 orders.User[0].profile.firstname
                              } ${orders.User[0].profile.lastname}</td>
                              <td style="font-family: Poppins;  width: 200px;"><b>Date Ordered:</b>   ${format(
                                 new Date(orders.createdAt),
                                 "MMMM dd yyyy"
                              )}</td>
                          </tr>
                      </table>
                      <table style="border: 1px solid #000; border-collapse: collapse; margin: 10px 0;">
                          <tr style="height: 35px;">
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>Qty:</b></td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>Product
                                      Name:</b>
                              </td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>Price:</b>
                              </td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>Total:</b>
                              </td>
                          </tr>
                          <tr style="height: 35px;">
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>${
                                 orders.quantity
                              }</b></td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>${
                                 orders.Product[0].name
                              }</b>
                              </td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"> ${
                                 orders.Product[0].price
                              }</b></b>
                              </td>
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b> ${Intl.NumberFormat(
                                 "en-US",
                                 {
                                    style: "currency",
                                    currency: "PHP",
                                 }
                              ).format(orders.total)}</b>
                              </td>
                          </tr>
                          <tr style="height: 35px;">
                              <td style="font-family: Poppins;  width: 200px;  border: 1px solid #000; padding: 0 10px;"><b>TOTAL AMOUNT
                                      DUE</b></td>
                              <td style="font-family: Poppins;  width: 130px; ; padding: 0 10px;"><b> ${Intl.NumberFormat(
                                 "en-US",
                                 {
                                    style: "currency",
                                    currency: "PHP",
                                 }
                              ).format(orders.total)}</b>
                              </td>
                          </tr>
                      </table>
                      <table>
                          <tr>
                              <td style="font-family: Poppins; font-size: 15px;">This Order Form is your official form to claim your order
                                  at Minerva Sales Corporation. Kindly print this form to settle your
                  
                              </td>
                          </tr>
                          <tr>
                              <td style="font-family: Poppins;">payment to one of the
                                  establishment's official staff to receive your order.
                              </td>
                          </tr>
                          <tr style="height: 30px;">
                              <td style="font-family: Poppins;">
                  
                              </td>
                          </tr>
                          <tr>
                              <td style="font-family: Poppins;">
                                  Please note that this form does not equate to your official receipt/invoice. An official hard copy will
                                  be provided
                              </td>
                          </tr>
                          <tr>
                              <td style="font-family: Poppins;"> once the transaction is completed.</td>
                          </tr>
                      </table>
                  
                      <table style="border-collapse: separate; width: 900px;">
                          <tr style="height: 50px;">
                  
                          </tr>
                          <tr>
                              <td
                                  style="font-family: Poppins;  width: 50px;  border: none; border-top: 1px solid #000; padding: 0 10px; text-align: center;">
                                  Customer Name &
                                  Signature</td>
                              <td
                                  style="font-family: Poppins;  width: 100px;  border: none; border-top: 1px solid #000; padding: 0 10px;  text-align: center;">
                                  Cashier/
                                  Authorized Representative</td>
                          </tr>
                      </table>
                      <table style="width:900px;">
                          <tr style="height: 30px;">
                  
                          </tr>
                          <tr>
                              <td style=" width: 200px; text-align: center">
                                  <img src="
                                    http://cdn.mcauto-images-production.sendgrid.net/c19fbca0252c8257/91bb1b2a-746f-431b-97d7-482bdcdbad63/1537x546.png"
                                      alt="minerva.logo" height="100" width="250" />
                              </td>
                          </tr>
                      </table>
                  </body>
                  
                  </html>`
               );
            }

            break;
      }

      await prisma.logs.create({
         data: {
            title: "Edited Order Details",
            User: {
               connect: {
                  userID: adminUserID,
               },
            },
         },
      });

      res.json(orders);
   })
);

export default router;
