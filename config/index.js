const Cloud = require("@google-cloud/storage");
const path = require("path");

const serviceKey = path.join(__dirname, "./key.json");

console.log(serviceKey);

const { Storage } = Cloud;
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: "poised-backbone-370813",
});

module.exports = storage;
