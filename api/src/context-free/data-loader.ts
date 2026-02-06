import CF_DATA from "./dataset/cf-data.json";

export const ALL_WORDS = new Map<bigint, 0 | 1 | 2>();


/*
 Sentiment dataset loader function
*/
async function dataLoader() {
  for (const key in CF_DATA) {
    ALL_WORDS.set(BigInt(key).valueOf(), CF_DATA[key]);
  }
}

await dataLoader()