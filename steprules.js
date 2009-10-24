	
var steps = [
	{
		name: "Plural",
		minWordSize: 3,
		compareEntireWord: 1,
		wordEndings: ['s'],
		rules: [
			{suffix: 'ns', minStemSize: 1, replacement: 'm'},
			{suffix: 'ões', minStemSize: 3, replacement: 'ão'},
			{suffix: 'ães', minStemSize: 1, replacement: 'ão', exceptions: ['mãe']},
			{suffix: 'ais', minStemSize: 1, replacement: 'al', exceptions: ['cais', 'mais']},
			{suffix: 'éis', minStemSize: 2, replacement: 'el'},
			{suffix: 'eis', minStemSize: 2, replacement: 'el'},
			{suffix: 'óis', minStemSize: 2, replacement: 'ol'},
			{suffix: 'is', minStemSize: 2, replacement: 'il', exceptions: ['lápis', 'cais', 'mais', 'crúcis', 'bíquinis', 'pois', 'depois', dois', 'leis']},
			{suffix: 'les', minStemSize: 3, replacement: 'l'},
			{suffix: 'res', minStemSize: 3, replacement: 'r'},
			{suffix: 'is', minStemSize: 2, replacement: 'il', exceptions: ['lápis', 'cais', 'mais', 'crúcis', 'bíquinis', 'pois', 'depois', dois', 'leis']}
		]
	},
	{
		name: "Feminine",
		minWordSize: 3,
		compareEntireWord: 1,
		wordEndings: ['a', 'ã'],
		rules: [
			{suffix: 'ona', minStemSize: 3, replacement: 'ão', exceptions: ['abandona', 'lona', 'iona', 'cortisona', 'monótona', 'maratona', 'acetona', 'detona', 'carona']},
			{suffix: 'ora', minStemSize: 3, replacement: 'or'},
			{suffix: 'na', minStemSize: 4, replacement: 'no', exceptions: ['carona', 'abandona', 'lona', 'iona', 'cortisona', 'monótona', 'maratona', 'acetona', 'detona', 'guiana', 'campana', 'grana', 'caravana', 'banana', 'paisana']},
			{suffix: 'inha', minStemSize: 3, replacement: 'inho', exceptions: ["rainha","linha","minha"]},
			{suffix: 'esa', minStemSize: 3, replacement: 'ês', exceptions: ["mesa","obesa","princesa","turquesa","ilesa","pesa","presa"]},
			{suffix: 'osa', minStemSize: 3, replacement: 'oso', exceptions: ["mucosa","prosa"]},
			{suffix: 'íaca', minStemSize: 3, replacement: 'íaco'},
			{suffix: 'ica', minStemSize: 3, replacement: 'ico', exceptions: ['dica']},
			{suffix: 'ada', minStemSize: 2, replacement: 'ado', exceptions: ['pitada']},
			{suffix: 'ida', minStemSize: 3, replacement: 'ido', exceptions: ['vida']},
			{suffix: 'ída', minStemSize: 3, replacement: 'ido', exceptions: ["recaída","saída","dúvida"]},
			{suffix: 'ima', minStemSize: 3, replacement: 'imo', exceptions: ['vítima']},
			{suffix: 'iva', minStemSize: 3, replacement: 'ivo', exceptions: ['"saliva","oliva"']},
			{suffix: 'eira', minStemSize: 3, replacement: 'eiro', exceptions: ["beira","cadeira","frigideira","bandeira","feira","capoeira","barreira","fronteira","besteira","poeira"]},
			{suffix: 'ã', minStemSize: 2, replacement: 'ão', exceptions: ["amanhã","arapuã","fã","divã"]},
		]
	},
	{
		name: "Adverb",
		minWordSize: 0,
		compareEntireWord: 0,
		wordEndings: [],
		rules: [
			{suffix: 'mente', minStemSize: 4, replacement: '', exceptions: ['experimente']}
		]
	}
];
