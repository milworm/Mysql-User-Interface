Ext.ns('Dbms.Autocomplete');
/**
 * @class Autocomplete.Controller
 * provides autocomplete
 * 
 * @param id {string}, id of the element you want to attach autocomplete
 * @param dictionary {array}, autocomplete-dictionary-items
*/
Dbms.Autocomplete.Controller = function(elementId, dbName, highlightText) {
	/**
	 * @var {int} max-count of elements that will be displayed in suggestion box
	*/
	this.typeaheadItemsSize = 10;
	/**
	 * @var {int} index of row where cursor is standing
	*/
	this.currentRow = 1;
	this.databaseName = dbName;
	// initialize variables
	this.initDictionary(dbName);
	this.prepareElement(elementId);
	this.createSuggestionBox();
	this.hideSuggestionBox();
	this.attachEventListners();
	this.initKeyHandlers();
	
	this.scroller = new Dbms.Autocomplete.Scroller({
		controller : this
	});
	
	this.highlightText = highlightText || undefined;
	this.highlighter = new Dbms.Autocomplete.Highlighter(this);
}

Dbms.Autocomplete.Controller.prototype = {
	initKeyHandlers : function() {
		this.keyHandlers = ['BackspaceHandler',
							'DefaultHandler',
							'CursorHandler',
							'TabHandler',
							'WhitespaceHandler',
							'EnterHandler'];
		for(var i=0;i<this.keyHandlers.length;i++){
			var handler = this.keyHandlers[i];
			this[handler.charAt(0).toLowerCase() + handler.substr(1)] = new Dbms['Autocomplete'][handler]({
				controller : this,
				rootEl     : this.element
			});
		}
	},
	getContentElement : function() {
		return this.contentElement;
	},
	getContextElement : function(){
		return this.contextElement;
	},
	getRootElement : function(){
		return this.element;
	},
	setContentElement : function(newContentEl){
		this.contentElement = newContentEl;
	},
	setContextElement : function(newContextEl){
		this.contextElement = newContextEl;
	},
	/**
	 * simple setter for dictionary
	 * @param dictionary {array} list of autocomplete-keywords
	 * @returns {void}
	*/
	initDictionary : function(dbName) {
		this.store = new Dbms.Autocomplete.KeywordsStore(dbName);
	},
	/**
	 * create element and apply special required attrs
	 * @returns {void}
	*/
	prepareElement : function(id) {
		this.element = Ext.get(id);
		this.element.dom.contentEditable = true; // for chrome
		this.element.dom.isContentEditable = true; //for mozzilla
		this.element.update("Type your sql-statement here...");
		this.element.setStyle({
			whiteSpace    : 'pre',
			fontSize      : '13px',
			overflowY     : 'auto',
			fontFamily    : 'Inconsolata, Monaco, Consolas, "Andale Mono", "Bitstream Vera Sans Mono", "Courier New", Courier, monospace',
			letterSpacing : '1px'
		});
		
		this.element.addClass('sql-autocomplete-body');
		
		//this.element.setStyle('-webkit-tab-size', 4);
		
		Ext.get(this.element.dom.parentNode.id).setStyle({
			overflowY : 'auto'
		});
		
		this.element.parent().mask('Loading data for typeahead...');
	},
	/**
	 * set all instance variables default values
	*/
	resetAutocompleteState : function(){
		this.lastContextElement = false;
		this.currentRow = 1;
		this.enter = false;
		this.maxRowNumber = 1;
		this.isNew = true;
	},
	/**
	 * create main wrap box witch
	 * will be contains suggestions
	*/
	createSuggestionBox : function(){
		var div = Ext.DomHelper.append(Ext.getBody(),{
			tag   : 'div',
			id    : Ext.id()
		});
		
		this.suggestionBox = Ext.get(div);
		this.suggestionBox.addClass('suggest-box');
		this.suggestionBox.setStyle({
			overflowY : 'scroll',
			maxHeight : this.typeaheadItemsSize*15+'px',
			minHeight : '15px',
			width     : 'auto',
			minWidth  : '100px'
		});
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
	setCurrenRow : function(newCurrentRow){
		this.currentRow = newCurrentRow;
	},
	/**
	 * removes all children from suggestion box
	*/
	clearSuggestion : function(){
		var suggestionWrapBox = this.suggestionBox.dom;
		
		for(var i=suggestionWrapBox.childNodes.length-1; i>=0; i--){
			suggestionWrapBox.removeChild(suggestionWrapBox.childNodes[i]);
		}
	},
	setCursor : function(row,position){
		var selection = window.getSelection();
		var range = document.createRange();
		//create new text node with autocomplete-context element
		//append new span
		var spanNode = Ext.DomHelper.append(this.element,{
			tag   : 'span',
			class : 'row'+row
		});
			
		this.element.dom.appendChild(spanNode);
		
		range.selectNodeContents(this.element.dom);
		range.setStart(this.element.dom, position);
		range.setEnd(this.element.dom, position);
		
		this.lastContextElement = spanNode;
		this.firstContextNode = spanNode;
		this.startLeftOffset = Ext.get(spanNode).getX();
		
		selection.removeAllRanges();
		selection.addRange(range);
	},
	/**
	 * 
	 * @param word {string}, part of word you want to complete
	*/
	showAutocomplete : function(word){
		word = word.replace('\n','');
		if(word.length < 2){
			return;
		}
		
	    this.suggestionIndex = 1;
		this.clearSuggestion(); //remove all childNodes 
		var suggestionExists = this.getSuggestions(word);
		
		if(suggestionExists) {
			var pos = Dbms.Util.absolutePostion(this.contentElement);
			this.suggestionBox.setStyle('left', pos.left);
			var topOffset = pos.top;
			
			this.suggestionBox.setStyle('top', topOffset + Ext.get(this.contentElement).getHeight()/**cls.substr(3)-0*/);
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
			
			if(this.isMysqlKeyword(item, word) || this.isDatabaseKeyword(item, word)) {
				if(this.suggestionBox.select('[sv="'+item.name+'"]').elements.length == 0){
					Ext.DomHelper.append(this.suggestionBox, {
						tag   : 'div',
						sv    : item.name,
						style : {
							height : '15px'
						},
						html  : item.name
					});
					empty = false; j++;
				}
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
	},
	/**
	 * attach all required event-listeners for autocomplete-element 
	*/
	attachEventListners : function(){
		Dbms.Core.MessageBus.on('Dbms.Autocomplete.refresh' + this.databaseName, this.refreshDictionary, this);
		this.element.on('keypress', this.onKeyPressEventHandler, this);
		this.element.on('keydown',this.onKeyDownEvenHandler, this);
		this.element.on('blur', this.hideSuggestionBox, this);
		this.element.on('click', this.onElementClick, this);
	},
	onElementClick    : function(e) {
		var cmp = Ext.getCmp(this.element.id + '-cmp');
		if(cmp && cmp.isDefaultText) {
			this.element.dom.removeChild(this.element.dom.firstChild); //remove default text
			cmp.isDefaultText = false;
			
			var selection = window.getSelection();
			var range = document.createRange();
			//create new autocomplete-context element
			var context = this.createNewContextElement();
			this.firstContextNode = context;
			
			this.createNewContentElement();
			this.contentElement.innerHTML = '\n';
			this.element.dom.innerHTML = '<p>'+this.element.dom.innerHTML+'</p>';
				range.selectNodeContents(this.element.dom.firstChild.childNodes[1]);
				range.setStart(this.element.dom.firstChild.childNodes[1], 0);
				range.setEnd(this.element.dom.firstChild.childNodes[1], 0);
				
			this.undelitedLength = this.element.dom.innerHTML.length;
			this.startLeftOffset = Ext.get(context).getX();
			
			selection.removeAllRanges();
			selection.addRange(range);
		}
	},
	refreshDictionary : function() {
		this.dictionary = this.store.list();
		
		if(this.highlightText !== undefined) {
			this.element.update(this.highlighter.highlight(this.highlightText));
			delete this.highlightText;
		}
		
		this.element.parent().unmask();
	},
	onKeyDownEvenHandler : function(e) {
	    switch(e.keyCode || e.charCode) {
			//backspace
			case 8 : {
				this.backspaceHandler.process(e);
				//this.onBackspace(e);
				break;
			}
			//tab
			case 9 : {
				this.tabHandler.process(e);
				break;
			}
			//up key
			case 38 : {
				this.cursorHandler.process(e);
				//this.onUpKeyPressed(e);
				break;
			}
			//down key
			case 40 : {
				this.cursorHandler.process(e);
				//this.onDownKeyPressed(e);
				break;
			}
			//enter
			case 13:{
				this.enterHandler.process(e)
				break;
			}
			default : {
				this.hideSuggestionBox();
				return false;
			}
	    }
		return true;
	},
	createNewContentElement : function() {
		this.contentElement = Ext.DomHelper.append(this.element, {
									tag : "span",
									cls : 'contentElement',
									id  : Ext.id()
							  });
	},
	createNewContextElement : function() {
		this.contextElement = Ext.DomHelper.append(this.element, {
			tag   : 'span',
			class : 'row'+this.currentRow,
			id    : Ext.id()
		});
		
		return this.contextElement;
	},
	/*
	 * set this.contentElement and this.contextElement
	 * back to default
	 */
	useDefaultNodes : function(){
	    //this.contextElement = this.element.dom.childNodes[0].childNodes[0];
	    this.contentElement = this.element.dom.firstChild.firstChild;
	},
	deleteContextContentNodes : function(){
	    var selection = window.getSelection();
	    
	    for(var i=0;i<this.element.dom.childNodes.length;i++){
		var item = this.element.dom.childNodes[i];
				
		if(item == this.contentElement) {
		    var contextNodeToDelete = this.element.dom.childNodes[i-1];
		    var contentNodeToDelete = item;
		    var deletePosition = i;
					
		    break;
		} // if
	    } // for
	    
	    //add selection
	    selection.removeAllRanges();
	    var range = document.createRange();	
	    //set new content and context elements
	    this.contentElement = this.element.dom.childNodes[deletePosition + 2];
	    this.contextElement = this.element.dom.childNodes[deletePosition + 1];
	    
	    // remove nodes
	    this.element.dom.removeChild(contentNodeToDelete);
	    this.element.dom.removeChild(contextNodeToDelete);
			
	    // looking forward, if elements don't shoudl set context and content
	    // element the previous of just been deleted dom-elements
	    if(!!!this.contentElement && !!!this.contextElement) {
		this.contextElement = this.element.dom.childNodes[deletePosition-3];
		this.contentElement = this.element.dom.childNodes[deletePosition-2];
		// set selection to the end of node, because of using previous nodes
		range.selectNodeContents(this.contentElement);
		range.setStart(this.contentElement, 1);
		range.setEnd(this.contentElement, 1);
	    } else {
		// set selection to the start, because of using next noeds
		range.selectNodeContents(this.contentElement);
		range.setStart(this.contentElement, 0);
		range.setEnd(this.contentElement, 0);
	    }
	    
	    selection.addRange(range);
	    return false;
	},
	addNewRange : function(range){
	    var sel = window.getSelection();
	    sel.removeAllRanges();
	    sel.addRange(range);
	},
	onBackspace : function(e) {
	    ;
	},
	afterBackspace : function(){
	  this.highlighter.highlightElement();  
	},
	onTab : function(e){
	    e.preventDefault();
	    var selection = window.getSelection();
	    
	    if(this.suggestionBox.isVisible()){
		this.appendSelected(true);
		return false;
	    }
	    // user selects a container
	    // and want's to type tab
	    if(selection.focusNode.parentNode.id == this.element.dom.id
	        || selection.focusNode.parentNode.id == this.element.dom.parentNode.id) {
		    this.createNewContextElement();
		    this.createNewContentElement();
	    } else {
		for(var i=0;i<this.element.dom.childNodes.length;i++){
		    // if content nodes macted
		    // get context node to know current row
		    if(selection.focusNode.parentNode == this.element.dom.childNodes[i]){
			this.lastContextElement =  this.element.dom.childNodes[i-1];
			break;
		    }
		}
			
		this.currentRow = this.lastContextElement.className.substr(3)-0;
		this.lastContextElement = Ext.DomHelper.insertAfter(selection.focusNode.parentNode, {
			tag  : 'span',
			cls  : 'row'+this.currentRow,
			id  : Ext.id()
		});
			
		this.contentElement = Ext.DomHelper.insertAfter(this.lastContextElement, {
		    tag : "span",
		    cls : 'tabElement',
			id  : Ext.id()
		});
	    }
	    
	    this.contentElement.innerHTML = "\t";
	    this.highlighter.highlightElement();
		
	    var range = document.createRange();
	    	range.selectNodeContents(this.contentElement);
		range.setStart(this.contentElement, 1);
		range.setEnd(this.contentElement, 1);
		
	   this.addNewRange(range);
	},
	onWhiteSpace : function(e){
	    var selection = window.getSelection();
	    e.preventDefault();
	    // just in case
	    this.hideSuggestionBox();
	    // if contentnode starts with symbols in re class for current whitespace is contentNode
	    // else whitespaceNode
	    if(false && /^['`"]/.test(selection.focusNode.parentNode.innerHTML)){
			this.contentElement.innerHTML += ' ';
	    } else {
			var offset = selection.focusOffset;
			
			if(offset > 0){
				// should divide current-selected word into two words
				var firstWordHtml = selection.focusNode.parentNode.innerHTML.substr(0, offset);
				var secondWordHtml = selection.focusNode.parentNode.innerHTML.substr(offset);
				this.contentElement.innerHTML = firstWordHtml;
				this.highlighter.highlightElement();
			}
			
			var lastContextElement = Ext.DomHelper.insertAfter(selection.focusNode.parentNode, {
			    tag : 'span',
			    cls : 'row'+this.currentRow,
			    id  : Ext.id()
			});
			var contentElement = Ext.DomHelper.insertAfter(lastContextElement, {
			    tag : "span",
			    cls : 'whitespaceElement',
			    html: ' ',
				id  : Ext.id()
			});
			
			this.highlighter.highlightElement();
			this.contentElement = contentElement;
			this.lastContextElement = lastContextElement;
	    }
	    
	    var range = document.createRange();
	    range.selectNodeContents(this.contentElement);
	    range.setStart(this.contentElement, 1);
	    range.setEnd(this.contentElement, 1);
	    this.addNewRange(range);
	    
	    return false;
	},
	onUpKeyPressed : function(e){
	    e.preventDefault();
		
	    if(this.suggestionBox.isVisible()) {
			this.decSelectedIndex();
			this.select();
				
			return false;
	    }
		
	    if(this.currentRow > 1){
			this.currentRow--;
	    }
		
		
	    
	    return true;
	},
	onDownKeyPressed : function(e){
	    e.preventDefault();
		
	    if(this.suggestionBox.isVisible()){
		this.incSelectedIndex();
		this.select();
			
		return false;
	    } 
		
	    if(this.currentRow > 1){
		this.currentRow++;	
	    }
		
	    return false;
	},
	/*
	 *  @param e {object}
	 */
	onKeyPressEventHandler : function(e){
		if([8, 9, 38, 13].indexOf(e.keyCode || e.charCode) != -1){
			return false;
		}
		
	    switch(e.keyCode || e.charCode) {
			//whitespace
			case 32 : {
				this.whitespaceHandler.process(e);
			    break;
			}
			
			//any other key
			default : {
				this.defaultHandler.process(e);
			    break;
			}
		}
	    
		//this.highlight();
		//this.wnd.doLayout();
		//console.log(this.element.dom.childNodes);
	    return true;
	},
	/**
	 * function applues active class for element
	 * that should be highlighted
	*/
	select : function(){
		if(this.selectedIndex == -1){
			this.selectedIndex = 0;
		}
		
		var selectedItem = this.suggestionBox.dom.childNodes[this.selectedIndex];
		
		for(var i=0;i<this.suggestionBox.dom.childNodes.length;i++){
			this.suggestionBox.dom.childNodes[i].className = '';
		}
		
		selectedItem.className = 'select-hover';
		
	},
	incSelectedIndex : function(){
		if(this.selectedIndex < this.suggestionBox.dom.childNodes.length-1){
			this.selectedIndex ++;
		}
		
		this.scrollTypeahead();
	},
	decSelectedIndex : function(){
		if(this.selectedIndex > 0) {
			this.selectedIndex--;
		}
		
		this.scrollTypeahead();
	},
	scrollTypeahead : function(){
		var selectedItem = this.suggestionBox.dom.childNodes[this.selectedIndex];
		this.suggestionBox.scrollChildIntoView(selectedItem, false);
	},
	appendSelected : function(appendFirst, node){
		var nodeText = node.textContent;
		var text = '';
		var flag = appendFirst || false;
		
		
		if(flag) {
			text = this.suggestionBox.dom.childNodes[0].innerHTML;
		} else  {
			for(var i=0;i<this.suggestionBox.dom.childNodes.length;i++){
				if(this.suggestionBox.dom.childNodes[i].className == 'select-hover'){
					text = this.suggestionBox.dom.childNodes[i].innerHTML;
					break;
				}
			}
		}
		
		//highlight node
		//first get node color, depends on its weight
		var color = this.highlighter.getItemColorByTextValue(text);
		
		node.style.color = color;
		var ff = false;
		if(nodeText.indexOf('\n') != -1){
			if(nodeText.indexOf('\n') == nodeText.length-1){
				node.innerHTML = text+'\n';
				ff = true;
			} else {
				node.innerHTML  = '\n'+text;
			}
			
		} else {
			node.innerHTML = text;
		}
		
		var sel = window.getSelection();
		
		var range = document.createRange();
			range.selectNodeContents(node);
			if(ff){
				range.setStart(node.firstChild, node.textContent.length-1);
				range.setEnd(node.firstChild, node.textContent.length-1);
			} else {
				range.setStart(node,1);
				range.setEnd(node,1);
			}
			sel.removeAllRanges();
			sel.addRange(range);
			
		this.hideSuggestionBox();
	}
}