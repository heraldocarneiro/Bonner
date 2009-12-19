if (!com) var com = {};
if (!com.heraldocarneiro) com.heraldocarneiro = {};
if (!com.heraldocarneiro.bonner) com.heraldocarneiro.bonner = {};


com.heraldocarneiro.bonner.MainWindow = (function() {

const TEMPLATE_URL = 'resource://bonner-content/feedview-template.html';


		var entity_table = {
			34: "&quot;",		// Quotation mark. Not required
			38: "&amp;",		// Ampersand. Applied before everything else in the application
			60: "&lt;",		// Less-than sign
			62: "&gt;",		// Greater-than sign
			63: "&#63;",		// Question mark
			111: "&#111;",		// Latin small letter o
			160: "&nbsp;",		// Non-breaking space
			161: "&iexcl;",		// Inverted exclamation mark
			162: "&cent;",		// Cent sign
			163: "&pound;",		// Pound sign
			164: "&curren;",	// Currency sign
			165: "&yen;",		// Yen sign
			166: "&brvbar;",	// Broken vertical bar
			167: "&sect;",		// Section sign
			168: "&uml;",		// Diaeresis
			169: "&copy;",		// Copyright sign
			170: "&ordf;",		// Feminine ordinal indicator
			171: "&laquo;",		// Left-pointing double angle quotation mark
			172: "&not;",		// Not sign
			173: "&shy;",		// Soft hyphen
			174: "&reg;",		// Registered sign
			175: "&macr;",		// Macron
			176: "&deg;",		// Degree sign
			177: "&plusmn;",	// Plus-minus sign
			178: "&sup2;",		// Superscript two
			179: "&sup3;",		// Superscript three
			180: "&acute;",		// Acute accent
			181: "&micro;",		// Micro sign
			182: "&para;",		// Pilcrow sign
			183: "&middot;",	// Middle dot
			184: "&cedil;",		// Cedilla
			185: "&sup1;",		// Superscript one
			186: "&ordm;",		// Masculine ordinal indicator
			187: "&raquo;",		// Right-pointing double angle quotation mark
			188: "&frac14;",	// Vulgar fraction one-quarter
			189: "&frac12;",	// Vulgar fraction one-half
			190: "&frac34;",	// Vulgar fraction three-quarters
			191: "&iquest;",	// Inverted question mark
			192: "&Agrave;",	// A with grave
			193: "&Aacute;",	// A with acute
			194: "&Acirc;",		// A with circumflex
			195: "&Atilde;",	// A with tilde
			196: "&Auml;",		// A with diaeresis
			197: "&Aring;",		// A with ring above
			198: "&AElig;",		// AE
			199: "&Ccedil;",	// C with cedilla
			200: "&Egrave;",	// E with grave
			201: "&Eacute;",	// E with acute
			202: "&Ecirc;",		// E with circumflex
			203: "&Euml;",		// E with diaeresis
			204: "&Igrave;",	// I with grave
			205: "&Iacute;",	// I with acute
			206: "&Icirc;",		// I with circumflex
			207: "&Iuml;",		// I with diaeresis
			208: "&ETH;",		// Eth
			209: "&Ntilde;",	// N with tilde
			210: "&Ograve;",	// O with grave
			211: "&Oacute;",	// O with acute
			212: "&Ocirc;",		// O with circumflex
			213: "&Otilde;",	// O with tilde
			214: "&Ouml;",		// O with diaeresis
			215: "&times;",		// Multiplication sign
			216: "&Oslash;",	// O with stroke
			217: "&Ugrave;",	// U with grave
			218: "&Uacute;",	// U with acute
			219: "&Ucirc;",		// U with circumflex
			220: "&Uuml;",		// U with diaeresis
			221: "&Yacute;",	// Y with acute
			222: "&THORN;",		// Thorn
			223: "&szlig;",		// Sharp s. Also known as ess-zed
			224: "&agrave;",	// a with grave
			225: "&aacute;",	// a with acute
			226: "&acirc;",		// a with circumflex
			227: "&atilde;",	// a with tilde
			228: "&auml;",		// a with diaeresis
			229: "&aring;",		// a with ring above
			230: "&aelig;",		// ae. Also known as ligature ae
			231: "&ccedil;",	// c with cedilla
			232: "&egrave;",	// e with grave
			233: "&eacute;",	// e with acute
			234: "&ecirc;",		// e with circumflex
			235: "&euml;",		// e with diaeresis
			236: "&igrave;",	// i with grave
			237: "&iacute;",	// i with acute
			238: "&icirc;",		// i with circumflex
			239: "&iuml;",		// i with diaeresis
			240: "&eth;",		// eth
			241: "&ntilde;",	// n with tilde
			242: "&ograve;",	// o with grave
			243: "&oacute;",	// o with acute
			244: "&ocirc;",		// o with circumflex
			245: "&otilde;",	// o with tilde
			246: "&ouml;",		// o with diaeresis
			247: "&divide;",	// Division sign
			248: "&oslash;",	// o with stroke. Also known as o with slash
			249: "&ugrave;",	// u with grave
			250: "&uacute;",	// u with acute
			251: "&ucirc;",		// u with circumflex
			252: "&uuml;",		// u with diaeresis
			253: "&yacute;",	// y with acute
			254: "&thorn;",		// thorn
			255: "&yuml;",		// y with diaeresis
			264: "&#264;",		// Latin capital letter C with circumflex
			265: "&#265;",		// Latin small letter c with circumflex
			338: "&OElig;",		// Latin capital ligature OE
			339: "&oelig;",		// Latin small ligature oe
			352: "&Scaron;",	// Latin capital letter S with caron
			353: "&scaron;",	// Latin small letter s with caron
			372: "&#372;",		// Latin capital letter W with circumflex
			373: "&#373;",		// Latin small letter w with circumflex
			374: "&#374;",		// Latin capital letter Y with circumflex
			375: "&#375;",		// Latin small letter y with circumflex
			376: "&Yuml;",		// Latin capital letter Y with diaeresis
			402: "&fnof;",		// Latin small f with hook, function, florin
			710: "&circ;",		// Modifier letter circumflex accent
			732: "&tilde;",		// Small tilde
			913: "&Alpha;",		// Alpha
			914: "&Beta;",		// Beta
			915: "&Gamma;",		// Gamma
			916: "&Delta;",		// Delta
			917: "&Epsilon;",	// Epsilon
			918: "&Zeta;",		// Zeta
			919: "&Eta;",		// Eta
			920: "&Theta;",		// Theta
			921: "&Iota;",		// Iota
			922: "&Kappa;",		// Kappa
			923: "&Lambda;",	// Lambda
			924: "&Mu;",		// Mu
			925: "&Nu;",		// Nu
			926: "&Xi;",		// Xi
			927: "&Omicron;",	// Omicron
			928: "&Pi;",		// Pi
			929: "&Rho;",		// Rho
			931: "&Sigma;",		// Sigma
			932: "&Tau;",		// Tau
			933: "&Upsilon;",	// Upsilon
			934: "&Phi;",		// Phi
			935: "&Chi;",		// Chi
			936: "&Psi;",		// Psi
			937: "&Omega;",		// Omega
			945: "&alpha;",		// alpha
			946: "&beta;",		// beta
			947: "&gamma;",		// gamma
			948: "&delta;",		// delta
			949: "&epsilon;",	// epsilon
			950: "&zeta;",		// zeta
			951: "&eta;",		// eta
			952: "&theta;",		// theta
			953: "&iota;",		// iota
			954: "&kappa;",		// kappa
			955: "&lambda;",	// lambda
			956: "&mu;",		// mu
			957: "&nu;",		// nu
			958: "&xi;",		// xi
			959: "&omicron;",	// omicron
			960: "&pi;",		// pi
			961: "&rho;",		// rho
			962: "&sigmaf;",	// sigmaf
			963: "&sigma;",		// sigma
			964: "&tau;",		// tau
			965: "&upsilon;",	// upsilon
			966: "&phi;",		// phi
			967: "&chi;",		// chi
			968: "&psi;",		// psi
			969: "&omega;",		// omega
			977: "&thetasym;",	// Theta symbol
			978: "&upsih;",		// Greek upsilon with hook symbol
			982: "&piv;",		// Pi symbol
			8194: "&ensp;",		// En space
			8195: "&emsp;",		// Em space
			8201: "&thinsp;",	// Thin space
			8204: "&zwnj;",		// Zero width non-joiner
			8205: "&zwj;",		// Zero width joiner
			8206: "&lrm;",		// Left-to-right mark
			8207: "&rlm;",		// Right-to-left mark
			8211: "&ndash;",	// En dash
			8212: "&mdash;",	// Em dash
			8216: "&lsquo;",	// Left single quotation mark
			8217: "&rsquo;",	// Right single quotation mark
			8218: "&sbquo;",	// Single low-9 quotation mark
			8220: "&ldquo;",	// Left double quotation mark
			8221: "&rdquo;",	// Right double quotation mark
			8222: "&bdquo;",	// Double low-9 quotation mark
			8224: "&dagger;",	// Dagger
			8225: "&Dagger;",	// Double dagger
			8226: "&bull;",		// Bullet
			8230: "&hellip;",	// Horizontal ellipsis
			8240: "&permil;",	// Per mille sign
			8242: "&prime;",	// Prime
			8243: "&Prime;",	// Double Prime
			8249: "&lsaquo;",	// Single left-pointing angle quotation
			8250: "&rsaquo;",	// Single right-pointing angle quotation
			8254: "&oline;",	// Overline
			8260: "&frasl;",	// Fraction Slash
			8364: "&euro;",		// Euro sign
			8472: "&weierp;",	// Script capital
			8465: "&image;",	// Blackletter capital I
			8476: "&real;",		// Blackletter capital R
			8482: "&trade;",	// Trade mark sign
			8501: "&alefsym;",	// Alef symbol
			8592: "&larr;",		// Leftward arrow
			8593: "&uarr;",		// Upward arrow
			8594: "&rarr;",		// Rightward arrow
			8595: "&darr;",		// Downward arrow
			8596: "&harr;",		// Left right arrow
			8629: "&crarr;",	// Downward arrow with corner leftward. Also known as carriage return
			8656: "&lArr;",		// Leftward double arrow. ISO 10646 does not say that lArr is the same as the 'is implied by' arrow but also does not have any other character for that function. So ? lArr can be used for 'is implied by' as ISOtech suggests
			8657: "&uArr;",		// Upward double arrow
			8658: "&rArr;",		// Rightward double arrow. ISO 10646 does not say this is the 'implies' character but does not have another character with this function so ? rArr can be used for 'implies' as ISOtech suggests
			8659: "&dArr;",		// Downward double arrow
			8660: "&hArr;",		// Left-right double arrow
			// Mathematical Operators
			8704: "&forall;",	// For all
			8706: "&part;",		// Partial differential
			8707: "&exist;",	// There exists
			8709: "&empty;",	// Empty set. Also known as null set and diameter
			8711: "&nabla;",	// Nabla. Also known as backward difference
			8712: "&isin;",		// Element of
			8713: "&notin;",	// Not an element of
			8715: "&ni;",		// Contains as member
			8719: "&prod;",		// N-ary product. Also known as product sign. Prod is not the same character as U+03A0 'greek capital letter pi' though the same glyph might be used for both
			8721: "&sum;",		// N-ary summation. Sum is not the same character as U+03A3 'greek capital letter sigma' though the same glyph might be used for both
			8722: "&minus;",	// Minus sign
			8727: "&lowast;",	// Asterisk operator
			8729: "&#8729;",	// Bullet operator
			8730: "&radic;",	// Square root. Also known as radical sign
			8733: "&prop;",		// Proportional to
			8734: "&infin;",	// Infinity
			8736: "&ang;",		// Angle
			8743: "&and;",		// Logical and. Also known as wedge
			8744: "&or;",		// Logical or. Also known as vee
			8745: "&cap;",		// Intersection. Also known as cap
			8746: "&cup;",		// Union. Also known as cup
			8747: "&int;",		// Integral
			8756: "&there4;",	// Therefore
			8764: "&sim;",		// tilde operator. Also known as varies with and similar to. The tilde operator is not the same character as the tilde, U+007E, although the same glyph might be used to represent both
			8773: "&cong;",		// Approximately equal to
			8776: "&asymp;",	// Almost equal to. Also known as asymptotic to
			8800: "&ne;",		// Not equal to
			8801: "&equiv;",	// Identical to
			8804: "&le;",		// Less-than or equal to
			8805: "&ge;",		// Greater-than or equal to
			8834: "&sub;",		// Subset of
			8835: "&sup;",		// Superset of. Note that nsup, 'not a superset of, U+2283' is not covered by the Symbol font encoding and is not included.
			8836: "&nsub;",		// Not a subset of
			8838: "&sube;",		// Subset of or equal to
			8839: "&supe;",		// Superset of or equal to
			8853: "&oplus;",	// Circled plus. Also known as direct sum
			8855: "&otimes;",	// Circled times. Also known as vector product
			8869: "&perp;",		// Up tack. Also known as orthogonal to and perpendicular
			8901: "&sdot;",		// Dot operator. The dot operator is not the same character as U+00B7 middle dot
			// Miscellaneous Technical
			8968: "&lceil;",	// Left ceiling. Also known as an APL upstile
			8969: "&rceil;",	// Right ceiling
			8970: "&lfloor;",	// left floor. Also known as APL downstile
			8971: "&rfloor;",	// Right floor
			9001: "&lang;",		// Left-pointing angle bracket. Also known as bra. Lang is not the same character as U+003C 'less than'or U+2039 'single left-pointing angle quotation mark'
			9002: "&rang;",		// Right-pointing angle bracket. Also known as ket. Rang is not the same character as U+003E 'greater than' or U+203A 'single right-pointing angle quotation mark'
			// Geometric Shapes
			9642: "&#9642;",	// Black small square
			9643: "&#9643;",	// White small square
			9674: "&loz;",		// Lozenge
			// Miscellaneous Symbols
			9702: "&#9702;",	// White bullet
			9824: "&spades;",	// Black (filled) spade suit
			9827: "&clubs;",	// Black (filled) club suit. Also known as shamrock
			9829: "&hearts;",	// Black (filled) heart suit. Also known as shamrock
			9830: "&diams;"		// Black (filled) diamond suit
		};
var entityToCharCode = {};
for (var key in entity_table) {
	var entity = entity_table[key];
	entityToCharCode[entity] = key;
}
		
function log(aMessage) {
  var consoleService = Components.classes['@mozilla.org/consoleservice;1'].
                       getService(Ci.nsIConsoleService);
  consoleService.logStringMessage(aMessage);
}

function dotProduct(vector1, vector2) {
	var dotProduct = 0;
	for (var i = 0; i < vector1.length; ++i) {
		dotProduct += vector1[i] * vector2[i];
	}
	return dotProduct;
}

function norm(vector) {
	return Math.sqrt(dotProduct(vector, vector));
}

function setProgressText(text) {
	document.getElementById('progress-label').value = text;
}

function setProgressPerc(perc) {
	document.getElementById('progress-meter').value = perc;
}

function setProgress(text, perc) {
	setProgressText(text);
	setProgressPerc(perc);
}

function encodeISO88591asUTF8(text) {
	var t = '';
	for (var i = 0; i < text.length; ++i) {
		var c = text.charCodeAt(i);
		//if (c > 127) log('c:' + c);
		t += String.fromCharCode(c);
	}
	return t;
}

var file = Components.classes["@mozilla.org/file/directory_service;1"]  
		.getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);  
file.append("bonner.sqlite");
var storageService = Components.classes["@mozilla.org/storage/service;1"]  
		.getService(Components.interfaces.mozIStorageService);  
var conn = storageService.openUnsharedDatabase(file);

var browser = null;


return {
	onLoad: function(event) {
		log('Bonner load');
		browser = document.getElementById('feed-view');
		var templateURI = Components.classes['@mozilla.org/network/io-service;1'].
				getService(Ci.nsIIOService).newURI(TEMPLATE_URL, null, null);
		browser.loadURI(templateURI.spec);
	},
	onUnload: function(event) {
		//alert('unload');
	},
	onFeedListMouseDown: function(event) {
	},
	onFeedListKeyUp: function(event) {
	},
	onAddButtonClick: function(event) {
		var feedURL = prompt('Feed URL:', '');
		if (!feedURL) return;
		var startTime = new Date().getTime();
		setProgress('Adding feed...', 0);
		var statement = conn.createStatement("INSERT INTO feed (link) VALUES (:link)");
		statement.params.link = feedURL;
		statement.execute();
		var duration = (new Date().getTime() - startTime) / 1000;
		setProgress('Adding feed... done in ' + duration + ' secs.', 100);
	},
	onUpdateButtonClick: function(event) {
		try {
			log('update begin');
			var file = Components.classes["@mozilla.org/file/directory_service;1"]  
			.getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);  
	file.append("bonner.sqlite");
	var storageService = Components.classes["@mozilla.org/storage/service;1"]  
			.getService(Components.interfaces.mozIStorageService);  
	var conn = storageService.openUnsharedDatabase(file);
			conn.beginTransaction();

			var startTime = new Date().getTime();
			setProgress('Checking feeds for updates...', 0);
			var statement = conn.createStatement("SELECT id, link FROM feed");
			while (statement.executeStep()) {
				this.fetchFeed(statement.row.id, statement.row.link, conn);
			}
			statement.reset();
			conn.commitTransaction();
			var duration = (new Date().getTime() - startTime) / 1000;
			setProgress('Checking feeds for updates... done in ' + duration + ' secs.', 100);
			log('update end at ' + new Date());
		} catch (e) {
			log('update end with exception: ' + e);
		}
		var this_ = this;
		setTimeout(function () { this_.onUpdateButtonClick(event) }, 1000 * 60 * 10);
	},
	onIndexButtonClick: function(event) {
		var startTime = new Date().getTime();
		setProgress('Building inverted index...', 0);
		conn.beginTransaction();
		conn.executeSimpleSQL('DELETE FROM item_stats');
		conn.executeSimpleSQL('DELETE FROM item_word');
		conn.executeSimpleSQL('DELETE FROM word');
		var stSelectCount = conn.createStatement("SELECT COUNT(id) AS count FROM item");
		var totalItems = stSelectCount.executeStep() ? stSelectCount.row.count : 1;
		stSelectCount.reset();
		var stSelectItem = conn.createStatement("SELECT id, title, link, content, link_content FROM item");
		var stSelectWord = conn.createStatement("SELECT id FROM word WHERE string = :word");
		var stUpdateWord = conn.createStatement("UPDATE word SET item_count = item_count + 1 WHERE id = :id");
		var stInsertWord = conn.createStatement("INSERT OR IGNORE INTO word (string, item_count) VALUES (:word, :item_count)");
		var stInsertItemWord = conn.createStatement("INSERT OR IGNORE INTO item_word (item_id, word_id, word_count) VALUES (:item_id, :word_id, :word_count)");
		var stInsertItemStats = conn.createStatement("INSERT OR IGNORE INTO item_stats (item_id, word_count) VALUES (:item_id, :word_count)");
		var indexedItems = 0;
		(function() {
			if (stSelectItem.executeStep()) {
				var id = stSelectItem.row.id;
				var title = stSelectItem.row.title;
				var content = stSelectItem.row.content;
				var link_content = stSelectItem.row.link_content;
				var text = title + ' ' + content + ' ' + link_content;
				text = text.replace(/\<[^\>]*\>/gi, '').replace(/[\.\,\;\:\?\!\'\"\r\n\(\)]/gi, ' ')
						.replace(/\s+/gi, ' ').replace(/(^\s+|\s+$)/gi, '').toLowerCase();
				var words = text.split(/\s+/gi);
				var word_counts = {};
				var word_count = 0;
				for (var i = 0; i < words.length; ++i) {
					var word = words[i];
					if (com.heraldocarneiro.bonner.StopWordsRemover.isStopWord(word)) continue;
					//word = com.heraldocarneiro.bonner.RSLPStemmer.processWord(word);
					if (word_counts[word]) word_counts[word] += 1;
					else word_counts[word] = 1;
					++word_count;
				}
				stInsertItemStats.params.item_id = id;
				stInsertItemStats.params.word_count = word_count;
				stInsertItemStats.execute();
				for (var word in word_counts) {
					var word_id, item_count;
					stSelectWord.params.word = word;
					if (stSelectWord.executeStep()) {
						word_id = stSelectWord.row.id;
						stUpdateWord.params.id = word_id;
						stUpdateWord.execute();
					} else {
						stInsertWord.params.word = word;
						stInsertWord.params.item_count = 1;
						stInsertWord.execute();
						word_id = conn.lastInsertRowID;
					}
					stSelectWord.reset();
					stInsertItemWord.params.item_id = id;
					stInsertItemWord.params.word_id = word_id;
					stInsertItemWord.params.word_count = word_counts[word];
					stInsertItemWord.execute();
				}
				++indexedItems;
				setProgress('Building inverted index... ' + indexedItems + '/' + totalItems, 100 * indexedItems / totalItems);
				setTimeout(arguments.callee, 0);
			} else {
				stSelectItem.reset();
				conn.commitTransaction();
				var duration = (new Date().getTime() - startTime) / 1000;
				setProgress('Building inverted index... done in ' + duration + ' secs.', 100);
			}
		})();
	},
	onCosineButtonClick: function(event) {
		var startTime = new Date().getTime();
		setProgress('Computing cosine similarities...', 0);
		conn.beginTransaction();
		conn.executeSimpleSQL('DELETE FROM pair');
		var statement = conn.createStatement("SELECT item_id, word_count FROM item_stats");
		var stItemWord = conn.createStatement("SELECT word_id, word_count, item_count FROM item_word AS iw "
				+ "INNER JOIN word AS w ON w.id = iw.word_id "
				+ "WHERE iw.item_id = :item_id");
		var stPair = conn.createStatement('INSERT OR IGNORE INTO pair (item1_id, item2_id, cosine) VALUES (:item1_id, :item2_id, :cosine)');
		var log10 = Math.log(10);
		var items = [];
		var wordCounts = [];
		while (statement.executeStep()) {
			items[items.length] = statement.row.item_id;
			wordCounts[wordCounts.length] = statement.row.word_count;
		}
		var totalPairs = items.length * (items.length - 1) / 2;
		var computedPairs = 0;
		var i = 0;
		(function outerLoop() {
			if (i < items.length) {
				var id1 = items[i];
				var wordCount1 = wordCounts[i];
				stItemWord.params.item_id = id1;
				var words1 = {};
				while (stItemWord.executeStep()) {
					words1[stItemWord.row.word_id] = {
						wordCount: stItemWord.row.word_count,
						itemCount: stItemWord.row.item_count
					};
				}
				stItemWord.reset();
				var j = i + 1;
				(function innerLoop() {
					if (j < items.length) {
						var t = [];
						t.push(new Date().getTime());
						var id2 = items[j];
						var wordCount2 = wordCounts[j];
						stItemWord.params.item_id = id2;
						var words2 = {};
						while (stItemWord.executeStep()) {
							words2[stItemWord.row.word_id] = {
								wordCount: stItemWord.row.word_count,
								itemCount: stItemWord.row.item_count
							};
						}
						stItemWord.reset();
						var wordVector = {};
						for (var word_id in words1) wordVector[word_id] = words1[word_id].itemCount;
						for (var word_id in words2) wordVector[word_id] = words2[word_id].itemCount;
						var vector1 = [];
						var vector2 = [];
						for (var word_id in wordVector) {
							var idf = Math.log(items.length / wordVector[word_id]) / log10;
							var tf = words1[word_id] ? words1[word_id].wordCount / wordCount1 : 0;
							vector1[vector1.length] = tf * idf;
							tf = words2[word_id] ? words2[word_id].wordCount / wordCount2 : 0;
							vector2[vector2.length] = tf * idf;
						}
						var cosine = dotProduct(vector1, vector2) / (norm(vector1) * norm(vector2));
						stPair.params.item1_id = id1;
						stPair.params.item2_id = id2;
						stPair.params.cosine = cosine;
						stPair.execute();
						++j;
						++computedPairs;
						var d = Math.round((new Date().getTime() - startTime) / 1000);
						var pairsPerSec = Math.round(computedPairs / d);
						var totalTime = Math.round(totalPairs / pairsPerSec);
						setProgress('Computing cosine similarities... ' + computedPairs + '/' + totalPairs + ' [p/s: ' + pairsPerSec + ', d: ' + d + '/' + totalTime + ']', 100 * computedPairs / totalPairs);
						t.push(new Date().getTime());
						if (computedPairs % 1000 == 0) {
							for (var ii = 1; ii < t.length; ++ii) {
								if (t[ii] - t[ii - 1] <= 1) continue;
								log('t' + ii + ' = ' + (t[ii] - t[ii - 1]));
							}
						}
						//setTimeout(arguments.callee, 0);
						arguments.callee();
					} else {
						++i;
						setTimeout(outerLoop, 0);
					}
				})();
			} else {
				conn.commitTransaction();
				var duration = (new Date().getTime() - startTime) / 1000;
				setProgress('Computing cosine similarities... done in ' + duration + ' secs.', 100);
			}
		})();
	},
	onClusterButtonClick: function(event) {
		var cosine = prompt('Threshold cosine:', 0.1);
		if (!cosine) return;
		var startTime = new Date().getTime();
		setProgress('Clustering items...', 0);
		conn.beginTransaction();
		conn.executeSimpleSQL('DELETE FROM cluster_item');
		conn.executeSimpleSQL('DELETE FROM cluster');
		var stPairCount = conn.createStatement("SELECT COUNT(*) AS count FROM pair WHERE cosine >= :cosine ORDER BY cosine DESC");
		stPairCount.params.cosine = cosine;
		var totalPairs = stPairCount.executeStep() ? stPairCount.row.count : 0;
		stPairCount.reset();
		var stPair = conn.createStatement("SELECT item1_id, item2_id, cosine FROM pair WHERE cosine >= :cosine ORDER BY cosine DESC");
		var stCluster = conn.createStatement("INSERT INTO cluster (best_item_id) VALUES (:best_item_id)");
		var stClusterItem = conn.createStatement("INSERT INTO cluster_item (cluster_id, item_id) VALUES (:cluster_id, :item_id)");
		stPair.params.cosine = cosine;
		var clusteredPairs = 0;
		var idC = 0;
		var clusters = {};
		var items = {};
		(function() {
			if (stPair.executeStep()) {
				var id1 = stPair.row.item1_id;
				var id2 = stPair.row.item2_id;
				if (items[id1] && items[id2]) {
					if (items[id1] != items[id2]) {
						var cluster2 = clusters[items[id2]];
						delete clusters[items[id2]];
						for (var i = 0; i < cluster2.length; ++i) {
							clusters[items[id1]].push(cluster2[i]);
							items[cluster2[i]] = items[id1];
						}
					}
				} else if (items[id1]) {
					clusters[items[id1]].push(id2);
					items[id2] = items[id1];
				} else if (items[id2]) {
					clusters[items[id2]].push(id1);
					items[id1] = items[id2];
				} else {
					++idC;
					clusters[idC] = [id1, id2];
					items[id1] = items[id2] = idC;
				}
				++clusteredPairs;
				setProgress('Clustering items... ' + clusteredPairs + '/' + totalPairs, 100 * clusteredPairs / totalPairs);
				setTimeout(arguments.callee, 0);
			} else {
				stPair.reset();
				setProgressText('Clustering items... inserting into DB');
				for (var id in clusters) {
					items = clusters[id];
					stCluster.params.best_item_id = items[0];
					stCluster.execute();
					idC = conn.lastInsertRowID;
					for (var i = 0; i < items.length; ++i) {
						stClusterItem.params.cluster_id = idC;
						stClusterItem.params.item_id = items[i];
						stClusterItem.execute();
					}
				}
				conn.commitTransaction();
				var duration = (new Date().getTime() - startTime) / 1000;
				setProgress('Clustering items... done in ' + duration + ' secs.', 100);
			}
		})();
	},
	onShowButtonClick: function(event) {
		var doc = browser.contentDocument;
		var container = doc.getElementById('container');
		container.innerHTML = '';
		conn.beginTransaction();
		var stCluster = conn.createStatement('SELECT id, best_item_id FROM cluster');
		var stClusterItem = conn.createStatement(
			'SELECT i.feed_id, f.title AS feed_title, i.id, i.link, i.title, i.content, i.published, i.link_content, ci.centroid_distance '
			+ 'FROM cluster_item AS ci '
			+ 'INNER JOIN item AS i ON i.id = ci.item_id '
			+ 'INNER JOIN feed AS f ON f.id = i.feed_id '
			+ 'WHERE cluster_id = :cluster_id');
		var stCosines = conn.createStatement('SELECT item1_id, item2_id, cosine FROM pair WHERE item1_id IN (SELECT item_id FROM cluster_item WHERE cluster_id = :cluster_id) AND item2_id IN (SELECT item_id FROM cluster_item WHERE cluster_id = :cluster_id)');
		var div = doc.createElement('div');
		var colorFlag = 0;
		var i = 0;
		while (stCluster.executeStep()) {
			var cluster = {id: stCluster.row.id, bestItemID: stCluster.row.best_item_id};
			var items = {};
			stClusterItem.params.cluster_id = cluster.id;
			while (stClusterItem.executeStep()) {
				var item = {
					feedID: stClusterItem.row.feed_id,
					feedTitle: stClusterItem.row.feed_title,
					id: stClusterItem.row.id,
					link: stClusterItem.row.link,
					title: stClusterItem.row.title,
					content: stClusterItem.row.content,
					published: stClusterItem.row.published,
					linkContent: stClusterItem.row.link_content,
					centroidDistance: stClusterItem.row.centroid_distance
				};
				items[item.id] = item;
			}
			stClusterItem.reset();
			var bestItem = items[cluster.bestItemID];
			colorFlag = 1 - colorFlag;
			var html = '<div class="cluster flag' + colorFlag + '">Cluster ' + ++i;
			html += '<p><strong>Best item (closest to the centroid):</strong><br/>';
			html += bestItem.feedID + ' - ' + bestItem.feedTitle + '[centroid = ' + bestItem.centroidDistance + ']' + '<br/>';
			html += '<strong>' + bestItem.id + ' - ' + bestItem.title + '</strong> - ' + bestItem.link + '<br/>';
			html += '<em>' + bestItem.published + '</em><br/>';
			html += bestItem.content + ' <strong>[[[</strong>' + bestItem.linkContent + '<strong>]]]</strong>' + '</p>';
			html += '<hr/><p><strong>Related items from the same source:</strong></p>';
			for (var id in items) {
				if (id == cluster.bestItemID) continue;
				if (items[id].feedID != bestItem.feedID) continue;
				html += '<p>' + items[id].feedID + ' - ' + items[id].feedTitle + '[centroid = ' + items[id].centroidDistance + ']' + '<br/>';
				html += '<strong>' + items[id].id + ' - ' + items[id].title + '</strong> - ' + items[id].link + '<br/>';
				html += '<em>' + items[id].published + '</em><br/>';
				html += items[id].content + ' <strong>[[[</strong>' + items[id].linkContent + '<strong>]]]</strong>' + '</p>';
			}
			html += '<hr/><p><strong>Related items from other sources:</strong></p>';
			for (var id in items) {
				if (id == cluster.bestItemID) continue;
				if (items[id].feedID == bestItem.feedID) continue;
				html += '<p>' + items[id].feedID + ' - ' + items[id].feedTitle + '[centroid = ' + items[id].centroidDistance + ']' + '<br/>';
				html += '<strong>' + items[id].id + ' - ' + items[id].title + '</strong> - ' + items[id].link + '<br/>';
				html += '<em>' + items[id].published + '</em><br/>';
				html += items[id].content + ' <strong>[[[</strong>' + items[id].linkContent + '<strong>]]]</strong>' + '</p>';
			}
			// cosines
			html += '<hr/><p><strong>Pairwise cosine similarities:</strong></p>';
			stCosines.params.cluster_id = cluster.id;
			while (stCosines.executeStep()) {
				html += stCosines.row.item1_id + ', ' + stCosines.row.item2_id + ' = ' + stCosines.row.cosine + '<br/>';
			}
			stCosines.reset();
			html += '</div>';
			var div = doc.createElement('div');
			div.innerHTML = html;
			container.appendChild(div);
		}
		stCluster.reset();
		conn.commitTransaction();
	},
	onCentroidButtonClick: function(event) {
		var startTime = new Date().getTime();
		setProgress('Calculating centroids...', 0);
		conn.beginTransaction();
		var stItemCount = conn.createStatement("SELECT COUNT(*) AS count FROM item");
		var totalItems = stItemCount.executeStep() ? stItemCount.row.count : 0;
		var processedItems = 0;
		var stCluster = conn.createStatement("SELECT id FROM cluster");
		var stClusterItem = conn.createStatement("SELECT ci.item_id, i.word_count FROM cluster_item AS ci "
			+ "INNER JOIN item_stats AS i ON i.item_id = ci.item_id "
			+ "WHERE ci.cluster_id = :cluster_id");
		var stItemWord = conn.createStatement("SELECT ci.item_id, iw.word_id, iw.word_count, w.item_count FROM item_word AS iw "
				+ "INNER JOIN word AS w ON w.id = iw.word_id "
				+ "INNER JOIN cluster_item AS ci ON ci.item_id = iw.item_id "
				+ "WHERE ci.cluster_id = :cluster_id");
		var stBestItem = conn.createStatement('UPDATE cluster SET best_item_id = :best_item_id WHERE id = :cluster_id');
		var stDistance = conn.createStatement('UPDATE cluster_item SET centroid_distance = :centroid_distance WHERE cluster_id = :cluster_id AND item_id = :item_id');
		var log10 = Math.log(10);
		(function() {
			if (stCluster.executeStep()) {
				var cluster_id = stCluster.row.id;
				var items = {};
				stClusterItem.params.cluster_id = cluster_id;
				while (stClusterItem.executeStep()) {
					var item = {
						id: stClusterItem.row.item_id,
						wordCount: stClusterItem.row.word_count,
						words: {},
						vector: []
					};
					items[item.id] = item;
				}
				stClusterItem.reset();
				var words = {};
				stItemWord.params.cluster_id = cluster_id;
				while (stItemWord.executeStep()) {
					var item_id = stItemWord.row.item_id;
					var word_id = stItemWord.row.word_id;
					var word_count = stItemWord.row.word_count;
					var item_count = stItemWord.row.item_count;
					items[item_id].words[word_id] = word_count;
					words[word_id] = item_count;
				}
				stItemWord.reset();
				var centroid = [];
				for (var word_id in words) {
					var itemCount = words[word_id];
					var idf = Math.log(totalItems / itemCount) / log10;
					var centroid_num = 0, centroid_den = 0;
					for (var item_id in items) {
						var item = items[item_id];
						var tf = item.words[word_id] ? item.words[word_id] / item.wordCount : 0;
						var tfidf = tf * idf;
						item.vector.push(tfidf);
						centroid_num += tfidf;
						++centroid_den;
					}
					centroid.push(centroid_num / centroid_den);
				}
				var centroidNormSquared = Math.pow(norm(centroid), 2);
				var closestDistance = null;
				var closestItemId = null;
				for (var item_id in items) {
					var item = items[item_id];
					var distance = Math.sqrt(Math.pow(norm(item.vector), 2) + centroidNormSquared - 2 * dotProduct(item, centroid));
					log('item id = ' + item.id + ', dist = ' + distance);
					if (closestDistance == null || distance < closestDistance) {
						closestDistance = distance;
						closestItemId = item.id;
					}
					stDistance.params.cluster_id = cluster_id;
					stDistance.params.item_id = item_id;
					stDistance.params.centroid_distance = distance;
					stDistance.execute();
					++processedItems;
				}
				log('Centroid ' + cluster_id + ' = ' + centroid.join(', '));
				log('Closest: id = ' + closestItemId + ', dist = ' + closestDistance);
				stBestItem.params.cluster_id = cluster_id;
				stBestItem.params.best_item_id = closestItemId;
				stBestItem.execute();
				setProgress('Calculating centroids... ' + processedItems + '/' + totalItems, 100 * processedItems / totalItems);
				setTimeout(arguments.callee, 0);
			} else {
				conn.commitTransaction();
				var duration = (new Date().getTime() - startTime) / 1000;
				setProgress('Calculating centroids... done in ' + duration + ' secs.', 100);
			}
		})();
	},
	onStopUpdateButtonClick: function(event) {
	},
	getURL: function(url) {
		try {
			var httpRequest = new XMLHttpRequest();
			httpRequest.open("GET", url, false); //false = synchronous
			var httpRequest_onload = function() {
				var data = httpRequest.responseText;
				for (var entity in entityToCharCode) {
					data = data.replace(entity, String.fromCharCode(entityToCharCode[entity]), 'g');
				}
				data = data.replace(/\s+/gi, ' ');
				//todo Remover comentários
				function removeTagBlocks(tags) {
					for (var i = 0; i < tags.length; ++i) {
						var r = new RegExp('\\<' + tags[i] + '.*?\\>.*?\\<\\/' + tags[i] + '.*?\\>', 'gi');
						data = data.replace(r, ' ');
					}
				}
				function removeTags(tags) {
					for (var i = 0; i < tags.length; ++i) {
						var r = new RegExp('\\<\\/?' + tags[i] + '(\\s+[^\\>]*)*\\>', 'gi');
						data = data.replace(r, ' ');
					}
				}
				removeTagBlocks(['script', 'style']);
				removeTags(['a', 'b', 'strong', 'em', 'i',, 'u', 'span', 'br', 'p']); // remover p ou </p><p>? remover div?
				data = data.replace(/\<[^\>]*\/\>/gi, ' '); // <tag/> por ''
				data = data.replace(/\<(\/[^\>\s]*)[^\>]*\>/gi, '<$1>'); // <tag *> por <tag>
				data = data.replace(/\<([^\/][^\>\s]*)[^\>]*\>/gi, '<$1>'); // </tag *> por <tag>
				data = data.replace(/[0-9A-Za-z](\.[0-9A-Za-z])+/gi, function(str) { // 100.103 por 100103 e Y.M.C.A. por YMCA
					return str.replace('.', '');
				});
				data = data.replace(/\s+/gi, ' ');
				//log(data);
				var sentences = [];
				var re = /([^\<\>\.\s][^\<\>\.]*\.)/gi; // problema da "frase com aspas dps do ponto."
				var match, lastSentence = null;
				while (match = re.exec(data)) {
					var sentence = {text: match[1], beginPos: match.index, endPos: match.index + match[1].length - 1};
					if (lastSentence == null || sentence.beginPos - lastSentence.endPos > 5) {
						sentences.push([sentence.text]);
						//alert("NOVO - '" + sentence.text + "' = " + sentence.beginPos + '-' + sentence.endPos);
					} else {
						sentences[sentences.length - 1].push(sentence.text);
						//alert("'" + sentence.text + "' = " + sentence.beginPos + '-' + sentence.endPos);
					}
					lastSentence = sentence;
				}
				var found3 = false
				for (var i = sentences.length - 1; i >= 0; --i) {
					/*if (sentences[i].length < 2) sentences.splice(i, 1);
					else */if (sentences[i].length < 3 && !found3) sentences.splice(i, 1);
					else {
						found3 = true;
						sentences.splice(i, 1, sentences[i].join(' '));
					}
				}
				var text = sentences.join(' ');
				return text;
			}
			httpRequest.send();
			var ret = httpRequest_onload();
			var posInvalidChar = ret.indexOf('\uFFFD');
			if (posInvalidChar > -1) {
				log('Invalid char at ' + posInvalidChar + ' in ' + url + ': ' + ret.substr(posInvalidChar - 20, 40));
				httpRequest.open("GET", url, false); //false = synchronous
				httpRequest.overrideMimeType("text/html; charset=iso-8859-1");
				httpRequest.send();
				ret = httpRequest_onload();
			}
			log(httpRequest.getAllResponseHeaders());
			log(ret);
			return ret;
		} catch (e) {
			log('erro' + e);
		}
	},
	onGetURLButtonClick: function(event) {
		var tests =	[
			{url: 'http://verdesmares.globo.com/v3/canais/noticias.asp?codigo=273441&modulo=964', words: 507, sentences: 18},
			{url: 'http://g1.globo.com/Noticias/SaoPaulo/0,,MUL1339771-5605,00.html', words: 572, sentences: 33},
			{url: 'http://opovo.uol.com.br/opovo/economia/918600.html', words: 201, sentences: 9},
			{url: 'http://www1.folha.uol.com.br/folha/brasil/ult96u641060.shtml', words: 340, sentences: 13},
			{url: 'http://celebridades.uol.com.br/ultnot/2009/10/21/ult4233u519.jhtm', words: 247, sentences: 15},
			{url: 'http://noticias.uol.com.br/cotidiano/2009/10/21/ult5772u5753.jhtm', words: 286, sentences: 11},
			{url: 'http://ultimosegundo.ig.com.br/mundo/2009/10/21/eurodeputados+lancam+campanha+contra+candidatura+de+blair+a+presidencia+da+ue+8902903.html', words: 199, sentences: 6},
			{url: 'http://feedproxy.google.com/~r/pvm-uh/~3/4AmjoJpnKQg/noticias.asp', words: 256, sentences: 12},
			{url: 'http://br.rd.yahoo.com/dailynews/rss/manchetes/*http://br.noticias.yahoo.com/s/afp/__ndia_trem_acidente', words: 99, sentences: 4},
			{url: 'http://invertia.terra.com.br/sustentabilidade/interna/0,,OI4054118-EI10411,00.html', words: 180, sentences: 7},
			{url: 'http://noticias.terra.com.br/brasil/noticias/0,,OI4054144-EI7896,00.html', words: 423, sentences: 19},
			{url: 'http://diversao.terra.com.br/tv/noticias/0,,OI4054136-EI12993,00.html', words: 102, sentences: 4},
			{url: 'http://esportes.terra.com.br/futebol/interna/0,,OI4054133-EI1832,00.html', words: 180, sentences: 8}
		];
		var passed = 0;
		log('Get URL Test');
		for (var i = 0; i < tests.length; ++i) {
			//if (i > 1) break;
			var text = this.getURL(tests[i].url);
			var words = text.split(' ').length;
			var sentences = text.split('.').length - 1;
			var passedWords = words >= tests[i].words;
			var passedSentences = sentences >= tests[i].sentences;
			log('words(' + words + '/' + tests[i].words + ')=' + passedWords +
				', sentences(' + sentences + '/' + tests[i].sentences + ')=' + passedSentences + ', url=' + tests[i].url);
			if (passedWords && passedSentences) ++passed;
		}
		log('End Get URL Test: ' + passed + '/' + tests.length);
		return;
		var url = prompt('URL:');
		if (!url) return;
		this.getURL(url);
	},
	fetchFeed: function(feedID, feedURL, conn) {
		var httpRequest = null;
		var this_ = this;
		var stUpdateFeed = conn.createStatement("UPDATE feed SET title = :title, description = :description, updated = :updated WHERE id = :id");
		var stInsertItem = conn.createStatement("INSERT OR IGNORE INTO item (feed_id, title, link, content, published) VALUES (:feed_id, :title, :link, :content, :published)");
		var stUpdateItem = conn.createStatement("UPDATE item SET link_content = :link_content WHERE id = :id");
		var listener = {
		  handleResult: function(result) {
		  log(feedURL + ' - handleResult begin...');
/*		  var file = Components.classes["@mozilla.org/file/directory_service;1"]  
		.getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);  
file.append("bonner.sqlite");
var storageService = Components.classes["@mozilla.org/storage/service;1"]  
		.getService(Components.interfaces.mozIStorageService);  
var conn = storageService.openUnsharedDatabase(file);*/

			var feed = result.doc;
			feed.QueryInterface(Components.interfaces.nsIFeed);
			stUpdateFeed.params.id = feedID;
			log(feed.title.text);
			stUpdateFeed.params.title = feed.title.text;
			stUpdateFeed.params.description = feed.subtitle.text;
			stUpdateFeed.params.updated = feed.updated;
			log('before execute');
			try {
				stUpdateFeed.execute();
			} catch (e) {
				log(e);
			}
			log('after  execute');
			var itemArray = feed.items;
			var numItems = itemArray.length;
			log('items: ' + numItems);
			var theEntry;
			var erros = '';
			for (var i=0; i<numItems; i++) {
				theEntry = itemArray.queryElementAt(i, Components.interfaces.nsIFeedEntry);
				if (!theEntry) continue;
				var link = theEntry.link.resolve('');
				var lastID = conn.lastInsertRowID;
				log('lastID before = ' + lastID);
				log(i + ' - ' + theEntry.title.text);
				stInsertItem.params.feed_id = feedID;
				stInsertItem.params.title = theEntry.title.text;
				stInsertItem.params.link = link;
				stInsertItem.params.content = theEntry.summary ? theEntry.summary.text : theEntry.content.text;
				stInsertItem.params.published = theEntry.published;
				try {
					stInsertItem.execute();
				} catch (e) {
					erros += conn.lastErrorString + '\r\n';
					log('erro: ' + conn.lastErrorString);
				}
				log('lastID after = ' + conn.lastInsertRowID);
				if (lastID != conn.lastInsertRowID) {
					log('linkContent begin');
					var linkContent = this_.getURL(link);
					log('linkContent end');
					stUpdateItem.params.link_content = linkContent;
					stUpdateItem.params.id = conn.lastInsertRowID;
					try {
						stUpdateItem.execute();
					} catch (e) {
						erros += conn.lastErrorString + '\r\n';
						log('erro: ' + conn.lastErrorString);
					}
				}
			}
			log(feedURL + ' - handleResult end.');
			if (erros != '') log(erros);
		  }
		};
		
		function infoReceived() {
			log(feedURL + ' - Info received begin...');
		  var data = httpRequest.responseText;
		  var ioService = Components.classes['@mozilla.org/network/io-service;1']
											 .getService(Components.interfaces.nsIIOService);
		  var uri = ioService.newURI(feedURL, null, null);
		  if (data.length) {
			var parser = Components.classes["@mozilla.org/feed-processor;1"]
											.createInstance(Components.interfaces.nsIFeedProcessor);
			try {
			  parser.listener = listener;
			  log(feedURL + ' - parseFromString begin...');
			  parser.parseFromString(data, uri);
			  log(feedURL + ' - parseFromString end.');
			  log(feedURL + ' - Info received end.');
			} catch(e) {
			  log("Error parsing feed.");
			}
		  }
		}
		log(feedURL + ' - Iniciando XMLHTTPRequest...');
		httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", feedURL, false);
		try {			
		  //httpRequest.onload = infoReceived;
		  httpRequest.send();
		  infoReceived();
		  log(feedURL + ' - Iniciando XMLHTTPRequest... done.');
		} catch(e) {
		  log(e);
		}

	}
};

})();