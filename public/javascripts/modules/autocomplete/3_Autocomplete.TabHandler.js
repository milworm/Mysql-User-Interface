Ext.ns('Dbms.Autocomplete');

Dbms.Autocomplete.TabHandler = Ext.extend(Dbms.Autocomplete.KeyHandler, {
	constructor   : function() {
		this.tabWidth = 4;
		Dbms.Autocomplete.TabHandler.superclass.constructor.apply(this, arguments);
		
		Dbms.Core.MessageBus.on('Dbms.SqlWidget.TabWidthChange_'+this.controller.element.id, this.setTabWidth, this);
	},
	beforeProcess : function(e){
		e.preventDefault();
		
		if(this.controller.suggestionBox.isVisible()){
			this.controller.appendSelected(true, this.selection.get().anchorNode.parentNode);
			return false;
	    }
		
		return true;
	},
	setTabWidth : function(newTabWidth) {
		this.tabWidth = newTabWidth;
	},
	getTabWidth : function() {
		return this.tabWidth;
	},
	process : function(e) {
		if(!this.beforeProcess(e)){
			return false;
		}
		
		var node = this.selection.getAnchorNode();
		
		if(node.textContent == '\n'){
			//this.setContextElement(node.previousElementSibling);
			this.setContentElement(node);
		} else {
			if(this.selection.getAnchorOffset() == 0
			   && !node.previousElementSibling) {
				//this.setContextElement(this.insertContextBefore(node.previousElementSibling));
				this.setContentElement(this.insertContentBefore(node));
			} else {
				//this.setContextElement(this.insertContextAfter(node));
				this.setContentElement(this.insertContentAfter(node));
			}
		}
		
		this.getContentElement().className = 'tabElement';
	    this.getContentElement().innerHTML = this.getTabSpaces();
		
		this.range.attach(this.getContentElement(), 1, 1);
		this.selection.clear();
		this.selection.add(this.range.get());
		
	    return this.afterProcess(e);
	},
	getTabSpaces : function() {
		for(var i=0,result='';i<this.tabWidth;i++,result+=' ');
		return result;
	},
	afterEnterProcess : function(baseNode, e){
		baseNode.innerHTML = '\n';
		var contentEl = baseNode.previousElementSibling;
		
		this.setContentElement(contentEl);
		
		if(contentEl.innerHTML.length == 0){
			contentEl.innerHTML = this.getTabSpaces();
		} else {
			this.setContentElement(this.insertContextAfter(baseNode));
			this.getContentElement().innerHTML = this.getTabSpaces();
		}
		
		this.getContentElement().className = 'tabElement';
		this.range.attach(this.getContentElement(), 1, 1);
		this.selection.add(this.range.get());
	},
	afterProcess : function(e) {
		this.controller.highlighter.highlightElement();
	}
});