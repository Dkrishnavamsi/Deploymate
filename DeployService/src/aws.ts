import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

const s3 = new S3({
  accessKeyId: "7ea9c3f8c7f0f26f0d21c5ce99d1ad6a",
  secretAccessKey:
    "b4df203781dd711223ce931a2d7ca269cdbf81bb530de4548474584951b798be",
  endpoint: "https://e21220f4758c0870ba9c388712d42ef2.r2.cloudflarestorage.com",
});

// export async function downloadS3Folder(prefix: string) {
//   console.log("Starting download for prefix:", prefix);

//   const allFiles = await s3
//     .listObjectsV2({
//       Bucket: "vercel",
//       Prefix: prefix,
//     })
//     .promise();

//   if (!allFiles.Contents || allFiles.Contents.length === 0) {
//     console.log("No files found under prefix:", prefix);
//     return;
//   }

//   const downloadPromises = allFiles.Contents.filter(({ Key }) => !!Key) // Filter out undefined Keys
//     .map(({ Key }) => {
//       return new Promise<void>((resolve, reject) => {
//         const finalOutputPath = path.join(__dirname, Key!);
//         const dirName = path.dirname(finalOutputPath);

//         if (!fs.existsSync(dirName)) {
//           fs.mkdirSync(dirName, { recursive: true });
//         }

//         const fileStream = fs.createWriteStream(finalOutputPath);

//         s3.getObject({
//           Bucket: "vercel",
//           Key: Key!,
//         })
//           .createReadStream()
//           .on("error", (err) => {
//             console.error(`S3 Stream Error for ${Key}:`, err);
//             reject(err);
//           })
//           .pipe(fileStream)
//           .on("close", () => {
//             console.log(`Downloaded: ${Key}`);
//             resolve();
//           })
//           .on("error", (err) => {
//             console.error(`File Write Error for ${Key}:`, err);
//             reject(err);
//           });
//       });
//     });

//   console.log(`Downloading ${downloadPromises.length} files...`);

//   try {
//     await Promise.all(downloadPromises);
//     console.log("All files downloaded successfully.");
//   } catch (err) {
//     console.error("Error occurred during download:", err);
//   }
// }

export async function downloadS3Folder(prefix: string) {
  const allFiles = await s3
    .listObjectsV2({
      Bucket: "varcel",
      Prefix: prefix,
    })
    .promise();

  //
  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        s3.getObject({
          Bucket: "varcel",
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          });
      });
    }) || [];
  console.log("awaiting");

  await Promise.all(allPromises?.filter((x) => x !== undefined));
}

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

export const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};

export function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const filePathModifiled = folderPath.replace(/\\/g, "/");
  const allFiles = getAllFiles(filePathModifiled);
  allFiles.forEach((file) => {
    const fileModified = file.replace(/\\/g, "/");
    uploadFile(`dist/${id}/` + fileModified.slice(folderPath.length + 1), file);
  });
}
