if (!com) var com = {};
if (!com.heraldocarneiro) com.heraldocarneiro = {};
if (!com.heraldocarneiro.bonner) com.heraldocarneiro.bonner = {};


com.heraldocarneiro.bonner.LanguageDetector = (function() {

var LangStat = function() {
	this.bigrams = {};
	this.count = 0;
	this.fromText = function(text) {
		text = ' ' + text.toLowerCase() + ' ';
		text = text.replace(/[^a-zA-Z\u007f-\uffff]/gi, ' ').replace(/\s+/gi, ' ');
		for (var i = 1; i < text.length; ++i) {
			var bigram = text.charAt(i - 1) + text.charAt(i);
			if (this.bigrams[bigram]) ++this.bigrams[bigram];
			else this.bigrams[bigram] = 1;
			++this.count;
		}
	};
	this.fromExtensionFile = function(fileName) {
		var guid = 'bonner@heraldocarneiro.com';
		var em = Components.classes["@mozilla.org/extensions/manager;1"]
			.getService(Components.interfaces.nsIExtensionManager);
		var file = em.getInstallLocation(guid).getItemFile(guid, fileName);
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
			.createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(file, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);
		var line = {}, hasMore;		
		do {
			hasMore = istream.readLine(line);
			this.fromText(line.value);
		} while (hasMore);		
		istream.close();
	};
	this.euclideanDistance = function(langStat, msg) {
		var sum = 0;
		for (var i in this.bigrams) {
			if (langStat.bigrams[i]) {
				var a = this.bigrams[i] / this.count;
				var b = langStat.bigrams[i] / langStat.count;
				if (msg) alert(i + ': a = ' + a + ', b = ' + b + ', ' + langStat.bigrams[i]);
				sum += Math.pow(Math.abs(a - b), 2);
			} else {
				if (msg) alert(i + ': a = ' + this.bigrams[i] / this.count);
				sum += Math.pow(this.bigrams[i] / this.count, 2);
			}
		}
		return Math.sqrt(sum);
	};
};

var langStats = {};
langStats['en'] = new LangStat();
langStats['en'].fromExtensionFile('en.txt');
langStats['pt'] = new LangStat();
langStats['pt'].fromExtensionFile('pt.txt');

return {
	detectLanguage: function() {
		var text = prompt('Text:');
		if (!text) return;
		var ls = new LangStat();
		ls.fromText(text);
		var distEn = ls.euclideanDistance(langStats['en'], false);
		var distPt = ls.euclideanDistance(langStats['pt'], false);
		alert('dist en = ' + distEn + ', pt = ' + distPt);
		if (distEn < distPt) alert('en');
		else if (distEn > distPt) alert('pt');
		else alert('tie!');
	}
};

})();