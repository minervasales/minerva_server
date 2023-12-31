import SGrid from "@sendgrid/mail";

SGrid.setApiKey(process.env.SENDGRIDAPI);

export const SENDMAIL = (email, subject, message) => {
   SGrid.send({
      to: email,
      from: "minervasalesweb@gmail.com",
      subject,
      content: [{ type: "text/html", value: message }],
   });
};


export const emailReminder = (email, subject, message, date) => {
   SGrid.send({
      to: email,
      from: "minervasalesweb@gmail.com",
      subject,
      content: [{ type: "text/html", value: message }],
      sendAt: date
   })
}