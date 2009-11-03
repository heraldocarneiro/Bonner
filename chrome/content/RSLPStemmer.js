if (!com) var com = {};
if (!com.heraldocarneiro) com.heraldocarneiro = {};
if (!com.heraldocarneiro.bonner) com.heraldocarneiro.bonner = {};

com.heraldocarneiro.ArrayUtils = {
	arrayToObject: function(array) {
		var obj = {};
		for (var i = 0; i < array.length; ++i) {
			obj[array[i]] = null;
		}
		return obj;
	}
};

com.heraldocarneiro.StringUtils = {
	removeAccents: function(word) {
		var w = '';
		for (var i = 0; i < word.length; ++i) {
			var ch = word.charCodeAt(i);
			if (ch >= 224 && ch <= 229) {
				w += 'a';
			} else if (ch == 231) { // ç
				w += 'c';
			} else if (ch >= 232 && ch <= 235) {
				w += 'e';
			} else if (ch >= 236 && ch <= 239) {
				w += 'i';
			} else if (ch >= 242 && ch <= 246) {
				w += 'o';
			} else if (ch == 241) { // ñ
				w += 'n';
			} else if (ch >= 249 && ch <= 252) {
				w += 'u';
			} else if (ch == 253 || ch == 255) { // ý
				w += 'y';
			} else {
				w += word.charAt(i);
			}
		}
		return w;
	},	
	endsWith: function(str, re) {
		return new RegExp(re + '$').test(str);
	},
	getCharCode: function(c) {
		return c.charCodeAt(0);
	},
	isLetter: function(c) {
		return c.toLowerCase() != c.toUpperCase();
	},
	isLowerCase: function(c) {
		return this.isLetter(c) && c == c.toLowerCase();
	},
	isUpperCase: function(c) {
		return this.isLetter(c) && c == c.toUpperCase();
	}
};

com.heraldocarneiro.bonner.StopWordsRemover = (function() {
	var StringUtils = com.heraldocarneiro.StringUtils;
	var ArrayUtils = com.heraldocarneiro.ArrayUtils;
	var stopWords = StringUtils.removeAccents('a acerca ainda algo algum alguma algumas alguns alguém ali além ambos ampla amplas amplo amplos ante antes ao aos apenas apesar após aquela aquelas aquele aqueles aqui aquilo as assim através atrás até aí bastante bem bom cada caso cerca certamente certeza coisa coisas com como contudo cá da daquela daquele daqueles dar das de dela delas dele deles demais dentro depois desde dessa dessas desse desses desta destas deste destes diante disso disto do dos durante dá dão e ela elas ele eles em embora enquanto entanto entre então era eram essa essas esse esses esta estas este estes está eu foi for foram fosse fossem geral grande grandes haja havia houve houver há ir irá isso isto já lhe lhes logo lá mais mal mas me meio mesma mesmas mesmo mesmos meu meus minha minhas muita muitas muito muitos na nada naquela naquele nas nem nenhum nenhuma nessa nessas nesse nesta nestas neste ninguém no nos nossa nossas nosso nossos num numa não nós o onde os ou outra outras outro outros para pela pelas pelo pelos per perante perto pode podem podendo poderia poderiam poderá podia podiam pois por porque porquê porém pouca poucas pouco poucos quais qual qualquer quando quanto quantos quase que quem quer quero quê se seja sejam sem sendo ser seria seriam será serão seu seus si sido sim sob sobre somente somos sou sua suas são só tal talvez também tampouco tanto te tem temos tenha tenham tenhamos tenho tens ter teremos teria teriam terá terão teu teus teve ti tido tinha tinham tive tiver tiveram tiverem tivesse tivessem tivéssemos toda todas todavia todo todos tu tua tuas tudo tão têm um uma umas uns usa usar vai vais veja vem vendo ver vez vezes vindo vir você vocês vos vossa vossas vosso vossos vários vão vêm vós à às é és');
	alert(stopWords);
	stopWords = ArrayUtils.arrayToObject(stopWords.split(' '));
	
	return {
		removeAccents: true,
		isStopWord: function(word) {
			word = word.toLowerCase();
			if (this.removeAccents) word = StringUtils.removeAccents(word);
			if (word in stopWords) return true;
			return false;
		},
		fromArray: function(array) {
			for (var i = array.length - 1; i >= 0; --i) {
				if (this.isStopWord(array[i])) array.splice(i, 1);
			}
		}
	};
})();

