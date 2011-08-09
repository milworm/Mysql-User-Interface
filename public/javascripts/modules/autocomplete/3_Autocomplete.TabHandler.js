Ext.ns('Dbms.Autocomplete');

Dbms.Autocomplete.TabHandler = Ext.extend(Dbms.Autocomplete.KeyHandler, {
	beforeProcess : function(e){
		e.preventDefault();
		
		if(this.controller.suggestionBox.isVisible()){
			this.controller.appendSelected(true, this.selection.get().anchorNode.parentNode);
			return false;
	    }
		
		return true;
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
	    this.getContentElement().innerHTML = "\t";
		
		this.range.attach(this.getContentElement(), 1, 1);
		this.selection.clear();
		this.selection.add(this.range.get());
		
	    return this.afterProcess(e);
	},
	afterEnterProcess : function(baseNode, e){
		baseNode.innerHTML = '\n';
		//var contextEl = baseNode.nextElementSibling;
		//var contentEl = baseNode.nextElementSibling.nextElementSibling;
		//var contextEl = baseNode.previousElementSibling;
		var contentEl = baseNode.previousElementSibling;
		
		
		//this.setContextElement(contextEl);
		this.setContentElement(contentEl);
		
		if(contentEl.innerHTML.length == 0){
			contentEl.innerHTML = "\t";
		} else {
			//this.setContextElement(this.insertContextAfter(baseNode));
			this.setContentElement(this.insertContextAfter(baseNode));
			this.getContentElement().innerHTML = '\t';
		}
		
		this.getContentElement().className = 'tabElement';
		this.range.attach(this.getContentElement(), 1, 1);
		this.selection.add(this.range.get());
	},
	afterProcess : function(e) {
		this.controller.highlighter.highlightElement();
	}
});