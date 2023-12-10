import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
   region: process.env.REGION,
   credentials: {
      accessKeyId: process.env.ACCESSKEY,
      secretAccessKey: process.env.SECRETKEY,
   },
});

export const uploadImage = multer({
   storage: multerS3({
      s3: client,
      bucket: process.env.BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: "public-read",
      key: (req, file, cb) => {
         cb(null, file.originalname);
      },
   }),
});
