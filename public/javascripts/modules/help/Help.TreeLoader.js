Ext.ns('Dbms.Help');
/**
 * @class TreeLoader
 *
 * controlls the process of creation
 * leafs
*/
Dbms.Help.TreeLoader = Ext.extend(Ext.tree.TreeLoader,{
    /**
     * construct
    */
    constructor : function(){
		Dbms.Help.TreeLoader.superclass.constructor.call(this, {
			url : Dbms.Actions.help.index
		});
		
		this.on('loadexception',this.onLoadExceptionEventHandler,this);
    },
    /**
     * function proccess server-response according
     * required data-structure
    */
    processResponse : function(response, node, callback, scope){
		var jn = Ext.decode(response.responseText, true);
	    
		if(jn === false){
		    Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
				msg : response.responseText
		    });
		    return;
		}
		
		node.beginUpdate();
		//insert new leafs
		for(var i=0;i<jn.rows.length; i++){
			var item = jn.rows[i];
			node.appendChild(this.createNode({
				leaf   	   : true,
				text   	   : item.name,
				loaded 	   : true,
				categoryId : item.help_category_id
			}));
		}
		
		node.endUpdate();
    },
    /**
     * handle the load-exception
     * while loading
    */
    onLoadExceptionEventHandler : function(tree,node,response){
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError', {
		    msg : 'Sorry, an error occured while loading...'
		});
    }
});

Ext.reg('Dbms.Help.TreeLoader', Dbms.Help.TreeLoader);
