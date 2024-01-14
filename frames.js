const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

const inputVideoPath = "./Interstellar.mp4";
const outputDirectory = "frames";
const outputVideoProcess = "processed";
const contrast = 2.5;
const brightness = 0.2;
const sharpness = 5;
const frames = 60;

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}
if (!fs.existsSync(outputVideoProcess)) {
  fs.mkdirSync(outputVideoProcess);
}
removeAllFilesInDirectory(outputVideoProcess);

async function extractFrames(inputPath, outputDirectory = "frames") {
  const resizedPath = await resizeVideo(inputPath, 100, 100);
  inputPath = await makeVideoBlackAndWhite(
    resizedPath,
    contrast,
    brightness,
    sharpness
  );
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
      count: frames,
      folder: outputDirectory,
      size: "100x100",
      filename: "%i.png",
    });
}
function resizeVideo(inputFilePath, outputWidth, outputHeight) {
  const outputFilePath = resizedPath(inputFilePath);

  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .size(`${outputWidth}x${outputHeight}`)
      .on("end", () => {
        console.log("Video resizing finished");
        resolve(outputFilePath);
      })
      .on("error", (err) => {
        console.error("Error:", err);
        reject(err);
      })
      .save(outputFilePath);
  });
}
function makeVideoBlackAndWhite(
  inputFilePath,
  contrast,
  brightness,
  sharpness
) {
  const outputFilePath = blackAndWhitePath(inputFilePath);

  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .videoFilter(
        `colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3,eq=contrast=${contrast}:brightness=${brightness},unsharp=${sharpness}`
      )
      .on("end", () => {
        console.log("Video processing finished");
        resolve(outputFilePath);
      })
      .on("error", (err) => {
        console.error("Error:", err);
        reject(err);
      })
      .save(outputFilePath);
  });
}

function resizedPath(inputFilePath) {
  const ext = path.extname(inputFilePath);
  return `${path.dirname(inputFilePath)}/${outputVideoProcess}/${
    path.basename(inputFilePath).replace(" ", "-").split(ext)[0]
  }-resized${ext}`;
}
function blackAndWhitePath(inputFilePath) {
  const ext = path.extname(inputFilePath);

  return `${path.dirname(inputFilePath)}/${
    path.basename(inputFilePath).replace(" ", "-").split(ext)[0]
  }-graymode${ext}`;
}

function removeAllFilesInDirectory(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const fileDeletionPromises = files.map((file) => {
        const filePath = path.join(directoryPath, file);

        return new Promise((resolveFile, rejectFile) => {
          fs.unlink(filePath, (err) => {
            if (err) {
              rejectFile(err);
              return;
            }
            resolveFile(filePath);
          });
        });
      });

      Promise.all(fileDeletionPromises)
        .then((deletedFiles) => {
          console.log(
            `Removed ${deletedFiles.length} files in ${directoryPath}`
          );
          resolve();
        })
        .catch((err) => {
          console.error("Error deleting files:", err);
          reject(err);
        });
    });
  });
}
extractFrames(inputVideoPath, outputDirectory);
