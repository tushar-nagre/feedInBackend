const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.static("public"));
const User = require("./model/userSchema");

dotenv.config({ path: "./config.env" });
require("./db/conn");
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use(require("./router"));

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port no.${PORT}`);
});
