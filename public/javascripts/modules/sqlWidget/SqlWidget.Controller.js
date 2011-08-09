/*
 * Class controls the process of creation new
 * window with autocompolete-feature
 */
Dbms.SqlWidget.Controller = Ext.extend(function(){}, {
	constructor : function() {
		this.items = new Ext.util.MixedCollection;
		//this.window = controller;
		//this.attachAutocomplete(id);
		//this.textarea = Ext.get(id);
		//this.textarea.on('click', this.onClickEventHandler,this);
		// this event fires when user clicks on Tree Sql-icon in database node
		Dbms.Core.MessageBus.on('Dbms.Database.Tree.TopToolbar.ExecSql', this.factory, this);
	},
	generateUniqueId : function() {
		return Ext.id(false, 'sql-');
    },
	attachAutocomplete : function(id) {
	    this.autocomplete = new Dbms.Autocomplete.Controller(id, this.getBaseDictionary());
		this.autocomplete.wnd = this.window;
	},
	factory : function(config) {
		config.uniqueId = this.generateUniqueId();
		Dbms.Core.MessageBus.on('Dbms.SqlWidget.ExecQuery_'+config.uniqueId, this.request, this);
		this.items.add(config.uniqueId, Dbms.SqlWidget.Factory.factory(config));
		new Dbms.Autocomplete.Controller(config.uniqueId, config.dbName);
	},
	request : function(config) {
		var query = config.query;
		// make ajax-call to receive data
		// depends on result, create a store and view
		Ext.Ajax.request({
			url    : Dbms.Actions.sql.execute + config.dbName,
			method : "POST",
			params : {
			   query : query
			},
			success : this.onSuccess(config),
			failure : this.onFailure(config),
			scope   : this
		});
	},
	onFailure : function(config) {
		return function() {
			Ext.ux.Toast.msg('Error', "Error occured while executing sql-statement: <br/>\"" + config.query + "\"");
		}
	},
	onSuccess : function(config) {
		config; var me = this;
		return function(response) {
			var json = Ext.decode(response.responseText, true);
		 
			if(json.success === false) {
				Ext.ux.Toast.msg('Error', json.msg);
				return ;
			}
		 
			var store = Dbms.SqlWidget.Factory.storeBuilder.build({
			   response : json,
			   uniqueId : config.uniqueId,
			   dbName   : config.dbName
			});
			   
			Dbms.SqlWidget.Factory.gridPanelBuilder.getGridPanel({
				store    : store,
				uniqueId : config.uniqueId,
				json     : json
			});
			
			Ext.ux.Toast.msg('Success', "SQL-Query was performed");
		}
	},
	/**
	 * remove default text
	*/
	onClickEventHandler : function(e){
		if(this.window.isDefault) {
			this.textarea.dom.removeChild(this.textarea.dom.childNodes[0]); //remove default text
			this.window.isDefault = false;
			
			var selection = window.getSelection();
			var range = document.createRange();
			//create new autocomplete-context element
			var context = this.autocomplete.createNewContextElement();
			this.autocomplete.firstContextNode = context;
			
			this.autocomplete.createNewContentElement();
			this.autocomplete.contentElement.innerHTML = '\n';
			this.autocomplete.element.dom.innerHTML = '<p>'+this.autocomplete.element.dom.innerHTML+'</p>';
			range.selectNodeContents(this.autocomplete.element.dom.childNodes[0].childNodes[1]);
			range.setStart(this.autocomplete.element.dom.childNodes[0].childNodes[1], 0);
			range.setEnd(this.autocomplete.element.dom.childNodes[0].childNodes[1], 0);
			this.autocomplete.undelitedLength = this.autocomplete.element.dom.innerHTML.length;
			
			this.autocomplete.startLeftOffset = Ext.get(context).getX();
			
			selection.removeAllRanges();
			selection.addRange(range);
			window.f = this.autocomplete;
			this.autocomplete.isNew = false;
		}
	},
	processKeyPress : function(e){
		switch(e.keyCode){
			//tab
			case 9:{
				e.preventDefault();
				this.word = false;
				var sel = window.getSelection();
				var startIdx = sel.focusOffset;
				
				document.execCommand('insertHtml',false,'\t');
				//document.execCommand('insertHtml',false,'<span class="'+this.currentRow+'"></span>');
				this.newWord = true;
				break;
			}
			//enter
			case 13:{
				e.preventDefault();
				this.word = false;
				this.currentRow++;
				
				document.execCommand('insertHtml',false,"\n\n");
				//document.execCommand('insertHtml',false,'<span class="'+this.currentRow+'"></span>');
				this.newWord = true;
			}
			case 8 : {
				this.newWord = false;
				this.n.data = this.n.data.substr(0,this.n.data.length-1);
				break;
			}
			//whitespace
			case 32 : {
				e.preventDefault();
				this.word = false;
				document.execCommand('insertHtml',false,' ');
				this.newWord = true;
//				break;
			}

			//any other key
			default : {
				e.preventDefault();
				var fixBug = e.shiftKey ? 0 : 32;
				//document.execCommand('insertHtml',false,'<span class="'+this.currentRow+'"></span>');
				
				//document.execCommand('insertHtml',false,String.fromCharCode(e.keyCode+fixBug));
				if(this.newWord){
					this.lastId = Ext.id();
					this.textarea.dom.innerHTML += '<span class="'+this.currentRow+'" id="'+this.lastId+'"></span>';
					this.wordStart = this.textarea.dom.innerHTML.length;
					this.n = document.createTextNode(String.fromCharCode(e.keyCode+fixBug));
					this.textarea.dom.appendChild(this.n);
					this.newWord = false;
				} else {
					this.n.data += String.fromCharCode(e.keyCode+fixBug);
				}
				var sel = window.getSelection();
				var startIdx = sel.focusOffset;
				var range = document.createRange();
					range.selectNode(this.n.parentNode);
					range.setStart(this.n,startIdx+1);
					range.setEnd(this.n,startIdx+1);
					sel.removeAllRanges();
					sel.addRange(range);
				//console.log(this.textarea.dom.innerHTML);
				//if(Ext.get(this.appendItemId)){
				//	Ext.get(this.appendItemId).remove();
				//}
				//if(Ext.get('complete')){
				//	Ext.get('complete').remove();
				//}
				
				//var sel = window.getSelection();
				//var startIdx = sel.focusOffset;
				////get positon of the word
				//var parts = this.textarea.dom.innerHTML.split('\n');
				
				//var currentLine = parts[this.currentRow]+String.fromCharCode(e.keyCode+fixBug);
				////get the start position of typing word
				//
				//for(var i=startIdx,j=0;i>0 && currentLine[i] != ' ';i--){}
				//this.currentFullLine = currentLine;
				//currentLine = currentLine.substr(i).replace(/^\s\s*/, '').replace(/\s\s*$/, '').replace('<br>','');
				var currentLine = this.textarea.dom.innerHTML.substr(this.wordStart);
				this.complete(currentLine);
			}
			//console.log(this.textarea.dom.innerHTML);
		}
		console.log(this.textarea.dom.innerHTML);
		return true;
	},
	/**
	 * function returns columns in a format specified
	 * by sql pattern
	*/
	getColumns : function(pattern,type){
		switch (type){
			case 'select' : 
			case 'insert' : {
				var columns = '';
				
				this.wc.store.fields.each(function(item,idx){
					var comma = idx==0?'':',';
					columns += comma+'`'+item.name+'` ';
				},this);
				break;
			}
			default : {
				var columns = '';
				
				this.wc.store.fields.each(function(item,idx){
					var joiner = type=='update'?', ':" AND ";
					columns += '`'+item.name+'`="?"'+joiner;
				},this);
				columns = columns.substring(0,columns.length-(type=='update'?2:5));
				break;
			}
		}
		
		return pattern.replace('<qColumns>',columns);
	},
	/**
	 * autocomplete
	*/
	complete : function(word){
		var wordLen = word.length;
		if(wordLen <= 1){
			return;
		}
		var hide = true;
		var children = this.suguestDiv.childNodes;
		var childrenSize = children.length;
		for(var i=childrenSize-1;i>=0;i--){
			this.suguestDiv.removeChild(children[i]);
		}
		
		for(var i=0;i<this.keywords.length;i++){
			var dictItem = this.keywords[i];
			//word fineded
			if(dictItem.substr(0,wordLen).indexOf(word)!=-1){
				hide = false;
				var suggestion = document.createElement('div');
				suggestion.innerHTML = dictItem;
				
				this.suguestDiv.style.left = Ext.get(Ext.select('#'+this.lastId).elements[0]).getX();
				this.suguestDiv.style.top = this.textarea.getY()+15;
				this.suguestDiv.appendChild(suggestion);
			}
		}
		if(hide){
			for(var i=0;i<children.length;i++){
				this.suguestDiv.removeChild(children[i]);
			}
			this.suguestDiv.style.display = 'none';
		} else {
			this.suguestDiv.style.display = 'block';
		}
	},
	sqlSelected : function(sqlPattern,type) {
		//var pattern = sqlPattern.replace('<databaseName>','`'+this.databaseName+'`');;			
		//pattern = pattern.replace('<tableName>','`'+this.itemName+'`');
		//	//get column list
		//pattern = this.getColumns(pattern, type);
		//this.wc.wnd.sqlQueryPanel.ownerCt.expand(true);
		//	
		//this.el.update(pattern);			
	},
	applyNewCursor : function(){
		//this.el.on('mouseup',function(e) {
		//	//var cursorStart = document.createElement('span');
		//	//collapsed = !!range.collapsed;
		//
		//	//cursorStart.id = 'cursorStart';
		//	//cursorStart.appendChild(document.createTextNode('|'));
		//
		//	// Insert beginning cursor marker
		//	//var range = window.getSelection().getRangeAt(0);
		//	//var node = document.createTextNode('&nbsp;&nbsp;&nbsp;&nbsp;');
		//	//range.insertNode(node);
		//	////alert(range.endOffset);
		//	////range.setEnd(window.getSelection().anchorNode, 33)
		//	//range = document.createRange();
		//	////range.setStart(window.getSelection().anchorNode, 23);
		//	////range.setEnd(window.getSelection().focusNode, 54);
		//	//window.getSelection().anchorNode.setSelectionRange(20,20);
		//    //this.el.className = editable.className + ' selecting';
		//	
		//	
		//},this);
		//
		////document.on('onmouseup',function(e) {
		////	if(this.el.className.match(/\sselecting(\s|$)/)) {
		////	    editable.className = editable.className.replace(/ selecting(\s|$)/, '');
		////	    captureSelection();
		////	}
		////});
		//
		//this.el.on('blur',function(e) {
		//	var cursorStart = document.createElement('span');
		//	//collapsed = !!range.collapsed;
		//
		//	cursorStart.id = 'cursorStart';
		//	cursorStart.appendChild(document.createTextNode('|'));
		//
		//	// Insert beginning cursor marker
		//	range.insertNode(cursorStart);
		//
		//	// Insert end cursor marker if any text is selected
		//	//if(!collapsed) {
		//	//	var cursorEnd = document.createElement('span');
		//	//	cursorEnd.id = 'cursorEnd';
		//	//	range.collapse();
		//	//	range.insertNode(cursorEnd);
		//	//}
		//},this);
	//};
	},
	setCursor : function(){
		//selection, range;
		//selection = window.getSelection();
		//range = selection.getRangeAt(0);
		//// Recalculate selection after clicking/drag-selecting
		//
		//// Add callbacks to afterFocus to be called after cursor is replaced
		//// if you like, this would be useful for styling buttons and so on
		//var afterFocus = [];
		//editable.onfocus = function(e) {
		//	// Slight delay will avoid the initial selection
		//	// (at start or of contents depending on browser) being mistaken
		//	setTimeout(function() {
		//		var cursorStart = document.getElementById('cursorStart'),
		//			cursorEnd = document.getElementById('cursorEnd');
		//
		//		// Don't do anything if user is creating a new selection
		//		if(editable.className.match(/\sselecting(\s|$)/)) {
		//			if(cursorStart) {
		//				cursorStart.parentNode.removeChild(cursorStart);
		//			}
		//			if(cursorEnd) {
		//				cursorEnd.parentNode.removeChild(cursorEnd);
		//			}
		//		} else if(cursorStart) {
		//			captureSelection();
		//			var range = document.createRange();
		//
		//			if(cursorEnd) {
		//				range.setStartAfter(cursorStart);
		//				range.setEndBefore(cursorEnd);
		//
		//				// Delete cursor markers
		//				cursorStart.parentNode.removeChild(cursorStart);
		//				cursorEnd.parentNode.removeChild(cursorEnd);
		//
		//				// Select range
		//				selection.removeAllRanges();
		//				selection.addRange(range);
		//			} else {
		//				range.selectNode(cursorStart);
		//
		//				// Select range
		//				selection.removeAllRanges();
		//				selection.addRange(range);
		//
		//				// Delete cursor marker
		//				document.execCommand('delete', false, null);
		//			}
		//		}
		//
		//		// Call callbacks here
		//		for(var i = 0; i < afterFocus.length; i++) {
		//			afterFocus[i]();
		//		}
		//		afterFocus = [];
		//
		//		// Register selection again
		//		captureSelection();
		//	}, 10);
		//};
	}
});
