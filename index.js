require("dotenv").config();
const app = require("./routes");

const port = process.env.PORT || 3003;

app.listen(port, () => {
  console.log("app now listening for requests!!!");
});
