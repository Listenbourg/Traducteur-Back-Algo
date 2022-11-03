const axios = require("axios");
const BASE_URL = "http://51.210.104.99:1337/api";
var stringSimilarity = require("string-similarity");
const DEBUG = false;

module.exports = {
  findSimilarity,
  getBasicPart,
  getTranslatedPart,
};

/**
 * Find the most similar word in the database
 * @param {*} from country code
 * @param {*} to country code
 * @param {*} word word to translate
 * @returns
 */
async function findSimilarity(from, to, word) {
  /**
   * Fetch all words from the database
   */
  let correspondant = await axios.get(
    BASE_URL + "/translations?pagination[start]=0&pagination[limit]=1000000"
  );
  let datas = correspondant.data.data;

  DEBUG &&
    "SMLRTY : Analyse word : " + word + " with " + datas.length + " datas";

  /**
   * Store all words score in an array
   */
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
  if (matches.bestMatch.rating < 0.4) return { word: `${word}`, score: -1 };

  return { word: translatedPart, score: matches.bestMatch.rating };
}

/**
 * Get the correct part of the words
 */
function getTranslatedPart(from, obj) {
  if (from == obj.attributes.from) {
    return obj.attributes.word.split("#")[1];
  } else {
    return obj.attributes.word.split("#")[0];
  }
}

/**
 * Get the correct part of the words
 */
function getBasicPart(from, obj) {
  if (from == obj.attributes.from) {
    return obj.attributes.word.split("#")[0];
  } else {
    return obj.attributes.word.split("#")[1];
  }
}
