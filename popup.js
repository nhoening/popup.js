/*
    --------------------------------------------------------------------------
    Code for link-hover text boxes
    By Nicolas Honing
	Updated on 5-14-2013 by andersonk17474
    Usage: <a onmouseover="popup('popup content','elemnt id','element class',width)">a link</a>
     (width is optional - default is in CSS: #pup {width: x;},
	 (element id is optional  - will default to 'pup')
	 (class is optional - no default)
      escape " in content with &quot;)
    Tutorial and support at http://nicolashoening.de?twocents&nr=8
    --------------------------------------------------------------------------
*/
popupFunct = {};
popupVars = {};
popupVars.minMargin = 15; // set how much minimal space there should be (in pixels)
									// between the popup and everything else (borders, mouse)
popupVars.ready = false;  			// we are ready when the mouse event is set up
popupVars.default_width = 200; // will be set to width from css in document.ready
popupVars.defaultIdTag = "pup"; // default tag to use for target element
popupVars.idTag;
popupVars.currentMouseXY = [];  // holder for the current mouse position
popupVars.timer;

// class used for styling a single popup differently 
popupVars.defaultClass = ""; // default class to use for target element (none)
popupVars.elemClass;


// activate or deactivate the move hoverover
popupVars.setReady = function(p_bool){
	if (typeof p_bool === "boolean"){ popupVars.ready = p_bool; }
}

popupFunct.initNew = function(p_elemTag, p_elemClass){
	var l_elemClass = "";
	if (typeof p_elemClass === "string"){ l_class = l_elemClass; }
	// only create the hidden target div if it doesnt already exist
	if ( (typeof p_elemTag === "string") && (!($('#'+p_elemTag).length))){
		$('body').append('<div id="'+p_elemTag+'" class="'+l_elemClass+'" style="position:abolute; display:none; z-index:200;"></div>');
		css_width = $('#'+p_elemTag).width();
		if (css_width != 0) popupVars.default_width = css_width;
	}
}


/* Prepare popup and define the mouseover callback */
jQuery(document).ready(function(){
    popupVars.idTag = popupVars.defaultIdTag;  // init the popup tag to the default
	popupVars.elemClass = popupVars.defaultClass; // init the popup class to the default
	// create default popup on the page
	// popupFunct.initNew(popupVars.idTag, popupVars.elemClass); // unnessesary - element should be created the first time the popup function called
	
    // set dynamic coords when the mouse moves
    $(document).mousemove(function(e){ 
		popupVars.currentMouseXY = popupFunct.readMousePos(e);
		if (popupVars.ready){
			popupFunct.setElementPos(popupVars.currentMouseXY);
		}
    });
});

// read the current mouse position when mouse movement even occurs
popupFunct.readMousePos = function(e){
	var x,y;
    x = $(document).scrollLeft() + e.pageX;
    y = $(document).scrollTop() + e.pageY;
    x += 10; // important: if the popup is where the mouse is, the hoverOver/hoverOut events flicker
	return ([x,y]);
}

// set the target element position
popupFunct.setElementPos = function(p_xyArr,p_targetElemId){
	var l_targetElemId = popupVars.idTag;
	if (typeof p_targetElemId === "string"){ l_targetElemId = p_targetElemId; }
	// only adjust the target element if it exists and the control flag is true
	var l_targetElem = $('#'+l_targetElemId);
	if (l_targetElem.length){
		var x_y = popupFunct.nudge(p_xyArr[0],p_xyArr[1]); // avoids edge overflow
		// remember: the popup is still hidden
		l_targetElem.css('top', x_y[1] + 'px');
		l_targetElem.css('left', x_y[0] + 'px');
	}

}

// delayed popup message
// currently not working correctly - the first time it's displayed on the far left of screen no matter where the target element is
// if your drag accross the target element just right (hard to describe) the onmouseout event to hide the target elementdoes not get fired
popupFunct.delayedPopup = function(delay, p_msg, p_elemTag, p_elemClass , p_width){
	// if the timer is active - clear it before starting
	clearTimeout(popupVars.timer);
	function callback(p_arr){
		return function(){
			popupFunct.popup(p_arr[0], p_arr[1], p_arr[2] , p_arr[3], p_arr[4] )
		}
	}
	var l_msg = '"'+p_msg+'"';
	var l_width = p_width;
	if (typeof p_width === "undefined" || p_width == null){
	   l_width = popupVars.default_width;
	}
	popupVars.timer = setTimeout(callback([l_msg, p_elemTag, p_elemClass, l_width, (arguments.callee.caller.arguments[0])]), delay);
}

/*
 The actual callback:
 Write message, show popup w/ custom width if necessary,
 make sure it disappears on mouseout
*/
popupFunct.popup = function(p_msg, p_elemTag, p_elemClass , p_width, p_callerFX )
{
	var l_elemClass = "";
	if (typeof p_elemClass === "string"){ l_elemClass = p_elemClass; }
	if (typeof p_elemTag !== "undefined" && p_elemTag != null && p_elemTag.length){
		popupVars.idTag = p_elemTag; // reassign default object tag value
		// create new popup on the page
		popupFunct.initNew(popupVars.idTag, l_elemClass);
	}
	else{ popupVars.idTag = popupVars.defaultIdTag; }
	var popupElement = $('#'+popupVars.idTag);
	if (popupElement.length){
		if (!(popupElement.hasClass(l_elemClass))){
			popupElement.attr("class", "");  // clear the current class
			// assign the new class
			popupElement.addClass(l_elemClass);
		}
		popupVars.setReady(true);
		// use default width if not customized here
		if (typeof width === "undefined"){
		   p_width = popupVars.default_width;
		}


		// write content and display
		popupElement.html(p_msg).width(p_width).show();
		// make sure popup goes away on mouse out
		// the event obj needs to be gotten from the virtual 
		//  caller, since we use onmouseover='popup(p_msg)' 
		
		var l_callerFX;
		if (typeof p_callerFX === "undefined" || p_callerFX == null ) l_callerFX = arguments.callee.caller.arguments[0];
		else l_callerFX = p_callerFX;
		var t = popupFunct.getTarget(l_callerFX);
		$(t).unbind('mouseout').bind('mouseout', 
			 function(e){
				 popupElement.hide().width(popupVars.default_width);
			 }
		);
	}   
}

/* Avoid edge overflow */
popupFunct.nudge = function(x,y)
{
    var win = $(window);
    
    // When the mouse is too far on the right, put window to the left
    var xtreme = $(document).scrollLeft() + win.width() - $('#'+popupVars.idTag).width() - popupVars.minMargin;
    if(x > xtreme) {
        x -= $('#'+popupVars.idTag).width() + 2 * popupVars.minMargin;
    }
    x = popupFunct.max(x, 0);

    // When the mouse is too far down, move window up
    if((y + $('#'+popupVars.idTag).height()) > (win.height() +  $(document).scrollTop())) {
        y -= $('#'+popupVars.idTag).height() + popupVars.minMargin;
    }

    return [ x, y ];
}

/* custom max */
popupFunct.max = function(a,b){
    if (a>b) return a;
    else return b;
}

/*
 Get the target (element) of an event.
 Inspired by quirksmode
*/
popupFunct.getTarget = function(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;
    return targ;
}
