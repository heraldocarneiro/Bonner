if (!com) var com = {};
if (!com.heraldocarneiro) com.heraldocarneiro = {};
if (!com.heraldocarneiro.bonner) com.heraldocarneiro.bonner = {};


com.heraldocarneiro.bonner.MainWindow = (function() {

const TEMPLATE_URL = 'resource://bonner-content/feedview-template.html';

function log(aMessage) {
  var consoleService = Cc['@mozilla.org/consoleservice;1'].
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
		log('update end');
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
					word = com.heraldocarneiro.bonner.RSLPStemmer.processWord(word);
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
						var num = i * items.length + j;
						var den = items.length * items.length + items.length;
						setProgress('Computing cosine similarities... ' + num + '/' + den, 100 * num / den);
						setTimeout(arguments.callee, 0);
					} else {
						++i;
						var num = i * items.length + j;
						var den = items.length * items.length + items.length;
						setProgress('Computing cosine similarities... ' + num + '/' + den, 100 * num / den);
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
			alert('erro' + e);
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
			var statement = conn.createStatement("UPDATE feed SET title = :title, description = :description, updated = :updated WHERE id = :id");
			statement.params.id = feedID;
			log(feed.title.text);
			statement.params.title = feed.title.text;
			statement.params.description = feed.subtitle.text;
			statement.params.updated = feed.updated;
			log('before execute');
			try {
				statement.execute();
			} catch (e) {
				alert(e);
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
				log('linkContent begin');
				var link = theEntry.link.resolve('');
				var linkContent = this_.getURL(link);
				log('linkContent end');
				var statement = conn.createStatement("INSERT OR IGNORE INTO item (feed_id, title, link, content, published, link_content) VALUES (:feed_id, :title, :link, :content, :published, :link_content)");
				statement.params.feed_id = feedID;
				statement.params.title = theEntry.title.text;
				statement.params.link = link;
				statement.params.content = theEntry.summary ? theEntry.summary.text : theEntry.content.text;
				statement.params.link_content = linkContent;
				statement.params.published = theEntry.published;
				try {
					statement.execute();
				} catch (e) {
					erros += conn.lastErrorString + '\r\n';
				}
			}
			log(feedURL + ' - handleResult end.');
			if (erros != '') alert(erros);
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
			  alert("Error parsing feed.");
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
		  alert(e);
		}

	}
};

})();