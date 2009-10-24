	
var steps = [
	{
		name: "Plural",
		minWordSize: 3,
		compareEntireWord: 1,
		wordEndings: ['s'],
		rules: [
			{suffix: 'ns', minStemSize: 1, replacement: 'm'},
			{suffix: '�es', minStemSize: 3, replacement: '�o'},
			{suffix: '�es', minStemSize: 1, replacement: '�o', exceptions: ['m�e']},
			{suffix: 'ais', minStemSize: 1, replacement: 'al', exceptions: ['cais', 'mais']},
			{suffix: '�is', minStemSize: 2, replacement: 'el'},
			{suffix: 'eis', minStemSize: 2, replacement: 'el'},
			{suffix: '�is', minStemSize: 2, replacement: 'ol'},
			{suffix: 'is', minStemSize: 2, replacement: 'il', exceptions: ['l�pis', 'cais', 'mais', 'cr�cis', 'b�quinis', 'pois', 'depois', dois', 'leis']},
			{suffix: 'les', minStemSize: 3, replacement: 'l'},
			{suffix: 'res', minStemSize: 3, replacement: 'r'},
			{suffix: 'is', minStemSize: 2, replacement: 'il', exceptions: ['l�pis', 'cais', 'mais', 'cr�cis', 'b�quinis', 'pois', 'depois', dois', 'leis']}
		]
	},
	{
		name: "Feminine",
		minWordSize: 3,
		compareEntireWord: 1,
		wordEndings: ['a', '�'],
		rules: [
			{suffix: 'ona', minStemSize: 3, replacement: '�o', exceptions: ['abandona', 'lona', 'iona', 'cortisona', 'mon�tona', 'maratona', 'acetona', 'detona', 'carona']},
			{suffix: 'ora', minStemSize: 3, replacement: 'or'},
			{suffix: 'na', minStemSize: 4, replacement: 'no', exceptions: ['carona', 'abandona', 'lona', 'iona', 'cortisona', 'mon�tona', 'maratona', 'acetona', 'detona', 'guiana', 'campana', 'grana', 'caravana', 'banana', 'paisana']},
			{suffix: 'inha', minStemSize: 3, replacement: 'inho', exceptions: ["rainha","linha","minha"]},
			{suffix: 'esa', minStemSize: 3, replacement: '�s', exceptions: ["mesa","obesa","princesa","turquesa","ilesa","pesa","presa"]},
			{suffix: 'osa', minStemSize: 3, replacement: 'oso', exceptions: ["mucosa","prosa"]},
			{suffix: '�aca', minStemSize: 3, replacement: '�aco'},
			{suffix: 'ica', minStemSize: 3, replacement: 'ico', exceptions: ['dica']},
			{suffix: 'ada', minStemSize: 2, replacement: 'ado', exceptions: ['pitada']},
			{suffix: 'ida', minStemSize: 3, replacement: 'ido', exceptions: ['vida']},
			{suffix: '�da', minStemSize: 3, replacement: 'ido', exceptions: ["reca�da","sa�da","d�vida"]},
			{suffix: 'ima', minStemSize: 3, replacement: 'imo', exceptions: ['v�tima']},
			{suffix: 'iva', minStemSize: 3, replacement: 'ivo', exceptions: ['"saliva","oliva"']},
			{suffix: 'eira', minStemSize: 3, replacement: 'eiro', exceptions: ["beira","cadeira","frigideira","bandeira","feira","capoeira","barreira","fronteira","besteira","poeira"]},
			{suffix: '�', minStemSize: 2, replacement: '�o', exceptions: ["amanh�","arapu�","f�","div�"]},
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
