Ext.ns('Dbms.Autocomplete');

Dbms.Autocomplete.BackspaceHandler = Ext.extend(Dbms.Autocomplete.KeyHandler,{
	constructor : function(config){
		Dbms.Autocomplete.BackspaceHandler.superclass.constructor.call(this, config);
		this.undelitedLength = this.rootEl.dom.innerHTML.length;
	},
	beforeProcess : function(e) {
		e.preventDefault();
		var selection = this.selection.get();
		// just in case
		this.controller.hideSuggestionBox();
		//there are no characters to remove just return
		if(this.rootEl.dom.textContent.length == 0)
			return false;	
		
		return true;
	},
	setDefaultRootText : function(){
		//for(var i=this.rootEl.dom.childNodes.length-1;i>1;i--);
		//	this.rootEl.dom.removeChild(this.rootEl.dom.childNodes[i]);
		while(this.rootEl.dom.firstChild &&
			  this.rootEl.dom.childNodes.length > 1){
			this.rootEl.dom.removeChild(this.rootEl.dom.firstChild);
		}
		
		while(this.rootEl.dom.firstChild.childNodes.length > 1){
			this.rootEl.dom.firstChild.removeChild(this.rootEl.dom.firstChild.firstChild);
		}
			
		this.rootEl.dom.firstChild.firstChild.innerHTML = '\n';
	},
	setDefaultSelection : function(){
		var rootNode = this.rootEl.dom.firstChild;
		var rootContentEl = rootNode.firstChild;
		this.range.attach(rootContentEl, 1, 1);
		this.selection.add(this.range.get());
	},
	clear : function() {
		this.selection.clear();
		this.controller.setCurrenRow(1);
		this.controller.useDefaultNodes();
		
		this.animator.fade({
			el      : this.rootEl,
			fadeOut : {
				callback : this.setDefaultRootText,
				scope    : this
			},
			fadeIn : {
				callback : this.setDefaultSelection,
				scope    : this
			}
		});
	},
	totalRootLen : function(){
		var childNodes = this.rootEl.query('span');
		var totalLen = 0;
		
		for(var i=0;i<childNodes.length;i++){
			totalLen += childNodes[i].innerHTML.length;
		}
		
		return totalLen;
	},
	process : function(e) {
		if(!this.beforeProcess(e)){
			return false;
		}
		
		//user selects the whole field, so remove all exept default dom-elements
		if(this.selection.get().toString().length >= this.totalRootLen()) {
			this.clear();
		} else {
			var selection = this.selection.get();
			if(selection.anchorOffset == 0 &&
			   selection.anchorNode.parentNode == selection.anchorNode.parentNode.parentNode.firstChild
			   && selection.anchorNode.parentNode.parentNode.parentNode.firstChild
			   == selection.anchorNode.parentNode.parentNode){
				this.range.attach(selection.anchorNode.parentNode,1,1);
				this.selection.add(this.range.get());
				return this.afterProcess(e);
			}
			
			this.deletePart(e);
		}
		
		return this.afterProcess(e);
	},
	afterProcess : function(e){
		if(e.autocomplete !== false){
			this.controller.showAutocomplete(this.getContentElement().textContent);
		}
		
		this.controller.highlighter.highlightElement();
		return true;
	},
	deletePart : function(e) {
		var selection = this.selection.get();
		
		if(selection.anchorNode === selection.focusNode) {
			//// user selects a whole word, so shoud remove also context and content elements
			if(selection.anchorNode.parentNode.textContent.length == selection.toString().length) {
				this.setContentElement(selection.anchorNode.parentNode);
				// user selects only one text-node
				return this.deleteOneWord();
			} else {
				if(selection.anchorOffset == 0 &&
				   selection.anchorNode.parentNode == selection.anchorNode.parentNode.parentNode.firstChild){
					return this.deleteTagP(); //will be soon
				} else  if(selection.anchorOffset == selection.focusOffset){
					return this.deleteCharacter(); //will be soon
				} else {
					return this.deleteFewCharacters(); //will be soon
				}
			}
		} else {
			// user tries to delete few words
			this.deleteFewWords();
		}
		
		return true;
	},
	deleteTagP : function(){
		var selection = this.selection.get();
		this.setContentElement(selection.anchorNode.parentNode.parentNode);
		this.deleteOneWord(true);
	},
	deleteOneWord : function(safe){
	    var nodesToDelete = this.getNodesToRemove();
		
		if(!nodesToDelete.finded){
			return false;
		}
		
		this.selection.clear();
		var rangeStartPos = 1;
		var rangeEndPos = 1;
		var rangePos = 1;
		// select prevoius node, as context, and content
		var currentContentPrevNode = this.getContentElement().previousElementSibling;
		
		if(nodesToDelete.content.tagName.toLowerCase() == 'p') {
			var lastNode = false;
			if('undefined' != typeof safe){
				var innerHTML = nodesToDelete.content.innerHTML;
				focusNode = currentContentPrevNode.childNodes[currentContentPrevNode.childNodes.length-1];
				lastNodeOffset = focusNode.textContent.length;
				
				if(currentContentPrevNode.firstChild.textContent == '\n'){
					currentContentPrevNode.innerHTML = innerHTML;
					focusNode = currentContentPrevNode.firstChild;
					lastNodeOffset = 0;
				} else {
					currentContentPrevNode.innerHTML += innerHTML;
				}
				
				this.setContentElement(focusNode);
			}
			
			//this.setContextElement(focusNode.previousElementSibling);
			this.setContentElement(focusNode);
			// remove nodes
			this.rootEl.dom.removeChild(nodesToDelete.content);
			var joined = false;
			for(var i=0;i<currentContentPrevNode.childNodes.length;i++){
				var childFirst = currentContentPrevNode.childNodes[i];
				var childNext = currentContentPrevNode.childNodes[i+1];
				
				if(childFirst && childNext){
					if(childFirst.className == 'contentElement' && childNext.className == 'contentElement'){
						joined = true;
						childNext.textContent = childNext.textContent == '\n' ? '' : childNext.textContent;
						childFirst.textContent += childNext.textContent;
						
						currentContentPrevNode.removeChild(childNext);
						i+=1;
						this.setContentElement(childFirst);
						this.controller.highlighter.highlightElement();
					}
				}
			}
			
			 if(!joined) {
				this.range.attachToContents(Ext.getDom(this.getContentElement().id), lastNodeOffset, lastNodeOffset);
			 } else {
				this.range.attachToContents(this.getContentElement(), lastNodeOffset, lastNodeOffset);
			}
			
			this.selection.add(this.range.get());
			return false;
		} else {
			var parentP = nodesToDelete.content.parentNode;
			
			if(parentP.childNodes.length == 1){
				//this.setContextElement(nodesToDelete.context);
				this.setContentElement(nodesToDelete.content);
				nodesToDelete.content.textContent = '\n';
			} else {
				if(nodesToDelete.content.previousElementSibling){
					//this.setContextElement(nodesToDelete.context.previousElementSibling.previousElementSibling);
					this.setContentElement(nodesToDelete.content.previousElementSibling);
				} else {
					//this.setContextElement(nodesToDelete.content.nextElementSibling);
					this.setContentElement(nodesToDelete.content.nextElementSibling);
					rangePos = 0;
				}
				// remove nodes
				//parentP.removeChild(nodesToDelete.context);
				parentP.removeChild(nodesToDelete.content);
			}
		}
		
		if(parentP.childNodes.length == 1){
			parentP.firstChild.innerHTML = '\n';
		}
		
		if(this.getContentElement().className == 'contentElement' && this.getContentElement().nextElementSibling
		   && this.getContentElement().nextElementSibling.className == 'contentElement'){
			var rangePos = this.getContentElement().textContent.length;
			this.glueNeighborNodes(this.getContentElement(), this.getContentElement().nextElementSibling, this.getContentElement().textContent.length);
			this.range.attachToContents(this.getContentElement(), rangePos, rangePos);
		} else {
			this.range.attach(this.getContentElement(), rangePos, rangePos);
		}
		
		this.selection.add(this.range.get());
		
	    return false;
	},
	deleteFewWords : function(){
		var selection = this.selection.get();
		
		var baseOffset = selection.anchorOffset;
		var focusOffset = selection.focusOffset;
		
		var baseNode = selection.anchorNode.parentNode;
		var focusNode = selection.focusNode.parentNode;
		var parentP = focusNode.parentNode;
		var parentPChildNodes = Ext.get(parentP).query('span');
		this.selection.clear();
		
		// means selection was focus<----base
		if(parentPChildNodes.indexOf(baseNode) > parentPChildNodes.indexOf(focusNode)){
			//remove <node>'s from focus<node><node>base
			this.removeChildNodes(parentP, baseNode, focusNode, true);
			// means selection was f|ocus<----base
			if(focusNode.textContent.length - focusOffset != focusNode.textContent.length) {
				// set focus node as content
				//this.setContextElement(focusNode.previousElementSibling);
				this.setContentElement(focusNode);
				
				rangeNode = focusNode;
				focusNode.textContent = focusNode.textContent.substr(0, focusOffset);
				this.range.attachToContents(rangeNode, rangeNode.textContent.length, rangeNode.textContent.length);
			} else {
				// means selection was |focus<----base
				// set conent-node as focusNode.prev
				//this.setContextElement(focusNode.previousElementSibling);
				this.setContentElement(focusNode);
				// and remove focus context and conetnt nodes
				focusNode.textContent = '\n';
				this.range.attach(focusNode, 1, 1);
				focusNode = false;
			}
			
			var baseNodeTxtLen = 0;
			// means selection was focus<----base|
			if(baseOffset == baseNode.textContent.length){
				// as all prevs nodes were removed,
				// add content and context nodes
				// the prev nodes
				//this.setContextElement(baseNode.previousElementSibling.previousElementSibling.previousElementSibling);
				this.setContentElement(baseNode.previousElementSibling);
				
				//parentP.removeChild(baseNode.previousElementSibling);
				parentP.removeChild(baseNode);
				
				rangeNode = this.getContentElement();
				this.range.attach(rangeNode, 1, 1);
				
				baseNode = false;
			} else {
				// means selection was focus<----bas|e
				baseNode.textContent = baseNode.textContent.substr(baseOffset, baseNode.textContent.length-baseOffset);
				baseNodeTxtLen = baseNode.textContent.length;
				
				if(!focusNode){
					focusNode.textContent = baseNode.textContent;
				}
				
				//this.setContextElement(focusNode.previousElementSibling);
				this.setContentElement(focusNode);
				
				//parentP.removeChild(baseNode.previousElementSibling);
				parentP.removeChild(baseNode);
				
				this.range.attach(focusNode, 1, 1);
			}
			
			focusNode && baseNode && this.glueNeighborNodes(focusNode, baseNode, focusNode.textContent.length);
			// means selection was base---->focus
		} else 	{
			var focusBaseEquals = false;
			var removeFocusNode = true;
			// means selection was base|---->focus
			// is a browser bug
			if(baseNode.textContent.length == baseOffset){
				// mark baseNode as baseNode.next
				// to make |base---->focus
				baseNode = Ext.get(baseNode).next().next().dom;
				baseOffset = 0;
				focusBaseEquals = focusNode === baseNode;
			}
			// means selection was base---->|focus
			// also bug
			if(focusOffset == 0){
				if(focusNode.nextElementSibling){
					focusNode = focusNode.nextElementSibling;
					focusOffset = 0;
					removeFocusNode = false;
				}
			}
			
			this.removeChildNodes(baseNode.parentNode, baseNode, focusNode, removeFocusNode);
			
			baseOffset = baseNode.textContent.length-baseOffset;
			var baseNodeTxtLen = 0;
			
			if(baseOffset != baseNode.textContent.length) {
				//this.setContextElement(baseNode.previousElementSibling);
				this.setContentElement(baseNode);
				
				rangeNode = baseNode;
				baseNode.textContent = baseNode.textContent.substr(0, baseNode.textContent.length-baseOffset);
				baseNodeTxtLen = baseNode.textContent.length;
				this.range.attachToContents(rangeNode, baseNodeTxtLen, baseNodeTxtLen);
			} else {
				//this.setContextElement(baseNode.previousElementSibling.previousElementSibling.previousElementSibling);
				this.setContentElement(baseNode.previousElementSibling);
				
				//baseNode.parentNode.removeChild(baseNode.previousElementSibling);
				baseNode.parentNode.removeChild(baseNode);
				var rangeNode = this.getContentElement();
				
				this.range.attach(rangeNode, 1, 1);
				
				baseNode = false;
			}
			
			if(!focusBaseEquals || (focusBaseEquals && baseNode)){
				if(focusOffset != focusNode.textContent.length) {
					//this.setContextElement(focusNode.previousElementSibling);
					this.setContentElement(focusNode.previousElementSibling);
					
					rangeNode = focusNode;
					focusNode.textContent = focusNode.textContent.substr(focusOffset);
					this.range.attachToContents(rangeNode, 0, 0);
				} else {
					//this.setContextElement(focusNode.previousElementSibling.previousElementSibling.previousElementSibling);
					this.setContentElement(focusNode.previousElementSibling);
					
					//this.rootEl.dom.removeChild(focusNode.previousElementSibling);
					this.rootEl.dom.removeChild(focusNode);
					
					var rangeEl = this.getContentElement();
					this.range.attachToContents(rangeEl, rangeEl.textContent.length, rangeEl.textContent.length);
					focusNode = false
				}
				
				focusNode && baseNode && this.glueNeighborNodes(baseNode, focusNode, baseNodeTxtLen);
			}
		}
		
					
		if(this.getContentElement().className == 'dbms-autocomplete-next-row'){
			//this.getContentElement().textContent = "\n";
			//this.setContextElement(this.insertContextAfter(this.getContentElement()));
			this.setContentElement(this.insertContentAfter(this.getContentElement()));
			this.getContentElement().textContent = '\n';
			this.range.attach(this.getContentElement(), 1, 1);
		}
		
		this.selection.add(this.range.get());
				
		return true;
	},
	glueNeighborNodes : function(leftNode,rightNode,rangePos){
		if(leftNode.className == rightNode.className
		   && leftNode.className == 'contentElement'){
			leftNode.textContent += rightNode.textContent;
					
			//rightNode.parentNode.removeChild(rightNode.previousElementSibling);
			rightNode.parentNode.removeChild(rightNode);
		}
		
		this.range.attachToContents(leftNode, rangePos, rangePos);
		
		//this.setContextElement(leftNode.previousElementSibling);
		this.setContentElement(leftNode);
		this.selection.add(this.range.get());
	},
	deleteCharacter : function() {
		var selection = this.selection.get();
		var selectedNode = selection.anchorNode.parentNode;
		this.setContentElement(selectedNode);
		
		var startOffset = selection.anchorOffset;
		var endOffset = selection.focusOffset;
		
		if(((selection.focusOffset == 0) && (0 == selection.anchorOffset))
		   && (this.rootEl.dom.firstChild == selectedNode.parentNode)){
			return false;
		}
		
		if(((selection.focusOffset == 0) && (0 == selection.anchorOffset))
		   && (selectedNode.parentNode.childNodes.length == 1)
		   && selectedNode.parentNode.firstChild.textContent == '\n'){
			// should remove parent p-element
			this.setContentElement(selectedNode.parentNode);
			return this.deleteOneWord();
		}
		
		selectedNode.textContent = selectedNode.textContent.substr(0, startOffset-1) + selectedNode.textContent.substr(startOffset/*+unicodeCharLen*/);
			
		if(selectedNode.textContent.length == 0 || selectedNode.textContent == '\n'
		   || selectedNode.className == 'tabElement'){
			return this.deleteOneWord();
		}
		
		this.setContentElement(selectedNode);
		
		startOffset = startOffset == 0 ? 1 : startOffset;
		endOffset = endOffset == 0 ? 1 : endOffset;
		
		this.selection.clear();
		this.range.attachToContents(selectedNode, startOffset-1, startOffset-1); //set range to the end of the word
		this.selection.add(this.range.get());
		
		return true;
	},
	deleteFewCharacters : function(){
		var selection = this.selection.get();
		var baseOffset  = selection.anchorOffset;
		var focusOffset = selection.focusOffset;
		var node = this.getContentElement();
		
		//this.setContextElement(node.previousElementSibling);
		this.setContentElement(node);
		
		if(focusOffset > baseOffset){
			var tmp = focusOffset;
			focusOffset = baseOffset;
			baseOffset = tmp;
		}
		
		node.textContent = node.textContent.substr(0, focusOffset) + node.textContent.substr(baseOffset, node.textContent.length);
		this.selection.clear();
		this.range.attachToContents(node, focusOffset, focusOffset);
		this.selection.add(this.range.get());
		
		return true;
	},
	removeChildNodes : function(node, baseNode, focusNode,removeFocusNode){
		var rootElChilNodes = Ext.get(node).query('span');
		
		var baseNodeIdx  = rootElChilNodes.indexOf(baseNode);
		var focusNodeIdx = rootElChilNodes.indexOf(focusNode);
			focusNodeIdx = removeFocusNode ? focusNodeIdx : removeFocusNode-1;
		
		if(focusNodeIdx > baseNodeIdx){
			var tmp = baseNodeIdx;
			baseNodeIdx = focusNodeIdx;
			focusNodeIdx = tmp;
		}
		
		var nodesToRemove = [];
		for(var i=focusNodeIdx+1; i<baseNodeIdx-1; i++){
			nodesToRemove.push(node.childNodes[i]);
		}
				
		var len = nodesToRemove.length;
		for(var i=0;i<len;i++) {
			node.removeChild(nodesToRemove[i]);
		}
		
		return node;
	}
});