import express from "express";
import ArchiveQuery from "./archive.query.mjs";
import ArchiveMutation from "./archive.mutation.mjs";

const router = express();

router.use("/archive", ArchiveQuery);
router.use("/archive", ArchiveMutation);

export default router;
