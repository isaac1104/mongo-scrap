const express = require("express");
const bodyParser = require("body-parser");
const PORT = 3000;
const app = express();
const exphbs = require("express-handlebars");
const path = require("path");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public/assets"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
  res.render("index.handlebars");
});

app.listen(PORT, () => {
  console.log(`Server connected on ${PORT}`);
});
