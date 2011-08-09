/*
 * @namespace Dbms.DataManagement.BaseManager
 * @class ViewController
 */
Dbms.DataManagement.BaseManager.ViewController = function(){
	this.view = false;
	this.viewColumns = []
	this.filters = new Ext.util.MixedCollection;
	
	this.headerFilterPlugin = new Ext.ux.grid.GridHeaderFilters({
        highlightOnFilter : true,
		applyMode 	      : 'enter',
        highlightColor    : '#E2E2E2'
    });
	
	Dbms.Core.MessageBus.addListener('Dbms.DataManagement.BaseManager.BuildView', this.buildView, this);
}
Dbms.DataManagement.BaseManager.ViewController.prototype = {
	/**
	 * @param o {object}, decoded server-response
	*/
	buildView : function(){
		this.buildColumns();
		this.reorderer = new Ext.ux.ToolbarReorderer({});
		this.droppable = new Ext.ux.ToolbarDroppable({});
		
		this.view = new Ext.grid.EditorGridPanel({
			ref          : "../gridPanel",
			plugins      : [this.headerFilterPlugin],
			store        : Ext.StoreMgr.get(this.uniqueKey),
			tbar         : new Ext.Toolbar({
				plugins : [this.reorderer, this.droppable],
				items : []
			}),
			clicksToEdit : 1,
			loadMask     : true,
			defaults     : {
				sortable : true
			},
			columns : this.viewColumns,
			listeners : {
				filterupdate : this.filterChanged,
				scope : this,
				render : function(){
					var dragProxy = this.view.getView().columnDrag,
					    ddGroup  = dragProxy.ddGroup;
                
						this.droppable.addDDGroup(ddGroup);
				}
			}
		});
		
		this.view.getTopToolbar().on('reordered', this.moveColumns, this);
		Dbms.Core.MessageBus.on('Dbms.DataManagement.ClearFilters'+this.uniqueKey, this.clearFilters, this.view);
		this.attachSort();
		
		return this.view;
	},
	clearFilters : function(){
		var filterPlugin = this.plugins[0];
		for(var i in filterPlugin.filterFields){
			var filerField = filterPlugin.filterFields[i];
			filerField.setValue&&filerField.setValue('');
		};
		
		this.store.baseParams.filter = '';
		this.store.load();
	},
	moveColumns : function(button, tbar){
		//first get current moved item index,
		for(var i=0;i<tbar.items.length;i++){
			if(tbar.items.items[i].text == button.text) break;
		}
		
		var movedField = tbar.items.items[i];
		
		var colModel = this.view.getColumnModel();
		
		//second get index of current column-header
		for(var j=0;j<colModel.config.length;j++){
			var header = colModel.config[j].dataIndex;
			
			if(header == movedField.text){
				colModel.moveColumn(j, i+1);
			}
		}
	},
	enabledFilters : function(){
		return this.filters.filterBy(function(i){
			if(i != '') return true;
			return false;
		},this);
	},
	filterChanged : function(fieldName, fieldValue){
		var field = this.filters.get(fieldName);
		
		if(!field){
			this.filters.add(fieldName,fieldValue);
		} else {
			this.filters.replace(fieldName, fieldValue);
		}
		
		if(this.view.colModel.findColumnIndex(fieldName) != this.view.colModel.config.length - 1){
			return ;
		}
		
		//var totalCount = this.avaibleFiltersCount();
		var enabledFilters = this.enabledFilters();
		
		for(var i=0, coma=' AND ', result = '';i<enabledFilters.length;i++){
			var filterValue = enabledFilters.items[i];
			var filterKey = enabledFilters.keys[i];
			
			if(i == enabledFilters.length-1 || enabledFilters.length == 1){
				coma = '';
			}
			
			result += filterKey+' '+filterValue+coma;
		}
		
		this.view.store.baseParams.filter = result;
		this.view.store.load();
	},
	doSort : function(){
		this.store.sort(this.getSorters(), 'ASC');
	},
	chageSortOrder : function(button,  changeDirection){
		changeDirection = changeDirection || true;
		var sortData = button.sortData,
            iconCls  = button.iconCls;
        
        if (sortData != undefined) {
            if (changeDirection !== false) {
                button.sortData.direction = button.sortData.direction.toggle("ASC", "DESC");
                button.setIconClass(iconCls.toggle("sort-asc", "sort-desc"));
            }
            
			this.store.sort(this.getSorters(), 'ASC');
        }
	},
	getSorters : function(){
		var sorters = [];
        
        Ext.each(this.view.getTopToolbar().findByType('button'), function(button) {
            sorters.push(button.sortData);
        }, this);
        
        return sorters;
	},
	attachSort : function(){
		var store = this.view.store;
		var toolbarChilNodes = []
		store.fields.each(function(item,all,idx){
			var btn = new Ext.Button({
				xtype : 'text',
				text  : item.name,
				sortData : {
					field     : item.name,
					direction : "ASC"
				},
				iconCls: 'sort-asc',
				reorderable: true
			});
			
			btn.on('click', this.chageSortOrder, this);
			toolbarChilNodes.push(btn);
		},this);
		this.view.doLayout();
		this.view.getTopToolbar().add(toolbarChilNodes);
	},
	primaryKeyRenderer : function(val){
		return "sdsd"+val;
	},
	/**
	 * creates fields for store
	*/
	buildColumns : function() {
		this.viewColumns.push(new Ext.grid.RowNumberer({
			width  : 30,
			header : '№'
		}));
		for(var i=0; i<this.desc.columns.length; i++) {
			var columnDesc = this.desc.columns[i];
			var column = {
				header : columnDesc['COLUMN_NAME'],
				filter : {
					xtype : "textfield"
				},
				dataIndex : columnDesc['COLUMN_NAME']
			};
			
			if(columnDesc.COLUMN_KEY == 'PRI'){
				column.header = '<img src="../../../images/icons/primary_key.png" style="height:15px;margin-bottom:-4px"/>'+column.header;
			}
			
			switch(columnDesc['DATA_TYPE']){
				case 'int'	   :
				case 'float'   :
				case 'tinyint' :
				case 'bigint'  : {
					Ext.applyIf(column, this.createNumberField(columnDesc));
					break;
				}
				case 'enum' :{
					Ext.applyIf(column, this.createEnumField(columnDesc));
					break;
				}
				
				case 'date' : {
					Ext.applyIf(column,
								this.createDateField(columnDesc, 'Y-m-d'));
					break;
				}
				
				case 'datetime' : {
					Ext.applyIf(column,
								this.createDateField(columnDesc, 'Y-m-d H:i:s'));
					break;
				}
				
				case 'timestamp' : {
					Ext.applyIf(column,
								this.createDateField(columnDesc, 'Y-m-d H:i:s'));
					break;
				}
				case 'year' : {
					Ext.applyIf(column,
								this.createDateField(columnDesc, 'Y'));
					break;
				}
				case 'varchar' :
				case 'char'    :
				case 'text'    : 
					Ext.applyIf(column,
								this.createStringField(columnDesc));
					break;
				default : {
					Ext.applyIf(column, {
						editor : {
							xtype : "textfield"
						}
					});
				}
			}
			column.sortable = false;
			this.viewColumns.push(column);
		}
	},
	/**
	 * return object of valid Ext.component to represent
	 * numbers
	*/
	createNumberField : function(columnDesc){
		var realTypes = ['float','double']
		var numberField = {
			xtype   	  : "numberfield",
			allowDecimals : realTypes.indexOf(columnDesc['DATA_TYPE']) == -1 ? false : true
		}
		
		if(realTypes.indexOf(columnDesc['DATA_TYPE']) == -1){
			numberField.maxLength = columnDesc['NUMERIC_PRECISION']
		} else {
			//it's a real number
			numberField.maxLength = columnDesc['NUMERIC_PRECISION']+columnDesc['NUMERIC_SCALE']+1
			numberField.decimalPrecision = columnDesc['NUMERIC_SCALE'];
		}
		
		return {
			editor : numberField
		};
	},
	createEnumField : function(columnDesc) {
		var config = columnDesc['COLUMN_TYPE'];
		var enums = config.substring(config.indexOf('(')+1, config.indexOf(')')).split(',');
		
		var data = [];
		for(var i=0; i<enums.length; i++){
			data.push([enums[i].substr(1,enums[i].length-2)]);
		}
		
		var store = new Ext.data.ArrayStore({
			fields   : ['name'],
			data     : data
		});
		
		return {
			editor : {
				xtype 	      : 'combo',
				mode          : 'local',
				store  		  : store,
				displayField  : 'name',
				valueField    : 'name',
				triggerAction : 'all'
			}
		}
	},
	createDateField : function(columnDesc, dateFormat){
		return {
			editor : {
				xtype  : 'datefield',
				format : dateFormat 
			},
			renderer : this.dateRenderer(dateFormat)
		}
	},
	createStringField : function(columnDesc) {
		return {
			editor : {
				xtype     		  : 'textarea',
				autoScroll		  : false,
				preventScrollbars : true,
				grow 	  		  : true,
				growMax           : 1500,
				maxLength 		  : columnDesc['CHARACTER_MAXIMUM_LENGTH'] 
			}
		}
	},
	dateRenderer : function(dateFormat) {
		return function(v) {
			if(Ext.isDate(v)) {
				return Ext.util.Format.date(v, dateFormat);
			}
			
			if(!!!v) {
				return '';
			}
			
			var parsedDate = Date.parseDate(v, dateFormat);
			return Ext.util.Format.date(v, dateFormat);
		}
	}
}