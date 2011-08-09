Ext.ns('Dbms.Util');

Dbms.Util.absolutePostion = function(obj,offsetLeft, offsetTop){
        var orig = obj;
        var left = 0;
        var top = 0;
		
        if(offsetLeft) left = offsetLeft;
        if(offsetTop) top = offsetTop;
		
        if(obj.offsetParent) {
                left += obj.offsetLeft;
                top += obj.offsetTop;
				
                while (obj = obj.offsetParent) {
                        left += (obj.offsetLeft-obj.scrollLeft+obj.clientLeft);
                        top += (obj.offsetTop-obj.scrollTop+obj.clientTop);
                }
        }
		
        return {left:left, top:top, width: orig.offsetWidth, height: orig.offsetHeight};
	}