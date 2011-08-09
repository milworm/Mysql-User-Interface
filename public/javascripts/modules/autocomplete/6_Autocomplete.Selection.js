Ext.ns('Dbms.Autocplete');


Dbms.Autocomplete.Selection = function() {
	this.windowSelection = window.getSelection();
}

Dbms.Autocomplete.Selection.prototype = {
	get : function() {
		return this.windowSelection;
	},
	clear : function(){
		this.windowSelection.removeAllRanges();
	},
	add : function(range){
		this.windowSelection.addRange(range);
	},
	getAnchorNode : function() {
		if(this.windowSelection.anchorNode.nodeName === '#text') {
			return this.windowSelection.anchorNode.parentNode;
		}
		
		return this.windowSelection.anchorNode.firstChild;
	},
	getAnchorOffset : function() {
		return this.windowSelection.anchorOffset;
	}
}