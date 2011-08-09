Ext.ns("Dbms.System");
Dbms.System.MemStatStore = Ext.extend(Ext.data.JsonStore,{
    constructor : function(){
        Dbms.System.MemStatStore.superclass.constructor.call(this, {
            fields: ['type', 'total'],
            proxy : new Ext.data.HttpProxy({
                url    : Dbms.Actions.system.memUsage,
                method : 'get'
            }),
            root : 'rows',
            storeId : 'System.MemStatStore',
            autoLoad : true
        });
        Dbms.Core.MessageBus.on('Dbms.Dashboard.StartMonitoring',this.startAutoReload, this);
        Dbms.Core.MessageBus.on('Dbms.Dashboard.StopMonitoring',this.stopAutoReload, this);
        
    },
    startAutoReload : function(){
        this.timer = setInterval(this.reload(this), Dbms.Constants.POOLING_TIME);
    },
    stopAutoReload : function(){
        clearInterval(this.timer);
    },
    reload : function(me){
        me;
        return function(){
            me.load.call(me);
        }
    }
});