Ext.ns('Dbms.Autocomplete');
/**
 * @class Autocomplete.Controller
 * provides autocomplete
 *
 * @param id {string}, id of the element you want to attach autocomplete
 * @param {Ext.data.Store} dictionary
 * @param {String} highlightText text that should be added rendered and highlighted
 */
Dbms.Autocomplete.Controller = Ext.extend(function() {}, {

    /**
     * @property {Dbms.Autocomplete.SuggestionBox}
     * @description
     * represents a selected index in suggestion-box
     */ 
    suggestionBox: null,

	/**
	 * @property
	 * @description
	 * element that represents a root element for all text
	 */
	element: null,

	/**
	 * @property
	 * @description
	 * element that represents a single text-item, means key-word, number, and so on
	 */
	contentElement: null,

    /**
     * @property {int} currentRow index of row where cursor is standing
     */
    currentRow: 1,

    /**
     * @param {Number} elementId
     * @param {Ext.data.Store} store
     */
    constructor: function(elementId, store, highlightText) {
        this.store = store;
        this.prepareElement(elementId);
        this.attachEventListners();
        this.initKeyHandlers();
        this.highlightText = highlightText;
        this.highlighter = new Dbms.Autocomplete.Highlighter(this);
        this.suggestionBox = new Dbms.Autocomplete.SuggestionBox(this, store);
        this.scroller = new Dbms.Autocomplete.Scroller({
            controller: this
        });
    },

    /** 
     * initializes key handlers
     * @returns {undefined}
     */
    initKeyHandlers: function() {
        this.keyHandlers = [
        	'BackspaceHandler', 
        	'DefaultHandler', 
        	'CursorHandler', 
        	'TabHandler', 
        	'WhitespaceHandler', 
        	'EnterHandler'
        ];

        for (var i=0; i<this.keyHandlers.length; i++) {
            var handler = this.keyHandlers[i],
            	key = handler.charAt(0).toLowerCase() + handler.substr(1);

            this[key] = new Dbms['Autocomplete'][handler]({
                controller: this,
                rootEl: this.element
            });
        }
    },

    /**
     * @returns {Ext.Element}
     */
    getContentElement: function() {
        return this.contentElement;
    },

    /**
     * @returns {Ext.Element} element that holds all text
     */
    getRootElement: function() {
        return this.element;
    },

    /**
     * @param {Ext.Element} newContentEl
     * @returns {undefined}
     */
    setContentElement: function(newContentEl) {
        this.contentElement = newContentEl;
    },

    /**
     * create element and apply special required attrs
     * @returns {void}
     */
    prepareElement: function(id) {
        this.element = Ext.get(id);
        this.element.dom.contentEditable = true; // for chrome
        this.element.dom.isContentEditable = true; //for mozzilla
        this.element.update("Type your sql-statement here...");
        this.element.setStyle({
            whiteSpace: 'pre',
            fontSize: '13px',
            overflowY: 'auto',
            fontFamily: 'Inconsolata, Monaco, Consolas, "Andale Mono", "Bitstream Vera Sans Mono", "Courier New", Courier, monospace',
            letterSpacing: '1px'
        });

        this.element.addClass('sql-autocomplete-body');
        Ext.get(this.element.dom.parentNode.id).setStyle({
            overflowY: 'auto'
        });

        this.element.parent().mask('Loading data for autocomplete ...');
        //this.element.on('paste', this.onPasteEventHandler, this);
    },
    onPasteEventHandler: function(e, d, o) {
        e.preventDefault();

        var content = e.browserEvent.clipboardData.getData('text/plain');
        var highlightedContent = this.highlighter.highlight(content);
        this.element.dom.innerHTML = highlightedContent;

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNode(this.element.dom.lastChild.lastChild);
        range.setStart(this.element.dom.lastChild.lastChild, 1);
        range.setEnd(this.element.dom.lastChild.lastChild, 1);

        this.undelitedLength = this.element.dom.innerHTML.length;
        selection.removeAllRanges();
        selection.addRange(range);

        return false;
    },

    /**
     * set all instance variables default values
     * @returns {undefined}
     */
    resetAutocompleteState: function() {
        this.lastContextElement = false;
        this.currentRow = 1;
        this.enter = false;
        this.maxRowNumber = 1;
        this.isNew = true;
    },

    /*
     * hides suggestion box
     * @returns {undefined}
     */
    hideSuggestionBox: function() {
        this.suggestionBox.hide();
    },

    /**
     * removes all children from suggestion box
     * @returns {undefined}
     */
    clearSuggestion: function() {
        this.suggestionBox.clear();
    },

    setCurrenRow: function(newCurrentRow) {
        this.currentRow = newCurrentRow;
    },

    setCursor: function(row, position) {
        var selection = window.getSelection();
        var range = document.createRange();
        //create new text node with autocomplete-context element
        //append new span
        var spanNode = Ext.DomHelper.append(this.element, {
            tag: 'span',
            class: 'row' + row
        });

        this.element.dom.appendChild(spanNode);

        range.selectNodeContents(this.element.dom);
        range.setStart(this.element.dom, position);
        range.setEnd(this.element.dom, position);

        this.lastContextElement = spanNode;
        this.firstContextNode = spanNode;
        this.startLeftOffset = Ext.get(spanNode).getX();

        selection.removeAllRanges();
        selection.addRange(range);
    },

    /**
     * @param word {string}, part of word you want to complete
     */
    showAutocomplete: function(word) {
        this.suggestionBox.showAutocomplete(word);
    },
    
    /**
     * attach all required event-listeners for autocomplete-element
     */
    attachEventListners: function() {
        this.element.on('keypress', this.onKeyPressEventHandler, this);
        this.element.on('keydown', this.onKeyDownEvenHandler, this);
        this.element.on('blur', this.hideSuggestionBox, this);
        this.element.on('click', this.onElementClick, this);
        this.store.on('load', this.bindDictionary, this);
    },

    bindDictionary: function(store) {
        this.dictionary = this.store.list();

        if (this.highlightText !== undefined) {
            this.element.update(this.highlighter.highlight(this.highlightText));
            delete this.highlightText;
        }

        this.element.parent().unmask();
        this.suggestionBox.bindDictionary(this.dictionary);
    },

    onElementClick: function(e) {
        var cmp = Ext.getCmp(this.element.id + '-cmp');
        var selection = window.getSelection();
        var range = document.createRange();

        if (cmp && cmp.isDefaultText) {
            this.element.dom.removeChild(this.element.dom.firstChild); //remove default text
            cmp.isDefaultText = false;

            //create new autocomplete-context element
            //var context = this.createNewContextElement();
            //this.firstContextNode = context;
            this.createNewContentElement();
            this.contentElement.innerHTML = '\n';
            this.element.dom.innerHTML = '<p>' + this.element.dom.innerHTML + '</p>';
            range.selectNodeContents(this.element.dom.firstChild.childNodes[0]);
            range.setStart(this.element.dom.firstChild.childNodes[0], 0);
            range.setEnd(this.element.dom.firstChild.childNodes[0], 0);

            this.undelitedLength = this.element.dom.innerHTML.length;
            //this.startLeftOffset = Ext.get(context).getX();
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            var baseNode = selection.baseNode;

            if (baseNode.nodeName == '#text') {
                baseNode = baseNode.parentNode;
            }

            if (baseNode.className == 'tabElement') {
                var offset = 0;

                if (selection.baseOffset >= 2) {
                    offset = 1;
                }

                selection.removeAllRanges();
                range.selectNode(baseNode);
                range.setStart(baseNode, offset);
                range.setEnd(baseNode, offset);
                selection.addRange(range);
            }
        }
    },
    
    onKeyDownEvenHandler: function(e) {
        switch (e.keyCode || e.charCode) {
            //backspace
            case 8: {
                this.backspaceHandler.process(e);
                //this.onBackspace(e);
                break;
            }
            //tab
            case 9: {
                this.tabHandler.process(e);
                break;
            }
            case 37:
            case 38:
            case 39:
            case 40: {
                this.cursorHandler.process(e);
                //this.onUpKeyPressed(e);
                break;
            }
            //enter
            case 13: {
                this.enterHandler.process(e)
                break;
            }
            default: {
                this.hideSuggestionBox();
                return false;
            }
        }

        return true;
    },

    createNewContentElement: function() {
        this.contentElement = Ext.DomHelper.append(this.element, {
            tag: "span",
            cls: 'contentElement',
            id: Ext.id()
        });
    },

    createNewContextElement: function() {
        this.contextElement = Ext.DomHelper.append(this.element, {
            tag: 'span',
            class: 'row' + this.currentRow,
            id: Ext.id()
        });

        return this.contextElement;
    },

    /*
     * set this.contentElement and this.contextElement
     * back to default
     */
    useDefaultNodes: function() {
        //this.contextElement = this.element.dom.childNodes[0].childNodes[0];
        this.contentElement = this.element.dom.firstChild.firstChild;
    },

    deleteContextContentNodes: function() {
        var selection = window.getSelection();

        for (var i = 0; i < this.element.dom.childNodes.length; i++) {
            var item = this.element.dom.childNodes[i];

            if (item == this.contentElement) {
                var contextNodeToDelete = this.element.dom.childNodes[i - 1];
                var contentNodeToDelete = item;
                var deletePosition = i;

                break;
            } // if
        } // for
        //add selection
        selection.removeAllRanges();
        var range = document.createRange();
        //set new content and context elements
        this.contentElement = this.element.dom.childNodes[deletePosition + 2];
        this.contextElement = this.element.dom.childNodes[deletePosition + 1];

        // remove nodes
        this.element.dom.removeChild(contentNodeToDelete);
        this.element.dom.removeChild(contextNodeToDelete);

        // looking forward, if elements don't shoudl set context and content
        // element the previous of just been deleted dom-elements
        if ( !! !this.contentElement && !! !this.contextElement) {
            this.contextElement = this.element.dom.childNodes[deletePosition - 3];
            this.contentElement = this.element.dom.childNodes[deletePosition - 2];
            // set selection to the end of node, because of using previous nodes
            range.selectNodeContents(this.contentElement);
            range.setStart(this.contentElement, 1);
            range.setEnd(this.contentElement, 1);
        } else {
            // set selection to the start, because of using next noeds
            range.selectNodeContents(this.contentElement);
            range.setStart(this.contentElement, 0);
            range.setEnd(this.contentElement, 0);
        }

        selection.addRange(range);
        return false;
    },
    addNewRange: function(range) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    },
    onBackspace: function(e) {;
    },
    afterBackspace: function() {
        this.highlighter.highlightElement();
    },
    onTab: function(e) {
        e.preventDefault();
        var selection = window.getSelection();

        if (this.suggestionBox.isVisible()) {
            this.appendSelected(true);
            return false;
        }
        // user selects a container
        // and want's to type tab
        if (selection.focusNode.parentNode.id == this.element.dom.id || selection.focusNode.parentNode.id == this.element.dom.parentNode.id) {
            this.createNewContextElement();
            this.createNewContentElement();
        } else {
            for (var i = 0; i < this.element.dom.childNodes.length; i++) {
                // if content nodes macted
                // get context node to know current row
                if (selection.focusNode.parentNode == this.element.dom.childNodes[i]) {
                    this.lastContextElement = this.element.dom.childNodes[i - 1];
                    break;
                }
            }

            this.currentRow = this.lastContextElement.className.substr(3) - 0;
            this.lastContextElement = Ext.DomHelper.insertAfter(selection.focusNode.parentNode, {
                tag: 'span',
                cls: 'row' + this.currentRow,
                id: Ext.id()
            });

            this.contentElement = Ext.DomHelper.insertAfter(this.lastContextElement, {
                tag: "span",
                cls: 'tabElement',
                id: Ext.id()
            });
        }

        this.contentElement.innerHTML = "\t";
        this.highlighter.highlightElement();

        var range = document.createRange();
        range.selectNodeContents(this.contentElement);
        range.setStart(this.contentElement, 1);
        range.setEnd(this.contentElement, 1);

        this.addNewRange(range);
    },
    onWhiteSpace: function(e) {
        var selection = window.getSelection();
        e.preventDefault();
        // just in case
        this.hideSuggestionBox();
        // if contentnode starts with symbols in re class for current whitespace is contentNode
        // else whitespaceNode
        if (false && /^['`"]/.test(selection.focusNode.parentNode.innerHTML)) {
            this.contentElement.innerHTML += ' ';
        } else {
            var offset = selection.focusOffset;

            if (offset > 0) {
                // should divide current-selected word into two words
                var firstWordHtml = selection.focusNode.parentNode.innerHTML.substr(0, offset);
                var secondWordHtml = selection.focusNode.parentNode.innerHTML.substr(offset);
                this.contentElement.innerHTML = firstWordHtml;
                this.highlighter.highlightElement();
            }

            var lastContextElement = Ext.DomHelper.insertAfter(selection.focusNode.parentNode, {
                tag: 'span',
                cls: 'row' + this.currentRow,
                id: Ext.id()
            });
            var contentElement = Ext.DomHelper.insertAfter(lastContextElement, {
                tag: "span",
                cls: 'whitespaceElement',
                html: ' ',
                id: Ext.id()
            });

            this.highlighter.highlightElement();
            this.contentElement = contentElement;
            this.lastContextElement = lastContextElement;
        }

        var range = document.createRange();
        range.selectNodeContents(this.contentElement);
        range.setStart(this.contentElement, 1);
        range.setEnd(this.contentElement, 1);
        this.addNewRange(range);

        return false;
    },
    onUpKeyPressed: function(e) {
        e.preventDefault();

        if (this.suggestionBox.isVisible()) {
            this.decSelectedIndex();
            this.select();

            return false;
        }

        if (this.currentRow > 1) {
            this.currentRow--;
        }


        return true;
    },
    onDownKeyPressed: function(e) {
        e.preventDefault();

        if (this.suggestionBox.isVisible()) {
            this.incSelectedIndex();
            this.select();

            return false;
        }

        if (this.currentRow > 1) {
            this.currentRow++;
        }

        return false;
    },
    /*
     *  @param e {object}
     */
    onKeyPressEventHandler: function(e) {
        if ([8, 9, 38, 13].indexOf(e.keyCode || e.charCode) != -1) {
            return false;
        }

        switch (e.keyCode || e.charCode) {
            //whitespace
        case 32:
            {
                this.whitespaceHandler.process(e);
                break;
            }

            //any other key
        default:
            {
                this.defaultHandler.process(e);
                break;
            }
        }

        //this.highlight();
        //this.wnd.doLayout();
        //console.log(this.element.dom.childNodes);
        return true;
    },
    /**
     * function applues active class for element
     * that should be highlighted
     */
    select: function() {
        this.suggestionBox.select();
    },
    incSelectedIndex: function() {
       this.suggestionBox.incSelectedIndex();
    },
    decSelectedIndex: function() {
        this.suggestionBox.decSelectedIndex();
    },

    appendSelected: function(appendFirst, node) {
        if(!this.suggestionBox.isVisible() || !(this.suggestionBox.selectedIndex >= 0)) {
            return false;
        }

        var nodeText = node.textContent,
            flag = appendFirst || false,
            text = flag ? this.suggestionBox.getAt(0) : this.suggestionBox.getValue();

        //first get node color, depends on its weight
        var color = this.highlighter.getItemColorByTextValue(text);

        node.style.color = color;
        var ff = false;
        if (nodeText.indexOf('\n') != -1) {
            if (nodeText.indexOf('\n') == nodeText.length - 1) {
                node.innerHTML = text + '\n';
                ff = true;
            } else {
                node.innerHTML = '\n' + text;
            }

        } else {
            node.innerHTML = text;
        }

        var sel = window.getSelection();

        var range = document.createRange();
        range.selectNodeContents(node);

        if (ff) {
            range.setStart(node.firstChild, node.textContent.length - 1);
            range.setEnd(node.firstChild, node.textContent.length - 1);
        } else {
            range.setStart(node, 1);
            range.setEnd(node, 1);
        }

        sel.removeAllRanges();
        sel.addRange(range);
        
        this.hideSuggestionBox();
        this.highlighter.highlightElement();
        return true;
    }
});