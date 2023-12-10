import express from "express";
import { prisma } from "../../server.mjs";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import tryCatch from "../../middleware/trycatch.mjs";
import { SENDMAIL } from "../../helpers/sengrid.mjs";
import TryCatch from "../../middleware/trycatch.mjs";
import { RandomGenerateId } from "../../helpers/randomString.mjs";
const { sign } = jsonwebtoken;
const router = express.Router();

router.post(
   "/createAdminAccount",
   tryCatch(async (req, res) => {
      const { password, email, firstname, lastname, phone, shipping } =
         req.body;

      if (!password || !email || !firstname || !lastname || !phone || !shipping)
         throw new Error("Field should not be empty.");

      const pass = await bcryptjs.hash(password, 12);

      const users = await prisma.user.create({
         data: {
            email: email,
            id: `#${RandomGenerateId(6)}`,
            password: pass,
            role: "admin",
            verified: true,
            profile: {
               create: {
                  firstname,
                  lastname,
                  phone: phone,
                  shipping,
               },
            },
         },
         include: {
            profile: true,
         },
      });

      res.json(users);
   })
);

router.post(
   "/createCustomer",
   tryCatch(async (req, res) => {
      const { password, email, firstname, lastname, phone, shipping } =
         req.body;

      const pass = await bcryptjs.hash(password, 12);

      const users = await prisma.user.create({
         data: {
            id: `#${RandomGenerateId(6)}`,
            email,
            password: pass,
            role: "customer",
            verified: false,
            profile: {
               create: {
                  firstname,
                  lastname,
                  phone,
                  shipping,
               },
            },
         },
      });

      SENDMAIL(
         email,
         "Email Verification",
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
                  <td style="font-family: Poppins;">Hello ${firstname} ${lastname}</h2>
                  </td>
              </tr>
              <tr style=" height: 60px;">
                  <td style="font-family: Poppins;">Your registration in Minerva Sales Corp. can be verified by clicking the button down below
                  </td>
              </tr>
              <tr style=" height: 60px;">
                  <td>
                      <a style="text-decoration: none; background-color: #FFC300; color: black; padding:
                  15px 20px; border-radius: 5px; font-family: Poppins;"
                          href='http://localhost:3000/confirmation/${users.userID}'>Verify
                          Registration</a>
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

      res.json(users);
   })
);

router.post(
   "/login",
   tryCatch(async (req, res) => {
      if (!req.body.email || !req.body.password)
         throw new Error("Field should not be empty");
      const loginUser = await prisma.user.findUnique({
         where: {
            email: req.body.email,
         },
      });

      if (loginUser.verified === false)
         throw new Error("You need to verify your account first");

      if (!loginUser) throw new Error("Email does not exist");

      const valid = await bcryptjs.compare(
         req.body.password,
         loginUser.password
      );

      if (!valid) throw new Error("Password is not match");

      const token = sign(
         { userID: loginUser.userID, role: loginUser.role },
         "ecom_token",
         {
            algorithm: "HS256",
            expiresIn: 60 * 60 * 24 * 7,
         }
      );

      res.cookie("ecom_token", token);

      res.json(token);
   })
);

router.put(
   "/confirmation/:id",
   tryCatch(async (req, res) => {
      const users = await prisma.user.update({
         data: {
            verified: true,
         },
         where: { userID: req.params.id },
      });
      res.status(200).send("User is verifeid, go and login.");
      res.json(users);
   })
);

router.delete(
   "/deleteUser/:id",
   tryCatch(async (req, res) => {
      const users = await prisma.user.delete({
         where: { userID: req.params.id },
      });

      res.json(users);
   })
);

router.post(
   "/requestPasswordReset",
   TryCatch(async (req, res) => {
      const { email } = req.body;

      const users = await prisma.user.findUnique({
         where: { email },
         include: {
            profile: true,
         },
      });

      if (!users) throw new Error("Email address not found");

      SENDMAIL(
         email,
         "Request Reset Password",
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
                  <td style="font-family: Poppins;">Your password in Minerva Sales Corp. can be reset by clicking the button below. 
                  </td>
              </tr>
              <tr style=" height: 60px;">
                  <td>
                      <a style="text-decoration: none; background-color: #FFC300; color: black; padding:
                  15px 20px; border-radius: 5px; font-family: Poppins;"
                          href='http://localhost:3000/auth/changePassDetails/${users.userID}'>Change
                          Password</a>
                  </td>
              </tr>
              <tr style="height: 60px;">
                  <td style="font-family: Poppins;">
                  If you did not request a new password, please ignore this email.
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
   })
);
router.put(
   "/forgotPassword/:id",
   tryCatch(async (req, res) => {
      const { password, retypepassword, olderPassword, userID } = req.body;

      if (password !== retypepassword)
         throw new Error("Password is mismatched");

      const userForget = await prisma.user.findUnique({
         where: {
            userID,
         },
      });

      const oldPass = await bcryptjs.compare(olderPassword, userForget);

      if (!oldPass) throw new Error("Old Password is incorrect. Try Again");

      const pass = await bcryptjs.hash(password, 12);

      const users = await prisma.user.update({
         data: {
            password: pass,
            updatedAt: new Date(Date.now()),
         },
         where: {
            userID: req.params.id,
         },
      });

      await prisma.logs.create({
         data: {
            title: "Change password",
            User: {
               connect: {
                  userID: users.userID,
               },
            },
         },
      });

      res.json(users);
   })
);

router.put(
   "/changePassword/:id",
   tryCatch(async (req, res) => {
      const pass = await bcryptjs.hash(req.body.password, 12);

      const users = await prisma.user.update({
         data: {
            password: pass,
         },
         where: {
            userID: req.params.id,
         },
      });

      await prisma.logs.create({
         data: {
            title: "Change Password Successful",
         },
      });
      res.json(users);
   })
);

router.patch(
   "/updateAccountDetails/:id",
   tryCatch(async (req, res) => {
      const { email, firstname, lastname, phone, shipping } = req.body;
      const users = await prisma.user.update({
         data: {
            email,
            profile: {
               update: {
                  firstname,
                  lastname,
                  phone,
                  shipping,
               },
            },
         },
         where: {
            userID: req.params.id,
         },
      });

      await prisma.logs.create({
         data: {
            title: "Edited profile details",
            User: {
               connect: {
                  userID: users.userID,
               },
            },
         },
      });
      res.json(users);
   })
);

export default router;
