import express from "express";
import tryCatch from "../../middleware/trycatch.mjs";
import { prisma } from "../../server.mjs";
import { SENDMAIL } from "../../helpers/sengrid.mjs";
import TryCatch from "../../middleware/trycatch.mjs";
import { RandomGenerateId } from "../../helpers/randomString.mjs";
const router = express.Router();

router.post(
   "/createSchedule",
   tryCatch(async (req, res) => {
      const { date, time, userID, service } = req.body;

      const dateVerified = await prisma.schedule.findMany({
         where: {
            date,
         },
      });

      if (dateVerified.length >= 2)
         throw new Error("The 2 maximum exceed to schedule this day");

      const schedule = await prisma.schedule.create({
         data: {
            id: `#${RandomGenerateId(6)}`,
            date,
            service,
            status: "pending",
            time,
            User: {
               connect: {
                  userID,
               },
            },
         },
      });

      await prisma.logs.create({
         data: {
            title: "Booked appointment",
            User: {
               connect: {
                  userID,
               },
            },
         },
      });

      res.json(schedule);
   })
);

router.post(
   "/createManualSchedule",
   tryCatch(async (req, res) => {
      const { date, time, name, service, status, userID } = req.body;

      const dateVerified = await prisma.schedule.findMany({
         where: {
            date,
         },
      });

      if (dateVerified.length >= 2)
         throw new Error("The 2 maximum exceed to schedule this day");

      const schedule = await prisma.schedule.create({
         data: {
            id: `#${RandomGenerateId(6)}`,
            date,
            service,
            status: "Pending",
            time,
            name,
         },
      });

      await prisma.logs.create({
         data: {
            title: "Booked appointment",
            User: {
               connect: {
                  userID,
               },
            },
         },
      });

      res.json(schedule);
   })
);

router.post(
   "/setReminderAppointment",
   TryCatch(async (req, res) => {
      const { email } = req.body;

      const users = await prisma.user.findUnique({
         where: {
            email,
         },
         include: {
            profile: true,
         },
      });

      if (!users) throw new Error("Email doest not exist");

      const appointment = await prisma.schedule.findMany({
         where: {
            NOT: {
               status: "rejected",
               AND: {
                  status: "pending",
               },
            },
            User: {
               some: {
                  email,
               },
            },
         },
         orderBy: {
            createdAt: "desc",
         },
      });

      SENDMAIL(
         email,
         "Appointment Reminder",
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
                  <td style="font-family: Poppins;">We are reminding you that your appointment with Minerva Sales Corp. is set
                      for tomorrow at ${appointment[0].date} ${appointment[0].time} for ${appointment[0].service}.
                  </td>
              </tr>
              <tr style=" height: 60px;">
                  <td style="font-family: Poppins;">For any inquiries, log in to your Minerva Sales Corp. account and inquire
                      via chatbox or message our Facebook page. Thank you.
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
   })
);

router.put(
   "/updateSchedule/:id",
   tryCatch(async (req, res) => {
      const { status, userID } = req.body;
      const schedule = await prisma.schedule.update({
         where: {
            scheduleID: req.params.id,
         },
         data: {
            status,
         },
         include: {
            User: true,
         },
      });

      await prisma.logs.create({
         data: {
            title: "Edited Appointment Details",
            createdAt: new Date(Date.now()),
            User: {
               connect: {
                  userID,
               },
            },
         },
      });

      res.json(schedule);
   })
);

export default router;
