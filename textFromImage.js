const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  keyFilename: "./config/key.json",
});

const detectText = async (fileName) => {
  const [result] = await client.textDetection(fileName);
  const detections = result.textAnnotations;
  let resultText = detections[0].description.toString().toLowerCase();
  resultText = resultText
    .replace(/(?:\r\n|\r|\n)/g, " ")
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
  return resultText;
};

module.exports = detectText;
