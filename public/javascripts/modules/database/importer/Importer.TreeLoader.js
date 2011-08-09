Ext.ns('Dbms.Database.Importer');
/**
 * convert received data 
 * for Database.TreePanel
*/
Dbms.Database.Importer.TreeLoader = Ext.extend(Ext.tree.TreeLoader, {
    constructor : function() {
		Dbms.Database.Tree.TreeLoader.superclass.constructor.call(this, {
			url 		  : Dbms.Actions.system.dir,
			nodeParameter : 'node'
		});
		
		this.on('loadexception', this.onLoadExceptionEventHandler, this);
		this.on("beforeload", function(treeLoader, node) {
			this.baseParams.pathName = node.attributes.text;
		}, this);
    },
    /**
	 * @override
	 * 
     * @param response {object}, json-object response from server
     * @param node {Ext.tree.TreeNode}, node that should be updated
    */
    processResponse : function(response, node){
		var jn = Ext.decode(response.responseText, true);
	    /**
		 * responseText convert to json inpossible
		*/
		if(jn === false){
		    Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError', {
				msg : Dbms.Constants.AJAX_COMUNICATION_ERROR
		    });
			
		    return false;
		}
		
		switch(jn.success){
		    case true : {
				this.formTree(jn, node);
				break;
			}
			case false : {
				Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
					msg : jn.message
				});
				break;
			}
		}
		
		return true;
    },
    /**
     * handle the load-exception
     * while loading
     *
    */
    onLoadExceptionEventHandler : function(){
		Dbms.Core.MessageBus.fireEvent('Dbms.AjaxError',{
		    msg : Dbms.Constants.AJAX_COMUNICATION_ERROR
		});
    },
	formTree : function(jn, node) {
		node.beginUpdate();
		
		for(var i=0;i<jn.rows.length;i++){
			var row = jn.rows[i];
			
			var child = {
				text   : row.name,
				leaf   : !row.isDir,
				loaded : !row.isDir
			}
			
			node.appendChild(this.createNode(child));
		}
		
		node.endUpdate();
		node.loadComplete(1);
		return true;
	}
});
