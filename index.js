const jimp = require("jimp");
const fs = require("fs");

const { spawn } = require("child_process");
const method = process.argv[2];
const sourcePath = process.argv[3] || "./default.mp4";

if (method === "image" && sourcePath) {
  scanImage(sourcePath);
} else if (method == "video" && sourcePath) {
  const child = spawn("node", ["./frames.js", sourcePath]);
  child.stdout.on("data", (data) => {
    console.log(data.toString());
  });
  child.on("close", (code) => {
    playVideo();
  });
} else {
  console.log("Nothing happend..");
}

//? scan image and get all pixels
async function scanImage(imagePath) {
  try {
    const image = await jimp.read(imagePath);
    imageSizeLimit(image);
    let colorArray = [];
    await image.scan(
      0,
      0,
      image.bitmap.width,
      image.bitmap.height,
      function (x, y, idx) {
        var red = this.bitmap.data[idx + 0];
        var green = this.bitmap.data[idx + 1];
        var blue = this.bitmap.data[idx + 2];
        var alpha = this.bitmap.data[idx + 3];

        colorArray.push(identifyColor(red, green, blue));
      }
    );

    createMatrix(image.bitmap.width, image.bitmap.height, colorArray);
  } catch (error) {
    console.log(error.message);
  }
}

//? It takes an input of rbg type and determines what this color is
function identifyColor(red, green, blue) {
  const grayscaleThreshold = 50; // Adjust as needed

  if (red === green && green === blue) {
    if (red < grayscaleThreshold) {
      return "\x1b[30m" + "■" + "\x1b[0m";
    } else if (red > 255 - grayscaleThreshold) {
      return "\x1b[37m" + "■" + "\x1b[0m";
    } else {
      return "\x1b[38;5;244m" + "■" + "\x1b[0m";
    }
  } else if (red > green && red > blue) {
    if (green < grayscaleThreshold && blue < grayscaleThreshold) {
      return "\x1b[31m" + "■" + "\x1b[0m";
    } else if (blue > green) {
      return "\x1b[35m" + "■" + "\x1b[0m";
    } else {
      return "\x1b[33m" + "■" + "\x1b[0m";
    }
  } else if (green > red && green > blue) {
    if (red < grayscaleThreshold && blue < grayscaleThreshold) {
      return "\x1b[32m" + "■" + "\x1b[0m";
    } else if (red > blue) {
      return "\x1b[33m" + "■" + "\x1b[0m";
    } else {
      return "\x1b[36m" + "■" + "\x1b[0m";
    }
  } else if (blue > red && blue > green) {
    if (red < grayscaleThreshold && green < grayscaleThreshold) {
      return "\x1b[34m" + "■" + "\x1b[0m";
    } else if (red > green) {
      return "\x1b[35m" + "■" + "\x1b[0m";
    } else {
      return "\x1b[36m" + "■" + "\x1b[0m";
    }
  } else {
    return "\x1b[0m";
  }
}

//? create array of charecter that means pixel
function createMatrix(rows, columns, colorArray) {
  const matrix = [];
  let count = 0;
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      row.push(colorArray[count]);
      count += 1;
    }
    matrix.push(row);
  }

  displayMatrix(matrix);
}

//? and show preety and showable
function displayMatrix(matrix) {
  matrix.forEach((row) => {
    console.log(row.join(" "));
  });
}

//! limit for width and height:

async function imageSizeLimit(image) {
  if (image.bitmap.width > 100 && image.bitmap.height > 100)
    throw Error("Use a 100x100 pixel image");
}
function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function playVideo() {
  fs.readdir("./frames", async (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }
    files = numericSort(files);
    for (const file of files) {
      await scanImage(`./frames/${file}`);
      await delay(10);
      console.clear();
    }
  });
}

function numericSort(fileNames) {
  return fileNames.sort((a, b) => {
    const aNum = parseInt(a.split(".")[0]);
    const bNum = parseInt(b.split(".")[0]);
    return aNum - bNum;
  });
}
