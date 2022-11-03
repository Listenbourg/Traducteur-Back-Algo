var express = require("express");
var router = express.Router();

const { getCorrespondantWord } = require("./correspond");
const { findSimilarity } = require("./similarity");

const DEBUG = false;

router.get("/", function (req, res, next) {
  res.json({ status: 200 });
});

router.get("/translate", async function (req, res, next) {
  let from = req.body.from.toLowerCase();
  let to = req.body.to.toLowerCase();
  let text = req.body.text.toLowerCase();

  const AVAILABLE_FROM = ["fr", "lis"];
  const AVAILABLE_TO = ["fr", "lis"];

  if (!AVAILABLE_FROM.includes(from)) {
    res.json({
      status: 404,
      response:
        "From : " +
        from +
        " is not an available language. Please use one of : " +
        AVAILABLE_FROM.join(", "),
    });
  }

  if (!AVAILABLE_TO.includes(to)) {
    res.json({
      status: 404,
      response:
        "To : " +
        from +
        " is not an available language. Please use one of : " +
        AVAILABLE_FROM.join(", "),
    });
  }

  let translatedText = await translateString(from, to, text);

  if (!translatedText) {
    res.json({
      status: 404,
      response: "Error during translation processing",
    });
    return;
  }

  res.json({ status: 200, response: translatedText });
});

router.post("/translate", async function (req, res, next) {
  let from = req.body.from.toLowerCase();
  let to = req.body.to.toLowerCase();
  let text = req.body.text.toLowerCase();

  const AVAILABLE_FROM = ["fr", "lis"];
  const AVAILABLE_TO = ["fr", "lis"];

  if (!AVAILABLE_FROM.includes(from)) {
    res.json({
      status: 404,
      response:
        "From : " +
        from +
        " is not an available language. Please use one of : " +
        AVAILABLE_FROM.join(", "),
    });
  }

  if (!AVAILABLE_TO.includes(to)) {
    res.json({
      status: 404,
      response:
        "To : " +
        from +
        " is not an available language. Please use one of : " +
        AVAILABLE_FROM.join(", "),
    });
  }

  let translatedText = await translateString(from, to, text);

  if (!translatedText) {
    res.json({
      status: 404,
      response: "Error during translation processing",
    });
    return;
  }

  res.json({ status: 200, response: translatedText });
});

/**
 *
 * @param {*} from country code
 * @param {*} to country code
 * @param {*} text string to translate
 * @returns translated text
 */
async function translateString(from, to, text) {
  /**
   * Split words into array
   */
  let arrayWord = text.split(" ");
  /**
   * New array words
   */
  let newTranslation = [];

  for (let word of arrayWord) {
    /**
     * Get the correspondant word
     * -> If the word is found, return the translated word
     * -> If the word is not found, check for similar words
     */
    let correspond = await getCorrespondantWord(from, to, word);

    if (!correspond) {
      correspond = await findSimilarity(from, to, word);
    }
    /**
     * Add to our new translated words array
     */
    DEBUG &&
      console.log("INDEX : Final word for " + word + " is : " + correspond);
    DEBUG && console.log("----------------");

    newTranslation.push(correspond);
  }
  /**
   * Join all words to create string and return it
   */
  return newTranslation.join(" ");
}
module.exports = router;
