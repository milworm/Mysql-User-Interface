Ext.ns('Dbms.Autocomplete');

Dbms.Autocomplete.CursorHandler = Ext.extend(Dbms.Autocomplete.KeyHandler, {
	constructor : function(config){
		Dbms.Autocomplete.CursorHandler.superclass.constructor.call(this, config);
	},
	beforeProcess : function(e){
		return true;
	},
	onUpKey : function(e){
		var selection = this.selection.get();
		var baseNode = selection.anchorNode.parentNode;
		
	    if(this.controller.suggestionBox.isVisible()) {
			this.controller.decSelectedIndex();
			this.controller.select();
				
			return false;
	    }
		
		this.moveUp(e);
	    return true;
	},
	onDownKey : function(e){
		e.preventDefault();
		
	    if(this.controller.suggestionBox.isVisible()){
			this.controller.incSelectedIndex();
			this.controller.select();
				
			return false;
		}
		this.moveDown(e);
	    return false;
	},
	onRightKey : function(e) {
		var anchorNode = this.selection.getAnchorNode();
		var selection = this.selection.get();
		
		if(selection.baseOffset == selection.focusOffset) { //there are no any selections
			if(selection.baseOffset == 0
			   && anchorNode.className == 'tabElement') { // need to move cursor in 4 positions
				e.preventDefault();
				this.selection.clear();
				this.range.attach(anchorNode, 1, 1);
				this.selection.add(this.range.get());
				
				return ;
			}
			
			// this is a single word
			// and we stay at the last position
			if(selection.baseOffset == anchorNode.innerText.length) {
				if(anchorNode.nextElementSibling == undefined) {
					return false;
				} else {
					if(anchorNode.nextElementSibling.className == 'tabElement') {
						e.preventDefault();
						this.selection.clear();
						this.range.attach(anchorNode.nextElementSibling, 1, 1);
						this.selection.add(this.range.get());
						
						return ;
					} else {
						return false;
					}
				}
			}
		} else { //user selects text
			alert('test');
		}
	},
	onLeftKey : function(e) {
		var anchorNode = this.selection.getAnchorNode();
		var selection = this.selection.get();
		
		if(selection.baseOffset == selection.focusOffset) { //there are no any selections
			if(anchorNode.className == 'tabElement') {
				if(selection.baseOffset == anchorNode.innerText.length) {
					e.preventDefault();
					this.selection.clear();
					this.range.attach(anchorNode, 0, 0);
					this.selection.add(this.range.get());
					
					return ;
				}
			} else {
				if(selection.baseOffset == 0) {
					if(anchorNode.previousElementSibling.className == 'tabElement') {
						e.preventDefault();
						this.selection.clear();
						this.range.attach(anchorNode.previousElementSibling, 0, 0);
						this.selection.add(this.range.get());
						
						return ;
					} else {
						return false;
					}
				} else {
					return false;
				}
			}
		} else { //user selects text
			alert('test');
		}
	},
	calculateTotalOffset : function(){
	},
	getParagraphElement : function() {
		return this.anchorNode.parentNode;
	},
	calculateTotalOffset : function() {
		var totalOffset = 0;
		for(var i=0;i<this.paragraphElement.childNodes.length;i++){
			var child = this.paragraphElement.childNodes[i];
			
			if(child == this.anchorNode){
				break;
			}
			
			if(child.innerHTML == '\t'){
				totalOffset += 4
			} else 
				totalOffset += child.textContent.length;
		}
		
		return totalOffset+this.anchorOffset;
	},
	setOffset : function(node, totalOffset){
		var currentOffset = 0;
		this.selection.clear();
		
		if(!node) {
			this.setContentElement(this.paragraphElement.firstChild);
			this.range.attach(this.paragraphElement.firstChild, 0, 0);
			this.selection.add(this.range.get());
			
			return false;
		}
		
		if(totalOffset == 0){
			var child = node.firstChild;
			this.range.attach(child, 0, 0);
			this.selection.add(this.range.get());
			this.setContentElement(node);
			return false;
		}
		
		if(node.firstChild.textContent == '\n') {
			this.setContentElement(node);
			this.range.attach(node.firstChild, 0,0);
			this.selection.add(this.range.get());
			
			return false;
		}
		
		for(var i=0;i<node.childNodes.length;i++){
			var child = node.childNodes[i];
			
			if(child.innerHTML == '\t') {
				currentOffset += 4;
			} else {
				currentOffset += child.textContent.length;
			}
			
			var offset = totalOffset-currentOffset;
			
			if(offset < 0){
				var childTextLen = child.innerHTML == '\t' ? 4 : child.textContent.length
				
				if(childTextLen>=child.textContent.length){
					this.range.attach(child, 0,0);
				} else {
					this.range.attachToContents(child, childTextLen+offset, childTextLen+offset);
				}
				this.selection.add(this.range.get());
				
				return true;
			}
		}
		
		var child = node.lastChild;
		this.setContentElement(node);
		this.range.attach(child, 1, 1);
		this.selection.add(this.range.get());
		
		return true;
	},
	moveUp : function() {
		this.sel = this.selection.get();
		this.anchorNode = this.sel.anchorNode.parentNode;
		this.anchorOffset = this.anchorNode.innerHTML == '\t' ? 4 : this.sel.anchorOffset;
		this.paragraphElement = this.getParagraphElement();
		this.previousParagraph = this.paragraphElement.previousElementSibling;
		var totalOffset = this.calculateTotalOffset();
		this.setOffset(this.previousParagraph, totalOffset);
		
		return false;
	},
	moveDown : function(){
		this.sel = this.selection.get();
		this.anchorNode = this.sel.anchorNode.parentNode;
		this.anchorOffset = this.anchorNode.innerHTML == '\t' ? 4 : this.sel.anchorOffset;
		this.paragraphElement = this.getParagraphElement();
		this.nextParagraph = this.paragraphElement.nextElementSibling;
		var totalOffset = this.calculateTotalOffset();
		this.setOffset(this.nextParagraph, totalOffset);
		
		return false;
	},
	getLineInfoFromEnd : function(baseNode, rootElChildNodes, offset){
		if(!rootElChildNodes) rootElChildNodes = this.getRootChildNodes();
		
		var baseNodeIdx = rootElChildNodes.indexOf(baseNode);
		
		var chars = baseNode.innerHTML.substr(0, offset);
		
		for(var i=baseNodeIdx-1; i>=0; i--){
			var child = rootElChildNodes[i];
			
			if(child.className != 'dbms-autocomplete-next-row'){
				chars += child.innerHTML;
			} else {
				break;
			}
		}
		
		
		return {
			length : chars.length,
			last  : baseNode,
			first : child.nextElementSibling.nextElementSibling
		}
		
	},
	getLineInfoFromStart : function(startNode, rootElChildNodes){
		if(!rootElChildNodes) rootElChildNodes = this.getRootChildNodes();
		
		var startNodeIdx = rootElChildNodes.indexOf(startNode);
		
		var chars = startNode.innerHTML;
		
		for(var i=startNodeIdx+1; i<rootElChildNodes.length; i++){
			var child = rootElChildNodes[i];
			
			if(child.className != 'dbms-autocomplete-next-row'){
				chars += child.innerHTML;
			} else {
				break;
			}
		}
		
		
		return {
			length : chars.length,
			last   : child.className == 'dbms-autocomplete-next-row' ? child.previousElementSibling.previousElementSibling : child,
			first  : startNode
		}
		
	},
	process : function(e){
		if(!this.beforeProcess(e)){
			return false;
		}
		
		switch(e.keyCode || e.charCode){
			case 37 : {
				this.onLeftKey(e);
				break;
			}
			
			case 38 : {
				this.onUpKey(e);
				break;
			}
			
			case 39 : {
				this.onRightKey(e);
				break;
			}
			
			case 40 : {
				this.onDownKey(e);
				break;
			}
			
			default : {
				return false;
			}
		}
		
		return this.afterProcess(e);
	}
});