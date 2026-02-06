import { JSON_KEYS } from "../utils/keys";
import { hashWord } from "./hash";
import { getTopKWords } from "./min-heap";
import { tokenizeText } from "./tokenizer";
import { generateWordCloud } from "./word-cloud";
import { ALL_WORDS } from "./data-loader";
import { STOP_WORDS } from "./dataset/stopwords";

const SENTIMENT_POSITIVE = "Positive";
const SENTIMENT_NEGATIVE = "Negative";
const SENTIMENT_NEUTRAL = "Neutral";

const POSITIVE_SCORE = 1;
const NEGATIVE_SCORE = 2;

interface SentimentResult {
  positive_score: number;
  negative_score: number;
  polarity_score: number;
  sentiment: string;
  positive_words: Set<string>;
  negative_words: Set<string>;
  unidentified_words: Set<string>;
  keywords: Map<string, number>;
  // word_cloud : string
}

type JsonResult = {
  [key: string]: number | string | string[] | { [key: string]: number };
};

async function convertSentimentResultToJsonResult(__obj: SentimentResult) {
  const result: JsonResult = {};
  const top_k_words = getTopKWords(__obj.keywords, 20);

  result[JSON_KEYS.positiveScore] = __obj.positive_score;
  result[JSON_KEYS.negativeScore] = __obj.negative_score;
  result[JSON_KEYS.polarityScore] = __obj.polarity_score;
  result[JSON_KEYS.sentiment] = __obj.sentiment;
  result[JSON_KEYS.positiveWords] = Array.from(__obj.positive_words);
  result[JSON_KEYS.negativeWords] = Array.from(__obj.negative_words);
  result[JSON_KEYS.unidentifiedWords] = Array.from(__obj.unidentified_words);
  result[JSON_KEYS.keywords] = top_k_words;
  result[JSON_KEYS.wordCloud] = generateWordCloud(top_k_words);

  return result;
}

async function analyzeSingleComment(
  __comment: string,
  __result: SentimentResult
) {
  const tokenized_text = tokenizeText(__comment);

  for (const word of tokenized_text) {
    if (word.tag === "word") {
      const word_lowered = word.value.toLowerCase();

      const sentiment = ALL_WORDS.get(hashWord(word_lowered));

      if (sentiment === undefined)
        __result.unidentified_words.add(word_lowered);
      else if (sentiment === POSITIVE_SCORE) {
        __result.positive_score += 1;
        __result.positive_words.add(word_lowered);
      } else if (sentiment === NEGATIVE_SCORE) {
        __result.negative_score += 1;
        __result.negative_words.add(word_lowered);
      }

      if (!STOP_WORDS.has(hashWord(word_lowered))) {
        __result.keywords.set(
          word_lowered,
          (__result.keywords.get(word_lowered) || 0) + 1
        );
      }
    }
  }
}

async function prepareResult(__result: SentimentResult) {
  const calculatePolarityScore = (
    __positive_score: number,
    __negative_score: number
  ) => {
    return (
      (__positive_score - __negative_score) /
      (0.000001 + __positive_score + __negative_score)
    );
  };

  // rounding off to 3 decimal digits
  __result.polarity_score =
    Math.round(
      calculatePolarityScore(__result.positive_score, __result.negative_score) *
        1000
    ) / 1000;

  if (__result.polarity_score < 0) __result.sentiment = SENTIMENT_NEGATIVE;
  else if (__result.polarity_score > 0) __result.sentiment = SENTIMENT_POSITIVE;
  else __result.sentiment = SENTIMENT_NEUTRAL;
}

export async function startSingleAnalysis(__comment: string) {
  const result: SentimentResult = {
    positive_score: 0,
    negative_score: 0,
    polarity_score: 0,
    sentiment: "",
    positive_words: new Set<string>(),
    negative_words: new Set<string>(),
    unidentified_words: new Set<string>(),
    keywords: new Map<string, number>(),
  };

  await analyzeSingleComment(__comment, result);

  await prepareResult(result);

  return await convertSentimentResultToJsonResult(result);
}

export async function startBatchAnalysis(__commentlist: string[]) {
  const result: SentimentResult = {
    positive_score: 0,
    negative_score: 0,
    polarity_score: 0,
    sentiment: "",
    positive_words: new Set<string>(),
    negative_words: new Set<string>(),
    unidentified_words: new Set<string>(),
    keywords: new Map<string, number>(),
  };

  for (const single_comment of __commentlist) {
    await analyzeSingleComment(single_comment, result);
  }

  await prepareResult(result);

  return await convertSentimentResultToJsonResult(result);
}
