Dbms.DataManagement.BaseManager.StoreController = function() {}
Dbms.DataManagement.BaseManager.StoreController.prototype = {
	init : function(o) {
		
	},
	/**
	 * create new store and add it to Dbms.TableMgr
	 * @param o {object}
	*/
	buildStore : function() {
		this.createStoreFields();
		
		this.store = new Ext.data.JsonStore({
			storeId       : this.uniqueKey,
			baseParams    : this.baseParams,
			proxy         : new Ext.data.HttpProxy(this.proxy),
			remoteSort 	  : true,
			root       	  : 'rows',
			totalProperty : 'count',
			autoLoad   	  : true,
			fields 		  : this.fields
		});
		
		this.store.on('load', this.onLoadEventHandler, this.store);
		this.store.on('loadexception', this.onLoadExceptionHandler, this.store);
		Dbms.Core.MessageBus.on('Dbms.TableMgr.ChangePageSize'+this.uniqueKey, this.changePageSize, this.store);
		
		return this.store;
	},
	onLoadEventHandler : function(){
		var execTime = this.reader.jsonData.executed_time;
		var uniqueKey = this.storeId;
		
		Ext.WindowMgr.each(function(item){
			if(item.uniqueKey == uniqueKey){
				item.bottomToolbar.executedTime.setText(execTime+' sec');
				return;
			}
		},this);
	},
	/**
	 * performs store.load()
	*/
	load : function(){
		this.store.load();
	},
	getStore : function(){
		return this.store;
	},
	onLoadExceptionHandler : function(request, action, resp){
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
			msg : resp.responseText
		});
	},
	/**
	 * creates fields for store
	*/
	createStoreFields : function(){
		this.fields = [];
		
		for(var i=0;i<this.desc.columns.length;i++){
			var column = this.desc.columns[i];
			var field = {
				name : column['COLUMN_NAME']
			};
			
			switch(column['DATA_TYPE']){
				case 'int':
				case 'float':
				case 'tinyint':
				case 'binary':
				case 'bigint':{
					field.type = 'int';
					break;
				}
				case 'date': {
					field.dateFormat = 'Y-m-d';
					field.type = 'date';
					break
				}
				case 'datetime': {
					field.dateFormat = 'Y-m-d H:i:s';
					field.type = 'date';
					field.format = 'Y-m-d H:i:s';
					field.convert = function(v) {
						var d = new Date(v);
						return Ext.util.Format.date(d, 'Y-m-d H:i:s');
					}
					break
				}
				default : {
					field.type = 'string';
				}
			}
			this.fields.push(field);
		}
	},
	changePageSize : function() {
		this.baseParams.start = 0;
		this.baseParams.limit = Dbms.Constants.DEFAULT_PAGE_SIZE;
	}
	
}