Dbms.RoutineManagement.BaseManager.Store = Ext.extend(Ext.data.JsonStore, {
	constructor : function(config) {
		Dbms.RoutineManagement.BaseManager.Store.superclass.constructor.call(this, Ext.applyIf({
			storeId    : config.uniqueKey,
			proxy      : new Ext.data.HttpProxy({
				url    : this.getProxyUrl(),
				method : this.getProxyMethod()
			}),
			remoteSort : true,
			root       : 'rows',
			autoLoad   : true,
			fields 	   : this.getFields()
		}, config));
		
		this.on('load', 		 this.onLoadEventHandler,     this);
		this.on('loadexception', this.onLoadExceptionHandler, this);
	},
	getFields : function() {
		return [];
	},
	getProxyUrl : function() {
		return ''
	},
	getProxyMethod : function() {
		return "POST";
	},
	onLoadEventHandler : function() {
		Dbms.Core.MessageBus.fireEvent('Dbms.RoutineStore.load' + this.storeId, this);
		/*var elId = Ext.id();
		var procSourceCodeEl = this.view.add({
			id    : elId,
			style : 'white-space:pre;font-size:13px;'
		});
		var sourceCode = this.getAt(0).get('ROUTINE_DEFINITION');
		var highlightedCode = ac.highlighter.highlight(sourceCode);
		ac.element.update(highlightedCode);
		this.view.doLayout();
		elId =  procSourceCodeEl.body.dom.id;
		
		var root = Ext.getDom(elId);
		while(root.firstChild) root.removeChild(root.firstChild);
		ac = new Dbms.Autocomplete.Controller(elId, Ext.StoreMgr.get('Autocomplete.KeywordsStore').list());*/
	},
	onLoadExceptionHandler : function(request, action, resp) {
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
			msg : resp.responseText
		});
	}
});


