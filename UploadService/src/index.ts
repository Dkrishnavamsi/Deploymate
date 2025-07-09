// id - fd8e01fb77fd612569b7999e28811581
// secrert -05f5b718a0d2a23723d6c658fa69d65759bc92413d71c2e51ce39a090552f221
// endpoint - https://4487ab7b2e986fb6cec527a1a485679f.r2.cloudflarestorage.com

import express from "express";

import cors from "cors";
import simpleGit from "simple-git";
import { generateId } from "./utils";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { createClient } from "redis";
const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generateId();
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  const uploadPromises = files.map(async (file) => {
    const filePath = file.slice(__dirname.length + 1).replace(/\\/g, "/");
    await uploadFile(filePath, file);
  });

  await Promise.all(uploadPromises);

  publisher.lPush("build-queue", id);

  publisher.hSet("status", id, "uploaded");
  res.json({ id: id });
});

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await subscriber.hGet("status", id as string);
  res.json({
    status: response,
  });
});

app.listen(3000);
