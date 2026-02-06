const Tokenizer = require("wink-tokenizer");
const tokenizer_instance = Tokenizer();

export type TokenizedText = { value : string, tag : string};

export function tokenizeText(__text : string ) : Array<TokenizedText>
{
    return tokenizer_instance.tokenize(__text);
}