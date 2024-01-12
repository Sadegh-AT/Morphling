const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

const inputVideoPath = "./default.mp4";

const outputDirectory = "frames";

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

async function extractFrames(inputPath, outputDirectory = "frames") {
  ffmpeg(inputPath)
    .on("filenames", (filenames) => {
      console.log(`Frames will be saved as: ${filenames.join(", ")}`);
    })
    .on("end", () => {
      console.log("Frame extraction finished");
    })
    .on("error", (err) => {
      console.error(`Error: ${err}`);
    })
    .screenshots({
      count: 30,
      folder: outputDirectory,
      size: "100x100",
      filename: "%i.png",
    });
}

extractFrames(inputVideoPath, outputDirectory);
