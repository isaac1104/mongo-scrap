const cheerio = require("cheerio");
const mongojs = require("mongojs");
const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const PORT = 3000;
const app = express();
const exphbs = require("express-handlebars");
const path = require("path");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public/assets"));

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
  db.scrapedData.find({}, (error, data) => {
    if (error) {
      res.status(500).end();
    } else {
      res.render("index", {data});
    }
  })
});

const databaseUrl = "nyt-scraper";
const collections = ["scrapedData"];

const db = mongojs(databaseUrl, collections);
db.on("error", (error) => {
  console.log(`Database Error: ${error}`);
});

app.get("/api", (req, res) => {
  db.scrapedData.find({}, (error, data) => {
    if (error) {
      return console.log(error);
    } else {
      res.json(data);
    }
  });
});

app.get("/scrape", (req, res) => {
  request("https://www.nytimes.com/section/sports/basketball", (error, response, html) => {
    const $ = cheerio.load(html);
    $(".story-meta").each((i, element) => {
      const title = $(element).children(".headline").text().trim();
      const summary = $(element).children(".summary").text().trim();
      const link = $(element).parent(".story-link").attr("href");
      const image = $(element).siblings(".wide-thumb").children("img").attr("src");

      if (title && summary) {
        db.scrapedData.insert({
          title,
          summary,
          link,
          image
        }, function(err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
          }
        });
      }
    });
    db.scrapedData.find({}, (error, data) => {
      if (error) {
        return console.log(error);
      } else {
        res.redirect("/");
      }
    });
  });
});

app.get("/delete", (req, res) => {
  db.scrapedData.drop({}, (error, data) => {
    if (error) {
      return console.log(error);
    } else {
      console.log("Articles Deleted");
    }
  });
  return res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server connected on ${PORT}`);
});
