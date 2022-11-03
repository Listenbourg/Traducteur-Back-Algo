const axios = require("axios");
const { getBasicPart, getTranslatedPart } = require("./similarity");
const BASE_URL = "http://51.210.104.99:1337/api";
var stringSimilarity = require("string-similarity");
const DEBUG = false;

module.exports = {
  getCorrespondantWord,
};

async function getCorrespondantWord(from, to, word) {
  DEBUG && console.log("CRSPOND : Check for word --> " + word);
  /**
   * Fetch all words from the database thats contains the basic word
   */
  let part = from === "fr" ? "base" : "translation";
  let correspondant = await axios.get(
    BASE_URL +
      "/translations?filters[" +
      part +
      "][$contains]=" +
      word +
      "&pagination[start]=0&pagination[limit]=1000000"
  );

  DEBUG &&
    console.log("CRSPOND : Found " + correspondant.data.data.length + " words");

  /**
   * If no words, return null
   */
  if (correspondant.data.data.length == 0) return null;

  let datas = correspondant.data.data;

  /**
   * If multiples words, compute the similarity score
   */
  if (datas.length > 1) {
    let allScore = [];

    for (let data of datas) {
      let baseWord = getBasicPart(from, data);
      allScore.push(baseWord);
    }

    var matches = stringSimilarity.findBestMatch(word, allScore);
    let bestWord = datas[matches.bestMatchIndex];

    let translatedPart = getTranslatedPart(from, bestWord);

    /**
     * If the score is too low, return base word
     */
    if (matches.bestMatch.rating < 0.2) return { word: `#${word}#`, score: -1 };

    return { word: translatedPart, score: matches.bestMatch.rating };

    /**
     * If only one word, return it
     */
  } else {
    let currentWord = getTranslatedPart(from, datas[0]);
    return { word: currentWord, score: 1 };
  }
}
