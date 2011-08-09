
var init = function(){
    
    for(var i=0;i<KProject.Config.Classes.length;i++){
        
        var class_name = KProject.Config.Classes[i]+'()';
        
        eval('KProject.'+KProject.Config.Classes[i]+' = new '+class_name+';');
    }
    
}

Ext.onReady(function(){
    
    init();
    
});