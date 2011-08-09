Ext.ns('Dbms.Autocomplete');

Dbms.Autocomplete.WhitespaceHandler = Ext.extend(Dbms.Autocomplete.KeyHandler, {
	beforeProcess : function(e){
		e.preventDefault();
		
		return true;
	},
	process : function(e) {
		if(!this.beforeProcess(e)){
			return false;
		}
		// just in case
	    this.controller.hideSuggestionBox();
		var selection = this.selection.get();
		var focusNode = selection.focusNode.parentNode;
		var offset = selection.focusOffset;
		
		if(focusNode.textContent == '\n') focusNode.textContent = '';
		
		this.selection.clear();
		
		if(offset > 0 && offset < focusNode.textContent.length) {
			// should divide current-selected word into two words
			var firstWordHtml = focusNode.textContent.substr(0, offset);
			var secondWordHtml = focusNode.textContent.substr(offset);
			
			//this.setContextElement(focusNode.previousElementSibling);
			this.setContentElement(focusNode);
			
			this.getContentElement().textContent = firstWordHtml;
			this.controller.highlighter.highlightElement();
			
			//this.setContextElement(this.insertContextAfter(this.getContentElement()));
			this.setContentElement(this.insertContentAfter(this.getContentElement()));
			this.getContentElement().textContent = secondWordHtml;
			
			this.controller.highlighter.highlightElement();
		}
		
		//this.setContextElement(this.insertContextAfter(focusNode));
		this.setContentElement(this.insertContentAfter(focusNode));
		var contentEl = this.getContentElement();
			contentEl.textContent = ' ';
			contentEl.className = 'whitespaceElement';
		
	    this.range.attach(contentEl, 1, 1);
		this.selection.add(this.range.get());
		
	    return this.afterProcess(e);
	},
	afterEnterProcess : function(baseNode, e){
		baseNode.textContent = '\n';
		//var contextEl = baseNode.nextElementSibling;
		var contentEl = baseNode.nextElementSibling;
		
		//this.setContextElement(contextEl);
		this.setContentElement(contentEl);
		
		if(contentEl.textContent.length == 0){
			contentEl.textContent = "\t";
		} else {
			//this.setContextElement(this.insertContextAfter(node));
			this.setContentElement(this.insertContextAfter(node));
			this.getContentElement().textContent = '\t';
		}
		
		this.getContentElement().className = 'tabElement';
		this.range.attach(this.getContentElement(), 1, 1);
		this.selection.add(this.range.get());
	},
	afterProcess : function(e) {
		this.controller.highlighter.highlightElement();
	}
});