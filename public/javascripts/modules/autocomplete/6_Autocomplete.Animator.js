Ext.ns('Dbms.Autocplete');


Dbms.Autocomplete.Animator = function() {
	
}

Dbms.Autocomplete.Animator.prototype = {
	fade : function(config) {
		config.el.fadeOut({
			duration : config.fadeOut.duration || .3,
			easing   : config.fadeOut.easing || 'easeOut',
			callback : function(){
				config.fadeOut.callback.call(config.fadeOut.scope);
				
				config.el.fadeIn({
					duration : config.fadeIn.duration || .1,
					easing   : config.fadeIn.easing || 'easeOut',
					callback : function(){
						config.fadeIn.callback.call(config.fadeIn.scope);
					},
					scope : this
				});
				
			},
			scope : this
		});
		
	}

}