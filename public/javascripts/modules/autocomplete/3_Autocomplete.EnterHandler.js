Ext.ns('Dbms.Autocomplete');

Dbms.Autocomplete.EnterHandler = Ext.extend(Dbms.Autocomplete.KeyHandler, {
	constructor : function(config){
		Dbms.Autocomplete.EnterHandler.superclass.constructor.call(this, config);
	},
	beforeProcess : function(e) {
		e.preventDefault();
		
		this.sel = this.selection.get();
		this.preInit({
			focusNode : this.sel.focusNode.parentNode,
			focusOffset : this.sel.focusOffset
		});
		
		if(this.controller.suggestionBox.isVisible()){
			if(this.controller.selectedIndex >= 0){
				this.controller.appendSelected(false, this.focusNode);
				this.controller.highlighter.highlightElement();
				return false;
			} else {
				this.controller.hideSuggestionBox();
			}
		}
		
		return true;
	},
	splitFocusNode : function(){
		
	},
	preInit : function(config){
		this.focusNode = config.focusNode;
		this.focusOffset = config.focusOffset;
			
		this.paragraphNode = this.focusNode.parentNode;
		this.prevParagraphNode = this.paragraphNode.previousElementSibling;
		this.nextParagraphNode = this.paragraphNode.nextElementSibling;
		
		this.paragraphChildNodes = Ext.get(this.paragraphNode).query('span');
	},
	process : function(e) {
		if(!this.beforeProcess(e)) {
			return false;
		}
		
		this.selection.clear();
		if(this.focusNode  == this.paragraphChildNodes[this.paragraphChildNodes.length-1]
		   && this.focusOffset == 0) {
			this.preInit({
				focusNode   : this.prevParagraphNode ? this.prevParagraphNode.lastChild : this.focusNode,
				focusOffset : this.prevParagraphNode ? this.prevParagraphNode.lastChild.length : this.focusNode.length
			})
			
			this.appendNewParagraphEl();
			//this.appendNewContextEl();
			this.appendNewContentEl();
			// HACK
			this.paragraphNode.parentNode.parentNode.scrollTop += 20;
			this.range.attach(this.nextParagraphNode, 0, 0);
		} else if(this.focusNode  == this.paragraphNode.lastChild
		   && this.focusOffset == this.focusNode.textContent.length){
			// if focus node is the last node of paragraph just add new paragraph without offset
			this.appendNewParagraphEl();
			//this.appendNewContextEl();
			this.appendNewContentEl();
			this.range.attach(this.getContentElement(), 0, 0);
		} else {
			this.focusNodeText = this.focusNode.textContent;
			this.focusNode.textContent = this.focusNodeText.substr(0, this.focusOffset);
			
			this.setContentElement(this.focusNode);
			this.highlight();
			
			this.saveNodes();
			this.appendNewParagraphEl();
			//this.appendNewContextEl();
			this.appendNewContentEl();
			
			var contentEl = this.getContentElement();
				contentEl.textContent = this.focusNodeText.substr(this.focusOffset);
				contentEl.textContent = contentEl.textContent.length == 0 ? '\n' : contentEl.textContent;
			
			this.highlight();
			this.restoreSavedNodes();
			
			if(this.prevParagraphNode.childNodes.length == 2
			   && this.prevParagraphNode.lastChild.textContent == ''){
				this.prevParagraphNode.lastChild.textContent = '\n';
			}
			
			this.range.attach(this.paragraphNode.firstChild, 0, 0);
		}
		
		this.selection.add(this.range.get());
		return this.afterProcess(e);
	},
	saveNodes : function(){
		var startPos = this.paragraphChildNodes.indexOf(this.focusNode);
		this.savedChildNodes = [];
		
		for(var i=startPos+1;i<this.paragraphChildNodes.length;i++){
			var child = this.paragraphChildNodes[i];
			this.savedChildNodes.push(child);
		}
	},
	restoreSavedNodes : function(){
		var pContentChild = this.paragraphNode.firstChild;
		var startPos = 0;
		
		if(pContentChild.textContent == '\n'){
			pContentChild.textContent = this.savedChildNodes[0].textContent;
			pContentChild.className = this.savedChildNodes[0].className;
			startPos = 1;
			
			this.setContentElement(pContentChild);
			this.highlight();
			this.prevParagraphNode.removeChild(this.savedChildNodes[0]);
			//this.prevParagraphNode.removeChild(this.savedChildNodes[1]);
		}
		
		for(var i=startPos;i<this.savedChildNodes.length;i++){
			var child = this.savedChildNodes[i];
			this.paragraphNode.appendChild(child);
			this.setContentElement(child) && this.highlight();
			//i%2 == 0 ? this.setContextElement(child) : this.setContentElement(child) && this.highlight();
		}
	},
	appendNewContextEl : function(){
		this.setContextElement(Ext.DomHelper.append(this.paragraphNode, {
			tag : "span",
			cls : 'contextElement',
			id  : Ext.id()
		}));
	},
	appendNewContentEl : function(){
		this.setContentElement(Ext.DomHelper.append(this.paragraphNode, {
			tag  : "span",
			cls  : 'contentElement',
			id   : Ext.id(),
			html : '\n'
		}));
	},
	appendNewParagraphEl : function(){
		this.paragraphNode = Ext.DomHelper.insertAfter(this.paragraphNode, {
			id  : Ext.id(),
			cls : 'ppp',
			tag : 'p'
		});
		
		this.paragraphChildNodes = Ext.get(this.paragraphNode).query('span');
		this.prevParagraphNode = this.paragraphNode.previousElementSibling;
		this.nextParagraphNode = this.paragraphNode.nextElementSibling ? this.paragraphNode.nextElementSibling : this.paragraphNode;
	}
});