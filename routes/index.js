var express = require("express");
var router = express.Router();
const axios = require("axios");

const BASE_URL = "http://51.210.104.99:1337/api";

router.get("/", function (req, res, next) {
  res.json({ status: 200 });
});

router.post("/translate", async function (req, res, next) {
  let from = req.body.from.toLowerCase();
  let to = req.body.to.toLowerCase();
  let text = req.body.text.toLowerCase();

  let translatedText;
  let status = 200;
  switch (from) {
    case "fr":
      if (to == "lis")
        translatedText = await translateFromFrench(from, to, text);
      break;
    case "lis":
      if (to == "fr")
        translatedText = await translateFromListenbourg(from, to, text);
      break;
    default:
      break;
  }

  if (!translatedText) status = 404;

  res.json({ status: status, response: translatedText });
});

// create similliraty word algorithm to calcultate percentage of similarity
function getSimilarityScore(word1, word2) {
  let score = 0;
  let word1Length = word1.length;
  let word2Length = word2.length;
  let word1Array = word1.split("");
  let word2Array = word2.split("");
  let word1ArrayCopy = word1.split("");
  let word2ArrayCopy = word2.split("");

  for (let i = 0; i < word1Length; i++) {
    for (let j = 0; j < word2Length; j++) {
      if (word1Array[i] == word2Array[j]) {
        score++;
        word1ArrayCopy[i] = "";
        word2ArrayCopy[j] = "";
        break;
      }
    }
  }
  return score / (word1Length + word2Length);
}

async function findSimilarity(from, to, word) {
  let correspondant = await axios.get(BASE_URL + "/translations");

  let datas = correspondant.data.data;

  let allScore = [];

  for (let data of datas) {
    let currentWord = data.attributes.word.split("#")[0];
    let translatedWord = data.attributes.word.split("#")[1];
    let score = getSimilarityScore(word, currentWord);
    allScore.push({ score: score, word: translatedWord });
  }

  let maxScore = 0;
  let maxWord = "";
  for (let score of allScore) {
    if (score.score > maxScore) {
      maxScore = score.score;
      maxWord = score.word;
    }
  }

  return maxWord;
}

async function getCorrespondantWord(from, to, word) {
  let correspondant = await axios.get(
    BASE_URL + "/translations?filters[word][$contains]=" + word
  );

  if (correspondant.data.data.length == 0) return null;

  let datas = correspondant.data.data;

  console.log(datas);

  let allScore = [];
  if (datas.length > 1) {
    for (let data of datas) {
      let currentWord = data.attributes.word.split("#")[0];
      let translatedWord = data.attributes.word.split("#")[1];
      let score = getSimilarityScore(word, currentWord);
      allScore.push({ score: score, word: translatedWord });
    }

    let maxScore = 0;
    let maxWord = "";
    for (let score of allScore) {
      if (score.score > maxScore) {
        maxScore = score.score;
        maxWord = score.word;
      }
    }

    return maxWord;
  } else {
    let currentWord = datas[0].attributes.word.split("#")[1];
    return currentWord;
  }
}

async function translateFromFrench(from, to, text) {
  // Split words into array
  let arrayWord = text.split(" ");
  // New array words
  let newTranslation = [];

  for (let word of arrayWord) {
    // Get word from other language
    let correspond = await getCorrespondantWord(from, to, word);

    if (!correspond) {
      correspond = await findSimilarity(from, to, word);
    }

    newTranslation.push(correspond);
  }

  return newTranslation.join(" ");
}

function translateFromListenbourg(from, to, text) {
  // todo
  return text;
}

module.exports = router;
