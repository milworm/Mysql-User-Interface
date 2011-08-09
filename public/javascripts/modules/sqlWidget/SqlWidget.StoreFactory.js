Dbms.SqlWidget.StoreFactory = Ext.extend(Ext.util.Observable, {
    constructor : function(){
        Dbms.SqlWidget.StoreFactory.superclass.constructor.call(this,{});
    },
    build : function(config) {
        this.uniqueId = config.uniqueId;
        this.dbName = config.dbName;
        this.readerConfig = config.response;
        
        this.store = new Ext.data.JsonStore({
            storeId  : this.uniqueId,
            dbName   : this.dbName,
            fields   : this.readerConfig.fields,
            root     : 'rows',
            autoLoad : true,
            proxy : new Ext.data.MemoryProxy({rows : this.readerConfig.rows})
        });
        
        return this.store;
    }
});