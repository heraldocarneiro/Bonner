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
		var file = Components.classes["@mozilla.org/file/directory_service;1"]  
		.getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);  
file.append("bonner.sqlite");
var storageService = Components.classes["@mozilla.org/storage/service;1"]  
		.getService(Components.interfaces.mozIStorageService);  
var conn = storageService.openUnsharedDatabase(file);

		var startTime = new Date().getTime();
		setProgress('Checking feeds for updates...', 0);
		var statement = conn.createStatement("SELECT id, link FROM feed");
		while (statement.executeStep()) {
			this.fetchFeed(statement.row.id, statement.row.link);
		}
		statement.reset();
		var duration = (new Date().getTime() - startTime) / 1000;
		setProgress('Checking feeds for updates... done in ' + duration + ' secs.', 100);
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
		var stSelectItem = conn.createStatement("SELECT id, title, link, content FROM item");
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
				var text = title + ' ' + content;
				text = text.replace(/\<[^\>]*\>/gi, '').replace(/[\.\,\;\:\?\!\'\"\r\n\(\)]/gi, ' ')
						.replace(/\s+/gi, ' ').replace(/(^\s+|\s+$)/gi, '').toLowerCase();
				var words = text.split(/\s+/gi);
				var word_counts = {};
				var word_count = 0;
				for (var i = 0; i < words.length; ++i) {
					var word = words[i];
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
			'SELECT i.feed_id, f.title AS feed_title, i.id, i.title, i.content, i.published '
			+ 'FROM cluster_item AS ci '
			+ 'INNER JOIN item AS i ON i.id = ci.item_id '
			+ 'INNER JOIN feed AS f ON f.id = i.feed_id '
			+ 'WHERE cluster_id = :cluster_id');
		var div = doc.createElement('div');
		while (stCluster.executeStep()) {
			var cluster = {id: stCluster.row.id, bestItemID: stCluster.row.best_item_id};
			var items = {};
			stClusterItem.params.cluster_id = cluster.id;
			while (stClusterItem.executeStep()) {
				var item = {
					feedID: stClusterItem.row.feed_id,
					feedTitle: stClusterItem.row.feed_title,
					id: stClusterItem.row.id,
					title: stClusterItem.row.title,
					content: stClusterItem.row.content,
					published: stClusterItem.row.published
				};
				items[item.id] = item;
			}
			stClusterItem.reset();
			var html = '<div class="cluster"><p><strong>Notícia:</strong><br/>';
			html += items[cluster.bestItemID].feedID + ' - ' + items[cluster.bestItemID].feedTitle + '<br/>';
			html += '<strong>' + items[cluster.bestItemID].id + ' - ' + items[cluster.bestItemID].title + '</strong><br/>';
			html += '<em>' + items[cluster.bestItemID].published + '</em><br/>';
			html += items[cluster.bestItemID].content + '</p>';
			html += '<hr/><p><strong>Notícias relacionadas da mesma fonte:</strong></p>';
			for (var id in items) {
				if (id == cluster.bestItemID) continue;
				if (items[id].feedID != items[cluster.bestItemID].feedID) continue;
				html += '<p>' + items[id].feedID + ' - ' + items[id].feedTitle + '<br/>';
				html += '<strong>' + items[id].id + ' - ' + items[id].title + '</strong><br/>';
				html += '<em>' + items[id].published + '</em><br/>';
				html += items[id].content + '</p>';
			}
			html += '<hr/><p><strong>Notícias relacionadas de outras fontes:</strong></p>';
			for (var id in items) {
				if (id == cluster.bestItemID) continue;
				if (items[id].feedID == items[cluster.bestItemID].feedID) continue;
				html += '<p>' + items[id].feedID + ' - ' + items[id].feedTitle + '<br/>';
				html += '<strong>' + items[id].id + ' - ' + items[id].title + '</strong><br/>';
				html += '<em>' + items[id].published + '</em><br/>';
				html += items[id].content + '</p>';
			}
			html += '</div>';
			var div = doc.createElement('div');
			div.innerHTML = html;
			container.appendChild(div);
		}
		stCluster.reset();
		conn.commitTransaction();
	},
	onStopUpdateButtonClick: function(event) {
	},
	onGetURLButtonClick: function(event) {
		var url = prompt('URL:');
		if (!url) return;
		var httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", url, true);
		try {
			httpRequest.onload = function() {
				var data = httpRequest.responseText;
				alert(data);
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
				data = data.replace(/\<[^\>]*\/\>/gi, ' ');
				data = data.replace(/\<(\/[^\>\s]*)[^\>]*\>/gi, '<$1>');
				data = data.replace(/\<([^\/][^\>\s]*)[^\>]*\>/gi, '<$1>');
				data = data.replace(/\s+/gi, ' ');
				alert(data);
				var sentences = [];
				var re = /([^\<\>\.\s][^\<\>\.]*\.)(\<|\s)/gi; // problema da "frase com aspas dps do ponto."
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
				for (var i = sentences.length - 1; i >= 0; --i) {
					if (sentences[i].length < 3) sentences.splice(i, 1);
					else sentences.splice(i, 1, sentences[i].join(' '));
				}
				var text = sentences.join(' ');
				alert(text);
			}
			httpRequest.send(null);
		} catch (e) {
			alert(e);
		}
	},
	fetchFeed: function(feedID, feedURL) {
		var httpRequest = null;
		
		var listener = {
		  handleResult: function(result) {
		  var file = Components.classes["@mozilla.org/file/directory_service;1"]  
		.getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);  
file.append("bonner.sqlite");
var storageService = Components.classes["@mozilla.org/storage/service;1"]  
		.getService(Components.interfaces.mozIStorageService);  
var conn = storageService.openUnsharedDatabase(file);

			var feed = result.doc;
			feed.QueryInterface(Components.interfaces.nsIFeed);
			var statement = conn.createStatement("UPDATE feed SET title = :title, description = :description, updated = :updated WHERE id = :id");
			statement.params.id = feedID;
			alert(feed.title.text);
			statement.params.title = feed.title.text;
			statement.params.description = feed.subtitle.text;
			statement.params.updated = feed.updated;
			statement.execute();
			var itemArray = feed.items;
			var numItems = itemArray.length;
			var theEntry;
			var erros = '';
			for (var i=0; i<numItems; i++) {
				theEntry = itemArray.queryElementAt(i, Components.interfaces.nsIFeedEntry);
				if (!theEntry) continue;
				var statement = conn.createStatement("INSERT OR IGNORE INTO item (feed_id, title, link, content, published) VALUES (:feed_id, :title, :link, :content, :published)");
				statement.params.feed_id = feedID;
				statement.params.title = theEntry.title.text;
				statement.params.link = theEntry.link.resolve('');
				statement.params.content = theEntry.summary ? theEntry.summary.text : theEntry.content.text;
				statement.params.published = theEntry.published;
				try {
					statement.execute();
				} catch (e) {
					erros += conn.lastErrorString + '\r\n';
				}
			}
			if (erros != '') alert(erros);
			conn.close();
		  }
		};
		
		function infoReceived() {
		  var data = httpRequest.responseText;
		  var ioService = Components.classes['@mozilla.org/network/io-service;1']
											 .getService(Components.interfaces.nsIIOService);
		  var uri = ioService.newURI(feedURL, null, null);
		  if (data.length) {
			var parser = Components.classes["@mozilla.org/feed-processor;1"]
											.createInstance(Components.interfaces.nsIFeedProcessor);
			try {
			  parser.listener = listener;
			  parser.parseFromString(data, uri);
			} catch(e) {
			  alert("Error parsing feed.");
			}
		  }
		}
		
		httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", feedURL, true);
		try {
		  httpRequest.onload = infoReceived;
		  httpRequest.send(null);
		} catch(e) {
		  alert(e);
		}

	}
};

})();