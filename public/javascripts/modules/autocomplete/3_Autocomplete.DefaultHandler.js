Ext.ns('Dbms.Autocomplete');

Dbms.Autocomplete.DefaultHandler = Ext.extend(Dbms.Autocomplete.KeyHandler, {
	constructor : function(config){
		Dbms.Autocomplete.DefaultHandler.superclass.constructor.call(this, config);
		this.skipNodeClasses = ['whitespaceElement', 'tabElement'];
	},
	beforeProcess : function(e){
		e.preventDefault();
		return true;
	},
	process : function(e){
		var charCode = e.keyCode || e.charCode;
		if(!this.beforeProcess(e)){
			return false;
		}
		
	    var selection = this.selection.get();
	    var baseNode  = selection.anchorNode.parentNode;
		var insertPos = selection.anchorOffset;
		
		this.selection.clear();
		
		// if user inputs in empty tag p
		if(baseNode.innerHTML == '\n') baseNode.innerHTML = '';
		// means selection node is not input,
		// so shoud add new letter on specified postion
		// or this is a whitespace, and insertPos == 0,
		// so should select baseNode as prev-node
		// will be the analogic as prev-node and focusOffset == len
		if(this.skipNodeClasses.indexOf(baseNode.className) == -1
		    || (this.skipNodeClasses.indexOf(baseNode.className) != -1 && insertPos == 0)) {
			var node = baseNode;
			
			if(this.skipNodeClasses.indexOf(baseNode.className) != -1
			   && node.previousElementSibling){
				node = node.previousElementSibling;
			} else if(this.skipNodeClasses.indexOf(baseNode.className) != -1){
				node = this.insertContextBefore(node);
			}
			
			this.setContentElement(node);
			
			var contentEl = this.getContentElement();
				contentEl.innerHTML = contentEl.textContent.substr(0, insertPos) + String.fromCharCode(charCode) + contentEl.textContent.substr(insertPos);
			this.range.attachToContents(this.getContentElement(), insertPos+1, insertPos+1);
		    this.selection.add(this.range.get());
			
		    return this.afterProcess(e);
		// means user stays at " |" so should check if next el is contentElement
		// should change it's innerHTML to newChar+content
		} else if (insertPos == baseNode.textContent.length	
				   && baseNode.nextElementSibling
				   && baseNode.nextElementSibling.className == 'contentElement'){
			this.setContentElement(baseNode.nextElementSibling);
			
			var contentEl = this.getContentElement();
				contentEl.textContent = String.fromCharCode(charCode) + contentEl.textContent;
			
			this.range.attachToContents(this.getContentElement(), 1, 1);
		    this.selection.add(this.range.get());
			
			return this.afterProcess(e);
		} else {
			//if there is not forward-content-node
			// should insert new content-node
			//this.setContextElement(this.insertContextAfter(baseNode));
			this.setContentElement(this.insertContentAfter(baseNode));
			
			this.getContentElement().textContent = String.fromCharCode(charCode);
			this.range.attach(this.getContentElement(), 1, 1);
			this.selection.add(this.range.get());
			
			return this.afterProcess(e);
		}
		
	    return false;
	},
	afterProcess : function(e) {
		if(e.autocomplete !== false){
			this.controller.showAutocomplete(this.getContentElement().innerHTML);
		}
		
		this.controller.highlighter.highlightElement();
	}
});