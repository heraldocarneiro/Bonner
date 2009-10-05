if (!com) var com = {};
if (!com.heraldocarneiro) com.heraldocarneiro = {};
if (!com.heraldocarneiro.bonner) com.heraldocarneiro.bonner = {};


com.heraldocarneiro.bonner.MainWindow = (function() {

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

return {
	onLoad: function(event) {
		log('Bonner load');
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
						if (typeof(cluster2) == 'undefined') alert(id2 + ' = ' + items[id2]);
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
	onStopUpdateButtonClick: function(event) {
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
			alert('chegou!');
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
		  alert(data);
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