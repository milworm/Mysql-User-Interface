Ext.ns('Dbms', "Dbms.Config", 'Dbms.Constants');

Dbms.Constants.POOLING_TIME = 2000;
Dbms.Constants.DEFAULT_PAGE_SIZE = 50;
Dbms.Constants.AJAX_COMUNICATION_ERROR = 'Sorry, an error occured while loading. If error persists please contact your technical support.';
Dbms.Constants.MYSQL_LINK_RE = /http:\/\/dev\.mysql.com.{1,}/g
//Ext.chart.Chart.CHART_URL = 'application/swf';
/**
* here is a list of classes that will be automaticaly
* created after Dom-loaded fired
*/

Dbms.Config.Classes = [
   'Dbms.Core.MessageBus',
   'Dbms.System.CpuStatStore',
   'Dbms.System.MemStatStore',
   'Dbms.System.VariableStore',
   'Dbms.Taskbar.Controller',
   'Dbms.TableStructure.Controller',
   'Dbms.Dashboard.Variables.Store',
   'Dbms.Core.Viewport',
   'Dbms.DataManagement.ViewManager.Controller',
   'Dbms.DataManagement.TableManager.Controller',
   
   'Dbms.RoutineManagement.ProcedureManager.WindowFactory',
   'Dbms.RoutineManagement.ProcedureManager.StoreFactory',
   'Dbms.RoutineManagement.ProcedureManager.ViewFactory',
   'Dbms.RoutineManagement.ProcedureManager.Controller',
   
   'Dbms.RoutineManagement.TriggerManager.WindowFactory',
   'Dbms.RoutineManagement.TriggerManager.StoreFactory',
   'Dbms.RoutineManagement.TriggerManager.ViewFactory',
   'Dbms.RoutineManagement.TriggerManager.Controller',
   
   'Dbms.RoutineManagement.FunctionManager.WindowFactory',
   'Dbms.RoutineManagement.FunctionManager.StoreFactory',
   'Dbms.RoutineManagement.FunctionManager.ViewFactory',
   'Dbms.RoutineManagement.FunctionManager.Controller',
   
   'Dbms.RoutineManagement.Creator.Factory',
   'Dbms.RoutineManagement.Creator.Controller',
   
   'Dbms.Help.SearchFieldStore',
   'Dbms.Help.PanelBuilder',
   'Dbms.Garbage.Collector',
   'Dbms.Help.CategoryCacheStore',
   'Dbms.Dump.Database.Controller',
   'Dbms.Database.Creator.CharacterSetStore',
   'Dbms.Database.Creator.Controller',
   'Dbms.Database.Importer.BaseImporter',
   'Dbms.Database.Importer.Factory',
   'Dbms.SqlWidget.Controller',
   'Dbms.SqlWidget.Factory',
   'Dbms.RoutineManagement.RoutineTypeStore'
]

/*
 * create all required namespaces
 **/
for(var i=0; i<Dbms.Config.Classes.length; i++){
   var cls = Dbms.Config.Classes[i];
   var ns_s = cls.split('.');
   var current_ns = '';
   
   for(var j=0;j<ns_s.length;j++){
      current_ns = j==0?current_ns+= ns_s[j]:current_ns+= '.'+ns_s[j];
      Ext.ns(current_ns);
   }
}	