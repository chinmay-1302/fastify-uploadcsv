import fastify from "fastify";
import multipart from "@fastify/multipart";
import fs from "fs";
import util from "util";
import { pipeline } from "stream";

const pump = util.promisify(pipeline);

const server = fastify({
  logger: true,
});

server.register(multipart);

// ensure uploads directory exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// Create home route
server.get("/", async function handler(request, reply) {
  return { test: "some data is here" };
});

server.post("/upload-csv", async function handler(request, reply) {
  const parts = request.files();
  const fileTypes = ["text/csv", "application/vnd.ms-excel"];
  // check if the file is csv
  for await (const part of parts) {
    if (!fileTypes.includes(part.mimetype)) {
      return { message: "Invalid file type" };
    }
  }
  for await (const part of parts) {
    // upload and save the file
    await pump(part.file, fs.createWriteStream(`./uploads/${part.filename}`));
  }

  return { message: "files uploaded" };
});

// Run web server
server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
