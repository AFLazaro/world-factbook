const express = require('express');
const app = express();
const fetch = require('node-fetch');
const path = require("path");

const port = process.env.PORT || 3000;
const api_url = "https://restcountries-v1.p.rapidapi.com/";
const searchCategories = ["All", "Country Name", "Country Code", "Calling Code", "Capital City", "Currency", "Language", "Region"]

let data = {};
let displayData = {};
let errorCode, errorText;
let ccSearch = false;

require('dotenv').config();

// https://rapidapi.com/apilayernet/api/rest-countries-v1?endpoint=53aa5a09e4b051a76d24136a
// http://bootflat.github.io/color-picker-green.html


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
  console.log(`SERVING ON PORT ${port}`);
})



// Search logic / Fetch
async function getResults(searchQuery, switchCategory) {
  if(switchCategory === "all") { searchQuery = ""; }
  
  const response = await fetch(`${api_url}${switchCategory}${searchQuery.toLowerCase()}`, {
    "method": "GET",
    "headers": {
      "x-rapidapi-key": process.env.API_KEY,
      "x-rapidapi-host": "restcountries-v1.p.rapidapi.com"
    }
  })
    
  if (response.status >= 400 && response.status <= 499){
    errorCode = response.status;
    errorText = response.statusText;
  } else {
    return await response.json();
  }
}



// Index page
app.get("/", (req, res) => {
  res.render("index", { searchCategories });
})

app.post("/", async (req, res) => {
  ccSearch = false;
  let switchCategory;
  let searchCategory = req.body.searchCategory;
  let searchQuery = req.body.search;

  switch(searchCategory){
    case "All":
      switchCategory = "all";
      break;
    case "Country Name":
      switchCategory = "name/";
      break;
    case "Country Code":
      switchCategory = "alpha/";
      ccSearch = true;
      break;
    case "Calling Code":
      switchCategory = "callingcode/";
      break;
    case "Capital City":
      switchCategory = "capital/";
      break;
    case "Currency":
      switchCategory = "currency/";
      break;
    case "Language":
      switchCategory = "lang/";
      break;
    case "Region":
      switchCategory = "region/";
      break;
  }

  data = await getResults(searchQuery, switchCategory);

  if (!data || data === "Not Found"){
    res.redirect("/notfound");
  } else {
    res.redirect("/results");
  }
});

app.get("/results", (req, res) => {
  res.render("list", { searchCategories, ccSearch, data });
})

app.post("/results", (req, res) => {
  if(ccSearch){
    displayData = data;
  } else {
    displayData = data[req.body.countryIndex];
  }

  res.redirect("/results/info");
})

app.get("/results/info", (req, res) => {
  res.render("info", { searchCategories, displayData });
})

app.get("/notfound", (req, res) => {
  res.render("notfound", { searchCategories, errorCode, errorText })
})