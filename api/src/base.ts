import { JSON_KEYS } from "./utils/keys";

const AUTHOR_DETAILS = [
  {
    name: "SAKSHAM JOSHI",
    email: "social.sakshamjoshi@gmail.com",
    linkedin: "https://www.linkedin.com/in/sakshamjoshi27",
    github: "https://github.com/saksham-joshi",
    portfolio: "https://sakshamjoshi.vercel.app",
  },
  {
    name: "SUBHAM TIWARI",
    email: "subhamt958@gmail.com",
    linkedin: "https://www.linkedin.com/in/subham-tiwari-ab38971b4/",
    github: "https://github.com/W0nder0fy0u",
  },
];

const BASE_VALUES = {
  APP_NAME: "SentiVox API",

  APP_VERSION: "1.0.0",

  APP_URL: "https://senti-vox-api.onrender.com",

  APP_DESCRIPTION:
    "SentiVox is a simple, fast, multilingual and accurate API to perform sentiment analysis on the text and find the sentiment along with a word cloud.",

  APP_AUTHOR: AUTHOR_DETAILS,

  APP_DOCUMENTATION:
    "/docs",
};

const LANG = {
  english: "en",
  hindi: "hi",
  marathi: "mr",
  bengali: "bn",
  kannada: "kn",
  gujarati: "gu",
  punjabi: "pa",
  tamil: "ta",
  telugu: "te",
  urdu: "ur",
  supported: [
    "English",
    "Hindi",
    "Marathi",
    // "Bengali",
    // "Kannada",
    // "Gujarati",
    // "Punjabi",
    "Tamil",
    // "Telugu",
    // "Urdu",
  ],
};

const MESSAGES = {
  HEALTH_MESSAGE: {
    status: "healthy"
  },

  WELCOME_MESSAGE: {
    message: `Welcome to ${BASE_VALUES.APP_NAME}`,
    description: BASE_VALUES.APP_DESCRIPTION,
    version: BASE_VALUES.APP_VERSION,
    endpoints: {
      "/cf/single": "POST - Context free analysis of a single comment",
      "/cf/batch": "POST - Context free analysis of multiple comments",
      "/health": "GET - Health check",
      "/docs": "GET - Documentations",
      "/langs": "GET - Supported languages",
      "/tokenize": "POST - Tokenizes your given text",
      "/tokenCount": "POST - Get your token count"
    },
    supported_languages: LANG.supported,
    author: AUTHOR_DETAILS,
    documentation: BASE_VALUES.APP_URL + BASE_VALUES.APP_DOCUMENTATION,
  },
};

export const SentiVoxBase = {
  appName: BASE_VALUES.APP_NAME,

  appVersion: BASE_VALUES.APP_VERSION,

  appUrl: BASE_VALUES.APP_URL,

  appDesc: BASE_VALUES.APP_DESCRIPTION,

  appAuthor: AUTHOR_DETAILS,

  appDocsUrl: BASE_VALUES.APP_URL + BASE_VALUES.APP_DOCUMENTATION,

  lang: LANG,

  statusCode: {
    SUCCESS: 200,
    INVALID_JSON_FORMAT: 400,
    INVALID_ENDPOINT: 404,
    MISSING_OR_INVALID_AUTH: 401,
    VALID_REQUEST_BUT_FAILED_VALIDATION: 422,
  },



  docs: {
    "context-free-analysis": {
      description:
        "Context-free sentiment analysis ignores contextual variations and instead relies primarily on keyword-based or rule-based detection of sentiment. It typically uses predefined lexicons or bag-of-words models to classify text as positive, negative, or neutral, without considering grammar, irony, or surrounding context. Although simpler and faster, it can lead to misinterpretation when word meanings shift with context.",

      "single-comment-analysis": {
        endpoint: "/cf/single",
        method: "POST",
        format: {
            [JSON_KEYS.apiKey]: "string - Your API key",
            [JSON_KEYS.comment]: "text to analyze",
        },
      },

      "batch-comment-analysis": {
        endpoint: "/cf/batch",
        method: "POST",
        format: {
          [JSON_KEYS.apiKey]: "string - Your API key",
          [JSON_KEYS.commentList]: ["comment1", "comment2", "..."],
        },
      },
    },

    "context-based-analysis": {
      description:
        "Context-based sentiment analysis takes into account contextual variations and surrounding context to determine sentiment. It often uses machine learning models or rule-based systems to analyze text, taking into account grammar, irony, and surrounding context. This approach is more accurate but can be more complex and slower.",
      endpoints: `We are raising funds for providing support for context-based analysis because it requires powerful infrastructure. If you want to invest, please mail us at ${AUTHOR_DETAILS[0].email}`,
    },

    languages: LANG.supported,

    dailyFreeTokenCount: 10000,
  },

  messages : {
    welcome : MESSAGES.WELCOME_MESSAGE,
    health : MESSAGES.HEALTH_MESSAGE
  }
} as const;
