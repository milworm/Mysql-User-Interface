Ext.ns('Dbms.Autocomplete');

Dbms.Autocomplete.Typeahead = Ext.extend(Ext.util.Observable, {
	constructor : function(dbName){
		this.databaseName = dbName;

		this.createSuggestionBox();
		this.hideSuggestionBox();
		this.getDictionary();
		this.typeaheadItemsSize = 10;
		
		Dbms.Core.MessageBus.on('Dbms.Autocomplete.refresh', this.setDictionary, this);
	},
	createSuggestionBox : function(){
		var div = Ext.DomHelper.append(Ext.getBody(),{
			tag : 'div',
			id  : Ext.id()
		});
		
		this.suggestionBox = Ext.get(div);
		this.suggestionBox.addClass('suggest-box');
		this.suggestionBox.setStyle({
			overflowY : 'scroll',
			maxHeight : '150px',
			minHeight : '15px',
			width     : 'auto',
			minWidth  : '100px'
		});
	},
	setDictionary : function(){
		this.dictionary = Ext.StoreMgr.get('Autocomplete.KeywordsStore').list();;
	},
	getDictionary : function(){
		Ext.Ajax.request({
			url     : Dbms.Actions.autocomplete.full.replace('{database_name}',this.databaseName),
			method  : "POST",
			success : function(resp){
				var data = Ext.decode(resp.responseText, true);
				
				if(data === false){
					Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
						msg : Dbms.Constants.AJAX_COMUNICATION_ERROR
					});
					return;
				}
				
				Dbms.Autocomplete.KeywordsStore.loadData(data, false);
				Dbms.Core.MessageBus.fireEvent('Dbms.Autocomplete.KeywordsStore.loaded');
			},
			failure : function(){
				Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
					msg : Dbms.Constants.AJAX_COMUNICATION_ERROR
				});
			},scope : this
		});
	},
	/**
	 * show suggestion box
	*/
	showSuggestionBox : function(){
		this.selectedIndex = -1;
		this.suggestionBox.show();
	},
	/**
	 * show suggestion box
	*/
	showSuggestionBox : function(){
		this.selectedIndex = -1;
		this.suggestionBox.show();
	},
	/*
	 * hides suggestion box
	*/
	hideSuggestionBox : function(){
	    this.suggestionIndex = 1;
		this.selectedIndex = -1;
		this.suggestionBox.hide();
	},
	/**
	 * removes all children from suggestion box
	*/
	clearSuggestion : function(){
		var suggestionWrapBox = this.suggestionBox.dom;
		
		while(suggestionWrapBox.firstChild){
			suggestionWrapBox.removeChild(suggestionWrapBox.firstChild);
		}
	},
	/**
	 * 
	 * @param word {string}, part of word you want to complete
	*/
	autocomplete : function(word, contextEl, contentEl){
		word = word.replace('\n','');
		
		if(word.length < 2){
			return;
		}
		
	    this.suggestionIndex = 1;
		this.clearSuggestion();
		var suggestionExists = this.getSuggestions(word);
		
		if(suggestionExists) {
			//var pos = this.absolutePostion(this.contentElement);
			var pos = Dbms.Util.absolutePostion(contextEl);
			this.suggestionBox.setStyle({
				left : pos.left,
				top  : pos.top + Ext.get(contentEl).getHeight()
			});
			
			this.showSuggestionBox();
		} else {
			this.hideSuggestionBox();
		}
	},
	/**
	 * finds words from this.dictionary witch contains {word} as it's part,
	 * and attach it as html-dom-element
	 * @returns {bool}, true if atleast one suggestion exists,
	 * overwise false
	*/
	getSuggestions : function(word) {
		var originWord = word;
		word = word.toLowerCase();
		var empty = true;
		
		for(var i=0,j=0;i<this.dictionary.length;i++){
			var item = this.dictionary[i];
			
			if(this.isMysqlKeyword(item, word) || this.isDatabaseKeyword(item, word)){
				Ext.DomHelper.append(this.suggestionBox, {
					tag   : 'div',
					style : {
						height : '15px'
					},
					html  : item.name
				});
				empty = false; j++;
			}
			
			if(j <= this.typeaheadItemsSize) {
				this.suggestionBox.setStyle({overflowY : 'hiden'});
			} else {
				this.suggestionBox.setStyle({overflowY : 'scroll'});
			}
		}
		
		if(j == 1 && this.suggestionBox.dom.childNodes[0].innerHTML === originWord){
			empty = true;
		}
		
		return !empty;
	},
	isMysqlKeyword : function(item, word){
		if(item.weight == 0 && item.name.toLowerCase().substr(0, word.length).indexOf(word) != -1) {
			return true;
		}
		
		return false;
	},
	isDatabaseKeyword : function(item, word) {
		if(word[0] == '`') { //means user inputs `[nums], so it can be a database keyword, check it
			if(word.length <= 2){
				return false;
			}
			
			if(item.name.toLowerCase().substr(0, word.length).indexOf(word) != -1){
				return true;
			}
			
			return false;
		}
		
		
		if(item.name.toLowerCase().substr(1, word.length).indexOf(word) != -1){
			return true;
		}
		
		return false;
	}
});