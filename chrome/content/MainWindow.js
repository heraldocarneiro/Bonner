if (!com) var com = {};
if (!com.heraldocarneiro) com.heraldocarneiro = {};
if (!com.heraldocarneiro.bonner) com.heraldocarneiro.bonner = {};


com.heraldocarneiro.bonner.MainWindow = function() {

return {
	onLoad: function(event) {
		//alert('load');
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
		var file = Components.classes["@mozilla.org/file/directory_service;1"]  
				.getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);  
		file.append("bonner.sqlite");
		var storageService = Components.classes["@mozilla.org/storage/service;1"]  
				.getService(Components.interfaces.mozIStorageService);  
		var conn = storageService.openUnsharedDatabase(file);
		var statement = conn.createStatement("INSERT INTO feed (link) VALUES (:link)");
		statement.params.link = feedURL;
		statement.execute();
		conn.close();
	},
	onUpdateButtonClick: function(event) {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]  
				.getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);  
		file.append("bonner.sqlite");
		var storageService = Components.classes["@mozilla.org/storage/service;1"]  
				.getService(Components.interfaces.mozIStorageService);  
		var conn = storageService.openUnsharedDatabase(file);
		var statement = conn.createStatement("SELECT id, link FROM feed");
		try {
			while (statement.executeStep()) {
				this.fetchFeed(statement.row.id, statement.row.link);
			}
		} finally {
			statement.reset();
		}
		conn.close();
	},
	onIndexButtonClick: function(event) {
		alert('index begin');
		var file = Components.classes["@mozilla.org/file/directory_service;1"]  
				.getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);  
		file.append("bonner.sqlite");
		var storageService = Components.classes["@mozilla.org/storage/service;1"]  
				.getService(Components.interfaces.mozIStorageService);  
		var conn = storageService.openUnsharedDatabase(file);
		var statement = conn.createStatement("SELECT id, title, link, content FROM item");
		try {
			var stSelectWord = conn.createStatement("SELECT id FROM word WHERE string = :word");
			var stUpdateWord = conn.createStatement("UPDATE word SET item_count = item_count + 1 WHERE id = :id");
			var stInsertWord = conn.createStatement("INSERT OR IGNORE INTO word (string, item_count) VALUES (:word, :item_count)");
			var stInsertItemWord = conn.createStatement("INSERT OR IGNORE INTO item_word (item_id, word_id, word_count) VALUES (:item_id, :word_id, :word_count)");
			var stInsertItemStats = conn.createStatement("INSERT OR IGNORE INTO item_stats (item_id, word_count) VALUES (:item_id, :word_count)");
			conn.beginTransaction();
			while (statement.executeStep()) {
				var id = statement.row.id;
				var title = statement.row.title;
				var content = statement.row.content;
				var text = title + ' ' + content;
				text = text.replace(/[\.\,\;\:\?\!\'\"\r\n\(\)]/gi, ' ').replace(/\s+/gi, ' ').replace(/(^\s+|\s+$)/gi, '').toLowerCase();
				var words = text.split(/\s+/gi);
				var word_counts = {};
				var word_count = 0;
				for (var i = 0; i < words.length; ++i) {
					var word = words[i];
					if (word_counts[word]) word_counts[word] += 1;
					else word_counts[word] = 1;
					++word_count;
				}
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
					stInsertItemStats.params.item_id = id;
					stInsertItemStats.params.word_count = word_count;
					stInsertItemStats.execute();
				}
			}
		} catch (e) {
			alert(e);
			conn.rollbackTransaction();
			throw e;
		} finally {
			statement.reset();
			conn.commitTransaction();
			//conn.close();
		}
		alert('index end');
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
				var statement = conn.createStatement("INSERT OR IGNORE INTO item (title, link, content, published) VALUES (:title, :link, :content, :published)");
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

}();