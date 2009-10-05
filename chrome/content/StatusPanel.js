if (!com) var com = {};
if (!com.heraldocarneiro) com.heraldocarneiro = {};
if (!com.heraldocarneiro.bonner) com.heraldocarneiro.bonner = {};


com.heraldocarneiro.bonner.StatusPanel = function() {

function openAndReuseOneTabPerURL(url) {
	var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
	var browserEnum = wm.getEnumerator('navigator:browser');
	// Check each browser instance for our URL
	var found = false;
	while (!found && browserEnum.hasMoreElements()) {
		var browserWin = browserEnum.getNext();
		var tabbrowser = browserWin.getBrowser();
		// Check each tab of this browser instance
		var numTabs = tabbrowser.browsers.length;
		for (var i = 0; i < numTabs; ++i) {
			var currentBrowser = tabbrowser.getBrowserAtIndex(i);
			if (url == currentBrowser.currentURI.spec) {
				// The URL is already opened. Select this tab.
				tabbrowser.selectedTab = tabbrowser.mTabs[i];
				// Focus *this* browser-window
				browserWin.focus();
				found = true;
				break;
			}
		}
	}
	// Our URL isn't open. Open it now.
	if (!found) {
		var recentWindow = wm.getMostRecentWindow('navigator:browser');
		if (recentWindow) {
			// Use an existing browser window
			recentWindow.delayedOpenTab(url, null, null, null, null);
		} else {
			// No browser windows are open, so open a new one.
			window.open(url);
		}
	}
}


return {
	handleEvent: function(evt) {
		if (evt.type == 'load') this.onLoad(evt);
	},
	onClick: function(event) {
		openAndReuseOneTabPerURL('chrome://bonner/content/bonner.xul');
	},
	onLoad: function(event) {
		var prefs = Components.classes['@mozilla.org/preferences-service;1']
				.getService(Ci.nsIPrefService).getBranch('extensions.bonner.').QueryInterface(Ci.nsIPrefBranch2);
		var firstRun = prefs.getBoolPref('firstRun');
		if (firstRun) {
			prefs.setBoolPref('firstRun', false);
			this.createSchema();
		}
	},
	createSchema: function() {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]  
				.getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);  
		file.append("bonner.sqlite");
		var isNew = !file.exists();
		//if (!isNew) return;
		var storageService = Components.classes["@mozilla.org/storage/service;1"]  
				.getService(Components.interfaces.mozIStorageService);  
		var conn = storageService.openUnsharedDatabase(file);
		conn.executeSimpleSQL('CREATE TABLE IF NOT EXISTS feed ('
				+ 'id INTEGER PRIMARY KEY AUTOINCREMENT, '
				+  'title TEXT, link TEXT UNIQUE, description TEXT, updated INTEGER'
				+ ')');
		conn.executeSimpleSQL('CREATE TABLE IF NOT EXISTS item ('
				+ 'id INTEGER PRIMARY KEY AUTOINCREMENT, '
				+  'title TEXT, link TEXT UNIQUE, content TEXT, published INTEGER'
				+ ')');
		conn.executeSimpleSQL('CREATE TABLE IF NOT EXISTS cluster ('
				+ 'id INTEGER PRIMARY KEY AUTOINCREMENT, '
				+  'best_item_id INTEGER'
				+ ')');
		conn.executeSimpleSQL('CREATE TABLE IF NOT EXISTS cluster_item ('
				+ 'cluster_id INTEGER, item_id INTEGER'
				+ ')');
		conn.executeSimpleSQL('CREATE TABLE IF NOT EXISTS word ('
				+ 'id INTEGER PRIMARY KEY AUTOINCREMENT, '
				+ 'string TEXT UNIQUE, item_count INTEGER DEFAULT 0'
				+ ')');
		conn.executeSimpleSQL('CREATE TABLE IF NOT EXISTS item_word ('
				+ 'item_id INTEGER, word_id INTEGER, word_count INTEGER DEFAULT 0'
				+ ')');
		conn.executeSimpleSQL('CREATE TABLE IF NOT EXISTS item_stats ('
				+ 'item_id INTEGER, word_count INTEGER DEFAULT 0'
				+ ')');
		conn.executeSimpleSQL('CREATE TABLE IF NOT EXISTS pair ('
				+ 'item1_id INTEGER, item2_id INTEGER, cosine REAL DEFAULT 0.0'
				+ ')');
		conn.close();
	}
};

}();

// talvez um objeto bonner deve-se cuidar disso
window.addEventListener('load', com.heraldocarneiro.bonner.StatusPanel, false);