//
/*var editor = CodeMirror(document.getElementById(elId), {
			lineNumbers: true,
			matchBrackets: true,
			indentUnit: 4,
			mode: "text/x-plsql",
			onKeyEvent: function(k, e) {
				if(e.type == 'keydown') {
					if(editor.autocomplete.suggestionBox.isVisible()){
						// move in typeahead
						switch(e.keyCode){
							// up
							case 38 : {
								if(editor.selectedIndex > 0) {
									editor.selectedIndex--;
								}
								
								var selectedItem = editor.autocomplete.suggestionBox.dom.childNodes[editor.selectedIndex];
								editor.autocomplete.suggestionBox.scrollChildIntoView(selectedItem, false);
		
								for(var i=0;i<editor.autocomplete.suggestionBox.dom.childNodes.length;i++){
									editor.autocomplete.suggestionBox.dom.childNodes[i].className = '';
								}
		
								selectedItem.className = 'select-hover';
								e.preventDefault();
								return false;
							}
							
							case 40 : {
								if(editor.selectedIndex < editor.autocomplete.suggestionBox.dom.childNodes.length-1){
									editor.selectedIndex ++;
								}
								
								var selectedItem = editor.autocomplete.suggestionBox.dom.childNodes[editor.selectedIndex];
								editor.autocomplete.suggestionBox.scrollChildIntoView(selectedItem, false);
		
								for(var i=0;i<editor.autocomplete.suggestionBox.dom.childNodes.length;i++){
									editor.autocomplete.suggestionBox.dom.childNodes[i].className = '';
								}
		
								selectedItem.className = 'select-hover';
								e.preventDefault();
								return false;
							}
							
							case 13 : {
								e.stop();
								var cur = editor.getCursor(false), token = editor.getTokenAt(cur);
								editor.replaceRange(editor.autocomplete.suggestionBox.dom.childNodes[editor.selectedIndex].innerHTML.toString(), {
									line: cur.line, ch: token.start
								}, {
									line: cur.line, ch: token.end
								});
								
								editor.autocomplete.hideSuggestionBox();
								
								return false;
							}
							// tab
							case 9 : {
								e.preventDefault();
								e.stop();
								editor.tabPressed = true;
								var cur = editor.getCursor(false), token = editor.getTokenAt(cur);
								editor.replaceRange(editor.autocomplete.suggestionBox.dom.childNodes[0].innerHTML.toString(), {
									line: cur.line, ch: token.start
								}, {
									line: cur.line, ch: token.end
								});
								
								editor.autocomplete.hideSuggestionBox();
								
								return false;
							}
							
							default : {
								editor.autocomplete.hideSuggestionBox();
							}
						}
					} else {
						editor.autocomplete.hideSuggestionBox();
					}
				}
				
				editor.selectedIndex = -1;
				
				if (e.keyCode == 32 && (e.ctrlKey || e.metaKey) && !e.altKey) {
					e.stop();
					
					var cur = editor.getCursor();
					var currentSelPos = cur.ch;
					var lineChildNodes = Ext.query('.CodeMirror-lines')[0].firstChild.childNodes[1].childNodes[cur.line].childNodes;
					var total = 0;
					var contextEl = false;
					
					for(var i=0;i<lineChildNodes.length;i++){
						var child = lineChildNodes[i];
						
						if(!child.textContent) {
							var content = child.textContent.replace('\t','    ');
							total += child.textContent.length;
						} else {
							total += child.textContent.length;
						}
						
						if(total >= currentSelPos) {
							contextEl = lineChildNodes[i];
							break;
						}
					}
					
					if(contextEl && contextEl.textContent && contextEl.textContent.length > 1){
						editor.autocomplete.autocomplete(contextEl.textContent, contextEl, contextEl);
						
						if(editor.autocomplete.suggestionBox.dom.childNodes.length == 1){
							var cur = editor.getCursor(false), token = editor.getTokenAt(cur);
							editor.replaceRange(editor.autocomplete.suggestionBox.dom.childNodes[0].innerHTML.toString(), {
								line: cur.line, ch: token.start
							}, {
								line: cur.line, ch: token.end
							});
							
							editor.autocomplete.hideSuggestionBox();
						}
					}
					
					return false;
				}
				
				return false;
				//editor.autocomplete.hideSuggestionBox();
			}
		});*/
		
		//var sourceCode = this.getAt(0).get('ROUTINE_DEFINITION');
		//var highlightedCode = ac.highlighter.highlight(sourceCode);
		//ac.element.update(highlightedCode);
		//editor.setValue(sourceCode);
		//editor.autocomplete = new Dbms.Autocomplete.Typeahead(this.baseParams.database_name);
		//editor.autocomplete.setDictionary();
		//Dbms.Autocomplete.Store = Dbms.Autocomplete.Store || new Ext.util.MixedCollection();
		//Dbms.Autocomplete.Store.add(id, editor);
		
			//this.view.south.add(new Ext.Toolbar({
			//	//layoutConfig : {
			//	//	columns  : 3
			//	//},
			//	//layout   : 'table',
			//	//defaults : {
			//	//	xtype : "box",
			//	//	width : 400,
			//	//	style : 'font-size:12px'
			//	//},
			//	//tbar : {
			//		//xtype : 'toolbar',
			//		items : ['->',{
			//			xtype : 'button',
			//			text  : 'switch theme'
			//		}]
			//	//}
			//}));
		/***
		 *items  : [{
				autoEl : {
					tag  : 'div',
					html : 'CHARACTER_SET_CLIENT : ' + this.getAt(0).json['CHARACTER_SET_CLIENT']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'COLLATION_CONNECTION : ' + this.getAt(0).json['COLLATION_CONNECTION']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'CREATED : ' + this.getAt(0).json['CREATED']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'LAST_ALTERED : ' + this.getAt(0).json['LAST_ALTERED']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'DATABASE_COLLATION : ' + this.getAt(0).json['DATABASE_COLLATION']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'DEFINER : ' + this.getAt(0).json['DEFINER']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'ROUTINE_TYPE : ' + this.getAt(0).json['ROUTINE_TYPE']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'PARAMETER_STYLE : ' + this.getAt(0).json['PARAMETER_STYLE']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'ROUTINE_BODY : ' + this.getAt(0).json['ROUTINE_BODY']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'ROUTINE_COMMENT : ' + this.getAt(0).json['ROUTINE_COMMENT']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'ROUTINE_NAME : ' + this.getAt(0).json['ROUTINE_NAME']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'ROUTINE_SCHEMA : ' + this.getAt(0).json['ROUTINE_SCHEMA']
				}
			}, {
				autoEl : {
					tag  : 'div',
					html : 'SPECIFIC_NAME : ' + this.getAt(0).json['SPECIFIC_NAME']
				}
			}
			this.view.south.doLayout();
		 ***/
		