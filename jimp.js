const jimp = require("jimp");

//? scan image and get all pixels
async function scanImage() {
  const image = await jimp.read("./rgb3.png");
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
}

//? It takes an input of rbg type and determines what this color is
function identifyColor(red, green, blue) {
  if (red > green && red > blue) {
    return "\x1b[31m" + "■" + "\x1b[0m";
  } else if (green > red && green > blue) {
    return "\x1b[32m" + "■" + "\x1b[0m";
  } else if (blue > red && blue > green) {
    return "\x1b[34m" + "■" + "\x1b[0m";
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

scanImage();
