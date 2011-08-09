Ext.ns('Dbms.Help');

Dbms.Help.GridBuilder = function(){}

Dbms.Help.GridBuilder.prototype = {
	build : function(cfg){
		this.gridCfg = {};
		
		this.expander = new Ext.ux.grid.RowExpander({
			tpl : new Ext.XTemplate(
				'<tpl for=".">'+
					'<p class="help-desc">'+
						'{description}'+
						'<tpl if="example.length > 0">'+
							'<br/><br/><b>Example:<br/>{example}</b>'+
						'</tpl>'+
					'</p>'+
				'</tpl>'
			)
		});
	
		Ext.apply(this.gridCfg, {
			store   	   : cfg.store,
			rowContextMenu : new Ext.menu.Menu({
								items : [{
									text 	: "visit dev.mysq.doc",
									/**
									 * @param {Ext.menu.Menu} me
									*/
									handler : function(me){
										var docs = me.parentMenu.selectedItem.get('description');
										// get mysq.doc link
										try {
											var link = docs.match(Dbms.Constants.MYSQL_LINK_RE)[0];
											link = link.substr(0, link.indexOf('.html')+5);
											window.open(link);
										} catch(e){}
									}
								}]
			}),
			columns 	   : [this.expander,{
				header 	  : 'name',
				dataIndex : "name"
			}],
			viewConfig : {
				forceFit : true
			},
			plugins   : this.expander,
			listeners : {
				/**
				 * @param {Ext.grid.GridPanel} me
				*/
				rowcontextmenu : function(me,rowIndex, e){
					me.rowContextMenu.selectedItem = me.store.getAt(rowIndex);
					me.rowContextMenu.showAt(e.getXY());
					e.preventDefault();
					
					return false;
				}
			} 
		});
		
		return new Ext.grid.GridPanel(this.gridCfg);
	}
}