//rule looks like { tokenParser, optional, repeating, resultName }
//tokenParser takes in the token, its position, and a list of all tokens.  Its return value is attached to the resultName on the rule.  It should return undefined when unable to parse.
//Optional determines if the rule is optional.  Rules that are not optional must be satisfied or the parsing will fail.
//Repeating determines if the rule repeats.  The parser will continually try to apply the rule until it can't.  If repeating, then resultName will contain an array of results instead of one.
//Once all rules are exhausted, every subsequent token is placed in the "rest" property.
export const createParser = (...rules) => {
    return words => {
        let result = {};
        let wordIndex = 0;
        for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
            const rule = rules[ruleIndex];
            const token = words[wordIndex];
            const parsedToken = rule.tokenParser(token, wordIndex, words);
            if (parsedToken === undefined) {
                if (rule.optional) continue;
                else return {
                    success: false,
                    error: createFailedToParseError(token, wordIndex)
                };
            }
            wordIndex++;
            if (rule.repeating) {
                let repeatingResult = [parsedToken];
                while (true) {
                    if (words.length <= wordIndex) {
                        result[rule.resultName] = repeatingResult;
                        return {
                            ...result,
                            success: true
                        }
                    }
                    const nextToken = words[wordIndex];
                    const nextParsedToken = rule.tokenParser(nextToken, wordIndex, words);
                    wordIndex++;
                    if (nextParsedToken === undefined) break;
                    repeatingResult.push(nextParsedToken);
                }
                result[rule.resultName] = repeatingResult;
            }
            else {
                result[rule.resultName] = parsedToken;
            }
        }
        result['rest'] = words.slice(wordIndex);
        result.success = true;
        return result;
    }
}

const createFailedToParseError = (token, wordIndex) => `Failed to parse token ${token} at position ${wordIndex}`;