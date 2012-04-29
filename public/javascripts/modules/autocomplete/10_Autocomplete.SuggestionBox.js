Ext.ns("Dbms.Autocomplete.SuggestionBox");

Dbms.Autocomplete.SuggestionBox = Ext.extend(function() {}, {
	/**
	 * @property {Dbms.Autocomplete.Controller} controller
	 */
	controller: null,

	/**
	 * @property {Array}
	 */	
	dictionary: null,

	/**
	 * @property
	 * @description
	 * represents a selected index in suggestion-box
	 */	
	selectedIndex: -1,

	/**
	 * @property
	 * @description
	 * represents a currenly selected index in suggestion-box
	 */	
	suggestionIndex: 1,

	/**
	 * @property
	 */	
	element: null,

	/**
     * @property {int} typeaheadItemsSize max-count of elements that will be displayed in suggestion box
     */
    typeaheadItemsSize: 10,

	/**
	 * @param {Dbms.Autocomplete.Controller} controller
	 */
	constructor: function(controller) {
		this.controller = controller;
		this.initElement();
	},

	/**
	 * creates Ext.Element for suggestion-box
	 * @returns {undefined}
	 */
	initElement: function() {
		this.element = Ext.DomHelper.append(Ext.getBody(), {
            tag: "div",
            id: Ext.id(),
            cls: "suggest-box",
            style: {
            	overflowY: 'scroll',
	            maxHeight: this.typeaheadItemsSize * 15 + 'px',
	            minHeight: '15px',
	            width: 'auto',
	            minWidth: '100px'	
            }
        }, true);
	},

	/**
	 * shows suggestion-box
	 * @returns {undefined}
	 */
	show: function() {
		this.selectedIndex = -1;
		this.element.show();
	},

	/**
	 * hides suggestion-box
	 * @returns {undefined}
	 */
	hide: function() {
		this.suggestionIndex = 1;
        this.selectedIndex = -1;
        this.element.hide();
	},

	/**
	 * clears suggestion-box
	 * @returns {undefined}
	 */
	clear: function() {
		this.element.dom.innerHTML = '';
	},

	/**
	 * adds new item into suggestion box
	 * @returns {undefined}
	 */
	add: function(config) {
		Ext.DomHelper.append(this.element, Ext.applyIf(config, {
            tag: 'div',
            style: {
                height: '15px'
            }
        }));
	},

	/**
	 * changes scroll state depending on param-index
	 * @param {Number} index
	 * @returns {undefined}
	 */
	updateScrollState: function(index) {
		if(index <= this.typeaheadItemsSize) {
			this.element.setStyle({
                overflowY: 'hidden'
            });
		} else {
			this.element.setStyle({
                overflowY: 'scroll'
            });
		}
	},

	/** 
	 * @param {Number} index
	 * @returns {String} innerHTML of node at spcified position
	 */
	getAt: function(index) {
		return this.element.dom.childNodes[index].innerHTML;
	},

	/**
	 * shows suggestion box with required nodes in it
	 * @param {String} word
	 * @returns {undefined}
	 */
	showAutocomplete: function(word) {
		word = word.replace('\n', ' ');
        
        if (word.length < 2) {
            return;
        }

        this.suggestionIndex = 1;
        this.clear(); //remove all childNodes 
        var suggestionExists = this.getSuggestions(word),
        	contentElement = this.controller.getContentElement();
        
        if (suggestionExists) {
            var pos = Dbms.Util.absolutePostion(contentElement);
            this.element.setStyle({
            	left: pos.left,
            	top: pos.top + Ext.get(contentElement).getHeight()
            });
            this.show();
        } else {
            this.hide();
        }
	},

	isVisible: function() {
		return this.element.isVisible()
	},

	/**
     * finds words from this.dictionary witch contains {word} as it's part,
     * and attach it as html-dom-element
     * @returns {Boolean}, true if atleast one suggestion exists,
     * otherwise false
     */
    getSuggestions: function(word) {
        var originWord = word,
            empty = true;
        
        word = word.toLowerCase();
        for (var i=0, j=0; i<this.dictionary.length; i++) {
            var item = this.dictionary[i];

            if (this.isMysqlKeyword(item, word) || this.isDatabaseKeyword(item, word)) {
            	// because of words can be the same but in diffrent help_category_id
            	// we need a check to prevent duplicates
            	if(this.element.select("[sv='" + item.name.toLowerCase() + "']").getCount() == 0) {
	                this.add({
	                	sv: item.name.toLowerCase(),
	                    html: item.name
	                });

	                empty = false;
	                j++;
	            }
            }
        }

        this.updateScrollState(j);

        if (j == 1 && this.getAt(0) === originWord) {
            empty = true;
        }

        return !empty;
    },

    /**
     * @param {Object} item dictionary-item
     * @param {String} word 
     * @returns {Boolean} true if word is a mysql-keywork like "select, insert and so on"
     */
    isMysqlKeyword: function(item, word) {
        return (item.weight === 0 && item.name.toLowerCase().substr(0, word.length).indexOf(word) != -1);
    },

    /**
     * @param {Object} item dictionary-item
     * @param {String} word 
     * @returns {Boolean} true if word is a database-keywork like "`mysql`"
     */
    isDatabaseKeyword: function(item, word) {
        if (word[0] == '`') { //means user inputs `[nums], so it can be a database keyword, check it
            if (word.length <= 2) {
                return false;
            }

            if (item.name.toLowerCase().substr(0, word.length).indexOf(word) != -1) {
                return true;
            }

            return false;
        }


        if (item.name.toLowerCase().substr(1, word.length).indexOf(word) != -1) {
            return true;
        }

        return false;
    },

    /**
     * @param {Array} dictionary
     * @returns {undefined}
     */
    bindDictionary: function(dictionary) {
        this.dictionary = dictionary;
    },

    incSelectedIndex: function() {
    	if (this.selectedIndex < this.element.dom.childNodes.length - 1) {
            this.selectedIndex ++;
        }

        this.scrollTypeahead();
    },

    decSelectedIndex: function() {
    	if (this.selectedIndex > 0) {
            this.selectedIndex--;
        }

        this.scrollTypeahead();
    },

    scrollTypeahead: function() {
        var selectedItem = this.element.dom.childNodes[this.selectedIndex];
        this.element.scrollChildIntoView(selectedItem, false);
    },

    getValue: function() {
    	return this.element.query(".select-hover")[0].innerHTML;
    },

    select: function() {
    	if (this.selectedIndex == -1) {
            this.selectedIndex = 0;
        }

        var selectedItem = this.element.dom.childNodes[this.selectedIndex];

        for (var i=0; i<this.element.dom.childNodes.length; i++) {
            this.element.dom.childNodes[i].className = '';
        }

        selectedItem.className = 'select-hover';
    },

    appendSelected: function() {
    	if(this.selectedIndex >= 0) {
    		return true;
		}

		return false;
    }
});