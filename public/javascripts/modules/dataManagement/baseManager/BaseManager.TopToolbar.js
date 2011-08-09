Dbms.DataManagement.BaseManager.TopToolbar = Ext.extend(Ext.Toolbar, {
	constructor : function() {
		Dbms.DataManagement.BaseManager.TopToolbar.superclass.constructor.call(this, {
			items : [{
				xtype : 'button',
				ref   : 'sqlQueryBtn',
				text  : 'SQL patterns',
				menu : [{
					text    : 'SELECT ... WHERE',
					handler : this.sqlSelected("SELECT <qColumns><br>FROM <databaseName>.<tableName><br>WHERE 1",'select'),
					scope   : this
				},{
					text    : 'INSERT ... VALUES',
					handler : this.sqlSelected("INSERT INTO <databaseName>.<tableName> (<qColumns>) <br>VALUES ()",'insert'),
					scope   : this
				},{
					text    : 'UPDATE ... SET',
					handler : this.sqlSelected("UPDATE <databaseName>.<tableName><br>SET <qColumns>",'update'),
					scope   : this
				},{
					text    : 'DELETE ... WHERE',
					handler : this.sqlSelected("DELETE FROM <databaseName>.<tableName><br>WHERE <qColumns>",'delete'),
					scope   : this
				}]
			},'->',{
				xtype : 'button',
				ref   : 'pageSizeBtn',
				style : {
					marginRight : 5
				},
				text  : 'Page Size',
				menu : [{
					text    : '20',
					checked : false
				},{
					text    : '50',
					checked : false
				},{
					text    : '100',
					checked : false
				},{
					text    : '200',
					checked : false
				}]
			}]
		});
		
		this.pageSizeBtn.menu.on('click', this.onPageSizeItemClicked, this);
		this.select();
	//	this.attachListeners();
	},
	//attachListeners : function() {
	//	this.on('afterrender', this.onAfterRender, this);
	//},
	//onAfterRender : function() {
	//	Dbms.Core.MessageBus.on('Dbms.TableMgr.ChangePageSize'+this.ownerCt.uniqueKey, this.changePageSizeTitle, this);
	//},
	changePageSizeTitle : function(){
		this.select();
	},
	select : function(){
		this.pageSizeBtn.menu.items.each(function(item) {
			if(item.text-0 == Dbms.Constants.DEFAULT_PAGE_SIZE){
				item.setChecked(true);
			} else {
				item.setChecked(false);
			}
		},this);
		
	},
	onPageSizeItemClicked : function(menu, btn, e){
		Dbms.Constants.DEFAULT_PAGE_SIZE = btn.text-0;
		this.select()
		Dbms.Core.MessageBus.fireEvent('Dbms.TableMgr.ChangePageSize'+this.ownerCt.uniqueKey, {
			size : Dbms.Constants.DEFAULT_PAGE_SIZE
		});
	},
	sqlSelected : function(sqlPattern, type) {
		sqlPattern;
		type;
		return function(menu,btn){
			this.SqlMgr.sqlSelected(sqlPattern,type);
		}
	}
});

Ext.reg('Dbms.DataManagement.BaseManager.TopToolbar', Dbms.DataManagement.BaseManager.TopToolbar);