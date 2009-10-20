if (!com) var com = {};
if (!com.heraldocarneiro) com.heraldocarneiro = {};
if (!com.heraldocarneiro.bonner) com.heraldocarneiro.bonner = {};


com.heraldocarneiro.bonner.RSLPStemmer = (function() {

var replaceISOChars = false;

function wordHasDigits(word) {
}

function processWord(word) {
	var wordStatus = stemToLowerCase(word);
	if (wordHasDigits(wordStatus)) return;
	if (wordIsTooSmall(wordStatus)) {
		if (replaceISOChars && wordHasISOChars(wordStatus)) {
			return stemRemoveAccents(word);
		}
	}
}

void rslpProcessWord(char *word, rslp_stemmer_main_struct *rslpMainStruct)
{
	int wordStatus;

	wordStatus = stemmer_stemToLowerCase(word);
	if(RSLP_WORD_HAS_DIGITS(wordStatus)) // Do the stemming only if the word doesn't contain numbers
		return;

	// word too small to be stemmed
	if(RSLP_WORD_TOO_SMALL(wordStatus)) {
		if(rslpMainStruct->rslpProcFlags.replace_iso_chars && (RSLP_WORD_HAS_ISO_CHARS(wordStatus)))
			stemmer_stemRemoveAccents(word);
		return;
	}

	// If word starts with capital letter and we're using named entities dictionary, check
	// if it wasn't a name
	if(RSLP_WORD_START_WITH_CAPITAL_LETTER(wordStatus) 
			&& (rslpMainStruct->rslpProcFlags.use_named_entities_dictionary)) {
		unsigned short wordFound;
		
		wordFound = dict_searchWord(rslpMainStruct->rslpNamedEntitiesDict.dictRoot, word);
		if(wordFound) {
			if(rslpMainStruct->rslpProcFlags.replace_iso_chars && RSLP_WORD_HAS_ISO_CHARS(wordStatus))
				stemmer_stemRemoveAccents(word);
			return;
		}
	}

	// Before process a word, check if it already exists in dictionary
	if(rslpMainStruct->rslpProcFlags.use_stem_dictionary) {
		unsigned short wordFound;

		wordFound = dict_searchWord(rslpMainStruct->rslpStemDict.dictRoot, word);
		
		if(!wordFound) { // Word not found in dictionary
			char *originalWord = malloc(strlen(word)+1);
			
			// Save the original word
			strcpy(originalWord, word);
		
			// Process word and then add it to the dictionary
			if(rslpMainStruct->rslpProcFlags.process_stemming)
				stemmer_applyRulesToWord(word, rslpMainStruct);

			if(rslpMainStruct->rslpProcFlags.replace_iso_chars && RSLP_WORD_HAS_ISO_CHARS(wordStatus))
				stemmer_stemRemoveAccents(word);
			
			dict_addWord(&rslpMainStruct->rslpStemDict, originalWord, word, RSLP_END_WORD_STEM);

			free(originalWord);
		}
	}
	else {
		// Not using dictionary
		if(rslpMainStruct->rslpProcFlags.process_stemming)
			stemmer_applyRulesToWord(word, rslpMainStruct);
		
		if(rslpMainStruct->rslpProcFlags.replace_iso_chars)
			stemmer_stemRemoveAccents(word);
	}

	return;
}



})();