com.heraldocarneiro.bonner.RSLPStemmer = (function() {

	var MIN_WORD_LENGTH = 3; // Minimun word length to be stemmed
	var MASK_WORD_STARTS_WITH_CAPITAL_LETTER = 1; // Bit 0 indicates if word start with a capital letter
	var MASK_WORD_HAS_DIGITS	= 2; // Bit 1 indicates if word has digits (numbers)
	var MASK_WORD_HAS_ISO_CHARS = 4 // Bit 2 indicates if word has accentuated characters
	var MASK_WORD_TOO_SMALL = 8; // Bit 3 indicates if word is smaller than RSLP_STEMMER_MIN_WORD_LENGTH 

	var defaultSteps = {
		'Plural': {
			name: 'Plural',
			minWordSize: 3,
			compareEntireWord: true,
			wordEndings: ['s'],
			rules: [
				{suffix: 'ns', minStemSize: 1, replacement: 'm'},
				{suffix: 'ões', minStemSize: 3, replacement: 'ão'},
				{suffix: 'ães', minStemSize: 1, replacement: 'ão', exceptions: ['mãe']},
				{suffix: 'ais', minStemSize: 1, replacement: 'al', exceptions: ['cais', 'mais']},
				{suffix: 'éis', minStemSize: 2, replacement: 'el'},
				{suffix: 'eis', minStemSize: 2, replacement: 'el'},
				{suffix: 'óis', minStemSize: 2, replacement: 'ol'},
				{suffix: 'is', minStemSize: 2, replacement: 'il', exceptions: ['lápis', 'cais', 'mais', 'crúcis', 'biquínis', 'pois', 'depois', 'dois', 'leis']},
				{suffix: 'les', minStemSize: 3, replacement: 'l'},
				{suffix: 'res', minStemSize: 3, replacement: 'r'},
				{suffix: 's', minStemSize: 2, exceptions: ['aliás', 'pires', 'lápis', 'cais', 'mais', 'mas', 'menos', 'férias', 'fezes', 'pêsames', 'crúcis', 'gás', 'atrás', 'moisés', 'através', 'convés', 'ês', 'país', 'após', 'ambas', 'ambos', 'messias']}
			]
		},
		'Feminine': {
			name: 'Feminine',
			minWordSize: 3,
			compareEntireWord: true,
			wordEndings: ['a', 'ã'],
			rules: [
				{suffix: 'ona', minStemSize: 3, replacement: 'ão', exceptions: ['abandona', 'lona', 'iona', 'cortisona', 'monótona', 'maratona', 'acetona', 'detona', 'carona']},
				{suffix: 'ora', minStemSize: 3, replacement: 'or'},
				{suffix: 'na', minStemSize: 4, replacement: 'no', exceptions: ['carona', 'abandona', 'lona', 'iona', 'cortisona', 'monótona', 'maratona', 'acetona', 'detona', 'guiana', 'campana', 'grana', 'caravana', 'banana', 'paisana']},
				{suffix: 'inha', minStemSize: 3, replacement: 'inho', exceptions: ['rainha', 'linha', 'minha']},
				{suffix: 'esa', minStemSize: 3, replacement: 'ês', exceptions: ['mesa', 'obesa', 'princesa', 'turquesa', 'ilesa', 'pesa', 'presa']},
				{suffix: 'osa', minStemSize: 3, replacement: 'oso', exceptions: ['mucosa', 'prosa']},
				{suffix: 'íaca', minStemSize: 3, replacement: 'íaco'},
				{suffix: 'ica', minStemSize: 3, replacement: 'ico', exceptions: ['dica']},
				{suffix: 'ada', minStemSize: 2, replacement: 'ado', exceptions: ['pitada']},
				{suffix: 'ida', minStemSize: 3, replacement: 'ido', exceptions: ['vida']},
				{suffix: 'ída', minStemSize: 3, replacement: 'ido', exceptions: ['recaída', 'saída', 'dúvida']},
				{suffix: 'ima', minStemSize: 3, replacement: 'imo', exceptions: ['vítima']},
				{suffix: 'iva', minStemSize: 3, replacement: 'ivo', exceptions: ['saliva', 'oliva']},
				{suffix: 'eira', minStemSize: 3, replacement: 'eiro', exceptions: ['beira', 'cadeira', 'frigideira', 'bandeira', 'feira', 'capoeira', 'barreira', 'fronteira', 'besteira', 'poeira']},
				{suffix: 'ã', minStemSize: 2, replacement: 'ão', exceptions: ['amanhã', 'arapuã', 'fã', 'divã']}
			]
		},
		'Adverb': {
			name: 'Adverb',
			minWordSize: 0,
			compareEntireWord: false,
			wordEndings: [],
			rules: [
				{suffix: 'mente', minStemSize: 4, exceptions: ['experimente']}
			]
		},
		'Augmentative': {
			name: 'Augmentative',
			minWordSize: 0,
			compareEntireWord: true,
			wordEndings: [],
			rules: [
				{suffix: 'díssimo', minStemSize: 5},
				{suffix: 'abilíssimo', minStemSize: 5},
				{suffix: 'íssimo', minStemSize: 3},
				{suffix: 'ésimo', minStemSize: 3},
				{suffix: 'érrimo', minStemSize: 4},
				{suffix: 'zinho', minStemSize: 2},
				{suffix: 'quinho', minStemSize: 4, replacement: 'c'},
				{suffix: 'uinho', minStemSize: 4},
				{suffix: 'adinho', minStemSize: 3},
				{suffix: 'inho', minStemSize: 3, exceptions: ['caminho', 'cominho']},
				{suffix: 'alhão', minStemSize: 4},
				{suffix: 'uça', minStemSize: 4},
				{suffix: 'aço', minStemSize: 4, exceptions: ['antebraço']},
				{suffix: 'aça', minStemSize: 4},
				{suffix: 'adão', minStemSize: 4},
				{suffix: 'idão', minStemSize: 4},
				{suffix: 'ázio', minStemSize: 3, exceptions: ['topázio']},
				{suffix: 'arraz', minStemSize: 4},
				{suffix: 'zarrão', minStemSize: 3},
				{suffix: 'arrão', minStemSize: 4},
				{suffix: 'arra', minStemSize: 3},
				{suffix: 'zão', minStemSize: 2, exceptions: ['coalizão']},
				{suffix: 'ão', minStemSize: 3, exceptions: ['camarão', 'chimarrão', 'canção', 'coração', 'embrião', 'grotão', 'glutão', 'ficção', 'fogão', 'feição', 'furacão', 'gamão', 'lampião', 'leão', 'macacão', 'nação', 'órfão', 'orgão', 'patrão', 'portão', 'quinhão', 'rincão', 'tração', 'falcão', 'espião', 'mamão', 'folião', 'cordão', 'aptidão', 'campeão', 'colchão', 'limão', 'leilão', 'melão', 'barão', 'milhão', 'bilhão', 'fusão', 'cristão', 'ilusão', 'capitão', 'estação', 'senão']}
			]
		},
		'Noun': {
			name: 'Noun',
			minWordSize: 0,
			compareEntireWord: false,
			wordEndings: [],
			rules: [
				{suffix: 'encialista', minStemSize: 4},
				{suffix: 'alista', minStemSize: 5},
				{suffix: 'agem', minStemSize: 3, exceptions: ['coragem', 'chantagem', 'vantagem', 'carruagem']},
				{suffix: 'iamento', minStemSize: 4},
				{suffix: 'amento', minStemSize: 3, exceptions: ['firmamento', 'fundamento', 'departamento']},
				{suffix: 'imento', minStemSize: 3},
				{suffix: 'mento', minStemSize: 6, exceptions: ['firmamento', 'elemento', 'complemento', 'instrumento', 'departamento']},
				{suffix: 'alizado', minStemSize: 4},
				{suffix: 'atizado', minStemSize: 4},
				{suffix: 'tizado', minStemSize: 4, exceptions: ['alfabetizado']},
				{suffix: 'izado', minStemSize: 5, exceptions: ['organizado', 'pulverizado']},
				{suffix: 'ativo', minStemSize: 4, exceptions: ['pejorativo', 'relativo']},
				{suffix: 'tivo', minStemSize: 4, exceptions: ['relativo']},
				{suffix: 'ivo', minStemSize: 4, exceptions: ['passivo', 'possessivo', 'pejorativo', 'positivo']},
				{suffix: 'ado', minStemSize: 2, exceptions: ['grado']},
				{suffix: 'ido', minStemSize: 3, exceptions: ['cândido', 'consolido', 'rápido', 'decido', 'tímido', 'duvido', 'marido']},
				{suffix: 'ador', minStemSize: 3},
				{suffix: 'edor', minStemSize: 3},
				{suffix: 'idor', minStemSize: 4, exceptions: ['ouvidor']},
				{suffix: 'dor', minStemSize: 4, exceptions: ['ouvidor']},
				{suffix: 'sor', minStemSize: 4, exceptions: ['assessor']},
				{suffix: 'atoria', minStemSize: 5},
				{suffix: 'tor', minStemSize: 3, exceptions: ['benfeitor', 'leitor', 'editor', 'pastor', 'produtor', 'promotor', 'consultor']},
				{suffix: 'or', minStemSize: 2, exceptions: ['motor', 'melhor', 'redor', 'rigor', 'sensor', 'tambor', 'tumor', 'assessor', 'benfeitor', 'pastor', 'terior', 'favor', 'autor']},
				{suffix: 'abilidade', minStemSize: 5},
				{suffix: 'icionista', minStemSize: 4},
				{suffix: 'cionista', minStemSize: 5},
				{suffix: 'ionista', minStemSize: 5},
				{suffix: 'ionar', minStemSize: 5},
				{suffix: 'ional', minStemSize: 4},
				{suffix: 'ência', minStemSize: 3},
				{suffix: 'ância', minStemSize: 4, exceptions: ['ambulância']},
				{suffix: 'edouro', minStemSize: 3},
				{suffix: 'queiro', minStemSize: 3, replacement: 'c'},
				{suffix: 'adeiro', minStemSize: 4, exceptions: ['desfiladeiro']},
				{suffix: 'eiro', minStemSize: 3, exceptions: ['desfiladeiro', 'pioneiro', 'mosteiro']},
				{suffix: 'uoso', minStemSize: 3},
				{suffix: 'oso', minStemSize: 3, exceptions: ['precioso']},
				{suffix: 'alizaç', minStemSize: 5},
				{suffix: 'atizaç', minStemSize: 5},
				{suffix: 'tizaç', minStemSize: 5},
				{suffix: 'izaç', minStemSize: 5, exceptions: ['organizaç']},
				{suffix: 'aç', minStemSize: 3, exceptions: ['equaç', 'relaç']},
				{suffix: 'iç', minStemSize: 3, exceptions: ['eleição']},
				{suffix: 'ário', minStemSize: 3, exceptions: ['voluntário', 'salário', 'aniversário', 'diário', 'lionário', 'armário']},
				{suffix: 'atório', minStemSize: 3},
				{suffix: 'rio', minStemSize: 5, exceptions: ['voluntário', 'salário', 'aniversário', 'diário', 'compulsório', 'lionário', 'próprio', 'stério', 'armário']},
				{suffix: 'ério', minStemSize: 6},
				{suffix: 'ês', minStemSize: 4},
				{suffix: 'eza', minStemSize: 3},
				{suffix: 'ez', minStemSize: 4},
				{suffix: 'esco', minStemSize: 4},
				{suffix: 'ante', minStemSize: 2, exceptions: ['gigante', 'elefante', 'adiante', 'possante', 'instante', 'restaurante']},
				{suffix: 'ástico', minStemSize: 4, exceptions: ['eclesiástico']},
				{suffix: 'alístico', minStemSize: 3},
				{suffix: 'áutico', minStemSize: 4},
				{suffix: 'êutico', minStemSize: 4},
				{suffix: 'tico', minStemSize: 3, exceptions: ['político', 'eclesiástico', 'diagnostico', 'prático', 'doméstico', 'diagnóstico', 'idêntico', 'alopático', 'artístico', 'autêntico', 'eclético', 'crítico', 'critico']},
				{suffix: 'ico', minStemSize: 4, exceptions: ['tico', 'público', 'explico']},
				{suffix: 'ividade', minStemSize: 5},
				{suffix: 'idade', minStemSize: 4, exceptions: ['autoridade', 'comunidade']},
				{suffix: 'oria', minStemSize: 4, exceptions: ['categoria']},
				{suffix: 'encial', minStemSize: 5},
				{suffix: 'ista', minStemSize: 4},
				{suffix: 'auta', minStemSize: 5},
				{suffix: 'quice', minStemSize: 4, replacement: 'c'},
				{suffix: 'ice', minStemSize: 4, exceptions: ['cúmplice']},
				{suffix: 'íaco', minStemSize: 3},
				{suffix: 'ente', minStemSize: 4, exceptions: ['freqüente', 'alimente', 'acrescente', 'permanente', 'oriente', 'aparente']},
				{suffix: 'ense', minStemSize: 5},
				{suffix: 'inal', minStemSize: 3},
				{suffix: 'ano', minStemSize: 4},
				{suffix: 'ável', minStemSize: 2, exceptions: ['afável', 'razoável', 'potável', 'vulnerável']},
				{suffix: 'ível', minStemSize: 3, exceptions: ['possível']},
				{suffix: 'vel', minStemSize: 5, exceptions: ['possível', 'vulnerável', 'solúvel']},
				{suffix: 'bil', minStemSize: 3, replacement: 'vel'},
				{suffix: 'ura', minStemSize: 4, exceptions: ['imatura', 'acupuntura', 'costura']},
				{suffix: 'ural', minStemSize: 4},
				{suffix: 'ual', minStemSize: 3, exceptions: ['bissexual', 'virtual', 'visual', 'pontual']},
				{suffix: 'ial', minStemSize: 3},
				{suffix: 'al', minStemSize: 4, exceptions: ['afinal', 'animal', 'estatal', 'bissexual', 'desleal', 'fiscal', 'formal', 'pessoal', 'liberal', 'postal', 'virtual', 'visual', 'pontual', 'sideral', 'sucursal']},
				{suffix: 'alismo', minStemSize: 4},
				{suffix: 'ivismo', minStemSize: 4},
				{suffix: 'ismo', minStemSize: 3, exceptions: ['cinismo']}
			]
		},
		'Verb': {
			name: 'Verb',
			minWordSize: 0,
			compareEntireWord: false,
			wordEndings: [],
			rules: [
				{suffix: 'aríamo', minStemSize: 2},
				{suffix: 'ássemo', minStemSize: 2},
				{suffix: 'eríamo', minStemSize: 2},
				{suffix: 'êssemo', minStemSize: 2},
				{suffix: 'iríamo', minStemSize: 3},
				{suffix: 'íssemo', minStemSize: 3},
				{suffix: 'áramo', minStemSize: 2},
				{suffix: 'árei', minStemSize: 2},
				{suffix: 'aremo', minStemSize: 2},
				{suffix: 'ariam', minStemSize: 2},
				{suffix: 'aríei', minStemSize: 2},
				{suffix: 'ássei', minStemSize: 2},
				{suffix: 'assem', minStemSize: 2},
				{suffix: 'ávamo', minStemSize: 2},
				{suffix: 'êramo', minStemSize: 3},
				{suffix: 'eremo', minStemSize: 3},
				{suffix: 'eriam', minStemSize: 3},
				{suffix: 'eríei', minStemSize: 3},
				{suffix: 'êssei', minStemSize: 3},
				{suffix: 'essem', minStemSize: 3},
				{suffix: 'íramo', minStemSize: 3},
				{suffix: 'iremo', minStemSize: 3},
				{suffix: 'iriam', minStemSize: 3},
				{suffix: 'iríei', minStemSize: 3},
				{suffix: 'íssei', minStemSize: 3},
				{suffix: 'issem', minStemSize: 3},
				{suffix: 'ando', minStemSize: 2},
				{suffix: 'endo', minStemSize: 3},
				{suffix: 'indo', minStemSize: 3},
				{suffix: 'ondo', minStemSize: 3},
				{suffix: 'aram', minStemSize: 2},
				{suffix: 'arão', minStemSize: 2},
				{suffix: 'arde', minStemSize: 2},
				{suffix: 'arei', minStemSize: 2},
				{suffix: 'arem', minStemSize: 2},
				{suffix: 'aria', minStemSize: 2},
				{suffix: 'armo', minStemSize: 2},
				{suffix: 'asse', minStemSize: 2},
				{suffix: 'aste', minStemSize: 2},
				{suffix: 'avam', minStemSize: 2, exceptions: ['agravam']},
				{suffix: 'ávei', minStemSize: 2},
				{suffix: 'eram', minStemSize: 3},
				{suffix: 'erão', minStemSize: 3},
				{suffix: 'erde', minStemSize: 3},
				{suffix: 'erei', minStemSize: 3},
				{suffix: 'êrei', minStemSize: 3},
				{suffix: 'erem', minStemSize: 3},
				{suffix: 'eria', minStemSize: 3},
				{suffix: 'ermo', minStemSize: 3},
				{suffix: 'esse', minStemSize: 3},
				{suffix: 'este', minStemSize: 3, exceptions: ['faroeste', 'agreste']},
				{suffix: 'íamo', minStemSize: 3},
				{suffix: 'iram', minStemSize: 3},
				{suffix: 'íram', minStemSize: 3},
				{suffix: 'irão', minStemSize: 2},
				{suffix: 'irde', minStemSize: 2},
				{suffix: 'irei', minStemSize: 3, exceptions: ['admirei']},
				{suffix: 'irem', minStemSize: 3, exceptions: ['adquirem']},
				{suffix: 'iria', minStemSize: 3},
				{suffix: 'irmo', minStemSize: 3},
				{suffix: 'isse', minStemSize: 3},
				{suffix: 'iste', minStemSize: 4},
				{suffix: 'iava', minStemSize: 4, exceptions: ['ampliava']},
				{suffix: 'amo', minStemSize: 2},
				{suffix: 'iona', minStemSize: 3},
				{suffix: 'ara', minStemSize: 2, exceptions: ['arara', 'prepara']},
				{suffix: 'ará', minStemSize: 2, exceptions: ['alvará']},
				{suffix: 'are', minStemSize: 2, exceptions: ['prepare']},
				{suffix: 'ava', minStemSize: 2, exceptions: ['agrava']},
				{suffix: 'emo', minStemSize: 2},
				{suffix: 'era', minStemSize: 3, exceptions: ['acelera', 'espera']},
				{suffix: 'erá', minStemSize: 3},
				{suffix: 'ere', minStemSize: 3, exceptions: ['espere']},
				{suffix: 'iam', minStemSize: 3, exceptions: ['enfiam', 'ampliam', 'elogiam', 'ensaiam']},
				{suffix: 'íei', minStemSize: 3},
				{suffix: 'imo', minStemSize: 3, exceptions: ['reprimo', 'intimo', 'íntimo', 'nimo', 'queimo', 'ximo']},
				{suffix: 'ira', minStemSize: 3, exceptions: ['fronteira', 'sátira']},
				{suffix: 'ído', minStemSize: 3},
				{suffix: 'irá'},
				{suffix: 'tizar', minStemSize: 4, exceptions: ['alfabetizar']},
				{suffix: 'izar', minStemSize: 5, exceptions: ['organizar']},
				{suffix: 'itar', minStemSize: 5, exceptions: ['acreditar', 'explicitar', 'estreitar']},
				{suffix: 'ire', minStemSize: 3, exceptions: ['adquire']},
				{suffix: 'omo', minStemSize: 3},
				{suffix: 'ai', minStemSize: 2},
				{suffix: 'am', minStemSize: 2},
				{suffix: 'ear', minStemSize: 4, exceptions: ['alardear', 'nuclear']},
				{suffix: 'ar', minStemSize: 2, exceptions: ['azar', 'bazaar', 'patamar']},
				{suffix: 'uei', minStemSize: 3},
				{suffix: 'uía', minStemSize: 5, replacement: 'u'},
				{suffix: 'ei', minStemSize: 3},
				{suffix: 'guem', minStemSize: 3, replacement: 'g'},
				{suffix: 'em', minStemSize: 2, exceptions: ['alem', 'virgem']},
				{suffix: 'er', minStemSize: 2, exceptions: ['éter', 'pier']},
				{suffix: 'eu', minStemSize: 3, exceptions: ['chapeu']},
				{suffix: 'ia', minStemSize: 3, exceptions: ['estória', 'fatia', 'acia', 'praia', 'elogia', 'mania', 'lábia', 'aprecia', 'polícia', 'arredia', 'cheia', 'ásia']},
				{suffix: 'ir', minStemSize: 3, exceptions: ['freir']},
				{suffix: 'iu', minStemSize: 3},
				{suffix: 'eou', minStemSize: 5},
				{suffix: 'ou', minStemSize: 3},
				{suffix: 'i', minStemSize: 3}
			]
		},
		'Vowel': {
			name: 'Vowel',
			minWordSize: 0,
			compareEntireWord: false,
			wordEndings: [],
			rules: [
				{suffix: 'bil', minStemSize: 2, replacement: 'vel'},
				{suffix: 'gue', minStemSize: 2, replacement: 'g', exceptions: ['gangue', 'jegue']},
				{suffix: 'á', minStemSize: 3},
				{suffix: 'ê', minStemSize: 3, exceptions: ['bebê']},
				{suffix: 'a', minStemSize: 3, exceptions: ['ásia']},
				{suffix: 'e', minStemSize: 3},
				{suffix: 'o', minStemSize: 3, exceptions: ['ão']}
			]
		}
	};
	
	var defaultFlow = [
		{stepName: 'Plural', stepTrue: 'Adverb', stepFalse: 'Adverb'},
		{stepName: 'Adverb', stepTrue: 'Feminine', stepFalse: 'Feminine'},
		{stepName: 'Feminine', stepTrue: 'Augmentative', stepFalse: 'Augmentative'},
		{stepName: 'Augmentative', stepTrue: 'Noun', stepFalse: 'Noun'},
		{stepName: 'Noun', stepTrue: null, stepFalse: 'Verb'},
		{stepName: 'Verb', stepTrue: null, stepFalse: 'Vowel'},
		{stepName: 'Vowel', stepTrue: null, stepFalse: null}
	];

	var flags = {};
	var lists = {};
	var stemDictionary = {};
	
	var ArrayUtils = com.heraldocarneiro.ArrayUtils;
	var StringUtils = com.heraldocarneiro.StringUtils;

	
	function getWordStatus(word) { 
		var s = 0;
		if (StringUtils.isUpperCase(word.charAt(i))) {
			s |= MASK_WORD_STARTS_WITH_CAPITAL_LETTER;
		}
		for (var i = 0; i < word.length; ++i) {
			var charCode = word.charCodeAt(i);
			if (charCode >= StringUtils.getCharCode('0') && charCode <= StringUtils.getCharCode('9')) {
				s |= MASK_WORD_HAS_DIGITS;
			}
			if (charCode > 127) {
				s |= MASK_WORD_HAS_ISO_CHARS;
			}
		}
		if (word.length < MIN_WORD_LENGTH) {
			s |= MASK_WORD_TOO_SMALL;
		}
		return s;
	}
	
	function getStepIndex(stepName) {
		for (var i = 0; i < lists.flow.length; ++i) {
			if (lists.flow[i].stepName == stepName) return i;
		}
		return -1;
	}
	
	function applyRulesToWord(word) {
		// get the index of the first step in the sequence table
		var i = 0;
		// Get the step index for this step (step 0)
		// The 'step index' is the index of a step in the steps array in memory,
		// based in its name
		var step = lists.steps[lists.flow[i].stepName];
		while (true) {
			// Apply the step rule to word
			var result = applyRule(step, word);
			var stepBool = 'stepFalse';
			if (result.ruleApplied) {
				stepBool = 'stepTrue';
				word = result.word;
			}
			if (lists.flow[i][stepBool]) {
				// Gets the next step to be applied
				var stepBool = lists.flow[i][stepBool];
				step = lists.steps[stepBool];
				i = getStepIndex(stepBool);
			} else { // There´s no next step. Signal to end loop
				return word;
			}
		}
	}
	
	function applyRule(step, word) {
		// Tests conditions: minimun word length and end strings
		if (step.minWordSize) {
			if (word.length < step.minWordSize) {
				return {ruleApplied: false}; // Word doesn´t have the minimun length
			}
		}

		if (step.wordEndings.length > 0) {
			var check = false;
			for (var i = 0; i < step.wordEndings.length; ++i) {
				if (StringUtils.endsWith(word, step.wordEndings[i])) {
					check = true;
					break;
				}
			}
			if (!check) {
				return {ruleApplied: false}; // Doesn´t end in any of strings required
			}
		}

		for (var i = 0; i < step.rules.length; ++i) {
			var result = stripSuffix(word, step.compareEntireWord, step.rules[i]);
			if (result.ruleApplied) {
				return result;
			}
		}
		return {ruleApplied: false};
	}

	function isException(word, compareEntireWord, exceptions) {
		if (!exceptions) return false;
		var compareFunction = compareEntireWord ? function(a, b) { return a == b; } : StringUtils.endsWith;
		for (var i = 0; i < exceptions.length; ++i) {
			if (compareFunction(word, exceptions[i])) {
				return true;
			}
		}
		return false;
	}

	function stripSuffix(word, compareEntireWord, rule) {
		var newLen = word.length - rule.suffix.length;
		if (rule.minStemSize && newLen < rule.minStemSize) {
			return {ruleApplied: false};
		}
		if (!StringUtils.endsWith(word, rule.suffix)) {
			return {ruleApplied: false};
		}
		if (isException(word, compareEntireWord, rule.exceptions)) {
			return {ruleApplied: false};
		}
		word = word.substr(0, newLen);
		if (rule.replacement) {
			word += rule.replacement;
		}
		return {ruleApplied: true, word: word};
	}

	
	return {
		load: function(config) {
			// Load default values
			flags.processStemming = true; // Do the stemming (will be disabled in case of error loading the steps)
			flags.replaceISOChars = true; // Yes, replace characters with accents	
			flags.useStemDictionary = false; // Don't use dictionary for stems	
			flags.useNamedEntitiesDictionary = false; // No, don't use named entities
			
			lists.steps = defaultSteps;
			lists.namedEntities = null;
			lists.flow = defaultFlow;
			
			if (config) {
				for (var i in flags) {
					if (i in config) flags[i] = config[i];
				}
				for (var i in lists) {
					if (i in config) lists[i] = config[i];
				}
			}
			
			if (flags.useNamedEntitiesDictionary && lists.namedEntities) {
				lists.namedEntities = ArrayUtils.arrayToObject(lists.namedEntities);
			}
		},
		processWord: function(word) {		
			var wordStatus = getWordStatus(word);
			word = word.toLowerCase();
			
			if (wordStatus & MASK_WORD_HAS_DIGITS) { // Do the stemming only if the word doesn't contain numbers
				return word;
			}
			
			function checkAndReplaceISOChars() {
				if (flags.replaceISOChars && wordStatus & MASK_WORD_HAS_ISO_CHARS) {
					word = StringUtils.removeAccents(word);
				}
			}
			
			if (wordStatus & MASK_WORD_TOO_SMALL) { // word too small to be stemmed
				checkAndReplaceISOChars();
				return word;
			}

			// If word starts with capital letter and we're using named entities dictionary, check
			// if it wasn't a name
			if (flags.useNamedEntitiesDictionary && wordStatus & MASK_WORD_STARTS_WITH_CAPITAL_LETTER) {
				if (word in lists.namedEntities) {
					checkAndReplaceISOChars();
					return word;
				}
			}

			// Before process a word, check if it already exists in dictionary
			if (flags.useStemDictionary) {
				if (word in stemDictionary) {
					return stemDictionary[word];
				} else { // Word not found in dictionary
					var originalWord = word;
					// Process word and then add it to the dictionary
					if (flags.processStemming) {
						word = applyRulesToWord(word);
					}
					checkAndReplaceISOChars();
					stemDictionary[originalWord] = word;
					return word;
				}
			} else {
				// Not using dictionary
				if (flags.processStemming) {
					word = applyRulesToWord(word);
				}
				checkAndReplaceISOChars();
				return word;
			}
		}
	};

})();


var stemmer = com.heraldocarneiro.bonner.RSLPStemmer;
stemmer.load({
	useStemDictionary: true,
	/*flow: [
		{stepName: 'Plural', stepTrue: 'Verb', stepFalse: 'Verb'},
		{stepName: 'Verb', stepTrue: null, stepFalse: null}
	]*/
	flow: [
		{stepName: 'Plural', stepTrue: null, stepFalse: null}
	]
});
var text = prompt('Text:');
if (text) {
	var words = text.split(' ');
	for (var i = 0; i < words.length; ++i) {
		words[i] = stemmer.processWord(words[i]);
	}
	print(words.join(' '));
}