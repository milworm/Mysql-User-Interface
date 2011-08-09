Ext.ns('Dbms.Autocomplete');
/*
 * class KeyHandler
 * is the parent class of all classes that process the specific key
 */
Dbms.Autocomplete.KeyHandler = Ext.extend(function(){}, {
	constructor : function(config){
		Ext.apply(this, config);
		
		this.range = new Dbms.Autocomplete.Range;
		this.selection = new Dbms.Autocomplete.Selection;
		this.animator = new Dbms.Autocomplete.Animator;
	},
	addNewRange : function(){
		var selection = this.selection.get();
			selection.removeAllRanges();
			selection.addRange(this.range.get());
	},
	setContentElement : function(contentEl){
		this.controller.contentElement = contentEl;
	},
	setContextElement : function(contextEl){
		this.controller.contextElement = contextEl;
	},
	getContentElement : function(){
		return this.controller.contentElement;
	},
	getContextElement : function(){
		return this.controller.contextElement;
	},
	getNodesToRemove : function(){
		var currentContentEl = this.getContentElement();
		var parent = currentContentEl.parentNode;
		var isFinded = false;
		
		for(var i=0;i<parent.childNodes.length;i++){
			var item = parent.childNodes[i];
				
			if(item == currentContentEl) {
				var contextNodeToDelete = parent.childNodes[i-1];
				var contentNodeToDelete = item;
				var deletePosition = i;
				
				isFinded = true;	
				break;
			} // if
		} // for
		
		return {
			context : contextNodeToDelete,
			content : contentNodeToDelete,
			idx     : deletePosition,
			finded  : isFinded
		}
	},
	getRootChildNodes : function(){
		return this.rootEl.query('span');
	},
	insertContextAfter : function(node){
		return Ext.DomHelper.insertAfter(node, {
			tag : 'span',
			cls : 'row'+this.controller.currentRow,
			id  : Ext.id()
		})
	},
	insertContentAfter : function(node){
		return Ext.DomHelper.insertAfter(node, {
			tag  : "span",
			cls  : 'contentElement',
			id   : Ext.id()
		})
	},
	highlight : function(){
		this.controller.highlighter.highlightElement();
	},
	insertContextBefore : function(node){
		return Ext.DomHelper.insertBefore(node, {
			tag : 'span',
			cls : 'row'+this.controller.currentRow,
			id  : Ext.id()
		})
	},
	insertContentBefore : function(node){
		return Ext.DomHelper.insertBefore(node, {
			tag  : "span",
			cls  : 'contentElement',
			id   : Ext.id()
		})
	},
	afterProcess : function() {
		this.scroll();
	},
	scroll : function() {
		this.controller.scroller.scroll();
	}
});