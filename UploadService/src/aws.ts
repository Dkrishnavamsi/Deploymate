// filename: output/abd.ts (where to store)
// localFileName: complete path from where to upload

import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
  accessKeyId: "7ea9c3f8c7f0f26f0d21c5ce99d1ad6a",
  secretAccessKey:
    "b4df203781dd711223ce931a2d7ca269cdbf81bb530de4548474584951b798be",
  endpoint: "https://e21220f4758c0870ba9c388712d42ef2.r2.cloudflarestorage.com",
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
  console.log("called");
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: "varcel",
      Key: fileName,
    })
    .promise();
  console.log(response);
};
