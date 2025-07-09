import { buildProject } from "./utils";
import { downloadS3Folder, copyFinalDist } from "./aws";
import { createClient } from "redis";

const subscriber = createClient();

subscriber.connect();

const publisher = createClient();
publisher.connect();

async function main() {
  while (true) {
    const res = await subscriber.brPop("build-queue", 0);
    // @ts-ignore
    const id = res.element;

    await downloadS3Folder(`output/${id}/`);
    console.log("completed");
    await buildProject(id);
    console.log("buildComplete");
    await copyFinalDist(id);
    console.log("pushed");
    publisher.hSet("status", id, "deployed");
  }
}

main();
