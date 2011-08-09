Ext.ns('Dbms.Autocomplete');

Dbms.Autocomplete.Highlighter = Ext.extend(function(){}, {
	constructor : function(controller) {
		this.controller = controller;
		this.config = {
			isComment : false,
			isLineComment : false
		};
	},
	/*
	 * creates html-markup, including highlighting-rules
	 * @param text {String} text, that should be highlighted
	 * @returns {String}
	 */
	highlight : function(text) {
		this.controller.element.parent().unmask();
		this.controller.element.parent().mask('Highlighting...');
		var result = '<p>';
		var lastIdx = -1;
		for(var i=0;i<text.length;i++) {
			var ch = text[i].charCodeAt(0);
			
			if(ch === 10 || ch == 9 || ch == 32 || i == text.length-1) {
				var word = this.markUpWord((i === text.length - 1 && [10, 9, 32].indexOf(ch) == -1) ? text.substr(lastIdx+1, i) : text.substring(lastIdx+1, i));
				
				switch(ch) {
					case 10 : {
						result += word + '</p><p>';
						this.config.isLineComment = false;
						lastIdx = i;
						break;
					}
					case 32 : {
						word += '<span class="whitespaceElement" id="'+Ext.id()+'"> </span>';
						lastIdx = i;
						result += word;
						break;
					}
					case 9 : {
						word += '<span class="tabElement" id="'+Ext.id()+'">\t</span>';
						lastIdx = i;
						result += word;
						break;
					}
					
					default : {
						result += word + '</p>';
						break;
					}
				}
			}
		}
		
		this.controller.element.parent().unmask();
		return result;
	},
	/*
	 * @param {String} textValue
	 * @returns {String} the color in HEX-format
	 */
	getItemColorByTextValue : function(textValue) {
		if(!textValue || textValue.length == 0) {
			return '#000000';
		}
		
		for(var i=this.controller.dictionary.length-1;i>=0;i--) {
			var dictItem = this.isInDictionary(textValue, i);
			
			if(dictItem === false) {
				continue;
			}
			
			break;
		}
		
		switch(dictItem.weight) {
			case 0 : {
				return '#0F699E';
			}
			case 1 : {
				return '#A100FF';
			}
			case 3 :
			case 4 : 
			case 2 : {
				return '#993A00';
			}
		}
		
		return 'black';
	},
	lineMarkUp : function(line) {
		var result = '<p>';
		var wordsSpaceDelim = line.split(" ");
		
		return result.replace(/\s/g, '<span class="whitespaceElement" id="'+Ext.id()+'" style="color:black;"> </span>') + '</p>';
	},
	markUpWord : function(word) {
		var color = this.getItemColorByTextValue(word);
		
		if(word.indexOf('#') == 0 || this.config.isLineComment) {
			this.config.isLineComment = true;
			color = 'grey';
		}
		
		if(word.indexOf('/*') != -1 || this.config.isComment) {
			this.config.isComment = true;
			color = 'grey';
		}
		
		if(word.indexOf('*/') != -1) {
			this.config.isComment = false;
		}
		
		return '<span class="contentElement" id="'+Ext.id()+'" style="color:'+color+'">' + word + '</span>';
	},
	highlightElement : function() {
		var contentElement = this.controller.contentElement;
	    var textValue = contentElement.innerText;
		
		contentElement.style.color = this.getItemColorByTextValue(textValue);
		return true;
	},
	isInDictionary : function(textValue, dictionaryPos) {
		var item = this.controller.dictionary[dictionaryPos];
		var dictionaryName = item.name.toLowerCase();
		var t = textValue.toLowerCase();
		
		if(item.help_category_id == 20 && dictionaryName.indexOf(' ') == -1) {
			var re = new RegExp('^'+dictionaryName+'\\([0-9]{1,}\\);?$');
			
			if(re.test(t)) {
				return item;
			}
		}
		
		// is sql-function or sql-statement?
		if(item.weight == 0 ) {
			if(dictionaryName == t || dictionaryName+';' == t) {
				return item;
			}
		} else {
			if(dictionaryName == t ||
			   dictionaryName+',' == t ||
			   '('+dictionaryName == t ||
			   dictionaryName+')' == t ||
			   '('+dictionaryName+')' == t) {
			   return item;
			}
		}
		
		return false;
	}
});