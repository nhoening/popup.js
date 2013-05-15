/*
    --------------------------------------------------------------------------
    Code for link-hover text boxes
    By Nicolas Honing
    Usage: <a onmouseover="popup('popup content', width)">a link</a>
     (width is optional - default is in CSS: #pup {width: x;},
      escape " in content with &quot;)
    Tutorial and support at http://nicolashoening.de?twocents&nr=8
    --------------------------------------------------------------------------
*/

/***************
 * anderson edit 
 * usage:  <a onmouseover="popupVars.setReady(true);popup('Lorem ipsum dolor sit ...');" onmouseout="popupVars.setReady(false);" href='somewhere.html'>some text</a>
 ***************/

popupVars = {};
popupVars.minMargin = 15; // set how much minimal space there should be (in pixels)
// between the popup and everything else (borders, mouse)
popupVars.ready = false; // we are ready when the mouse event is set up
popupVars.default_width = 200; // will be set to width from css in document.ready

// activate or deactivate the move hoverover
popupVars.setReady = function(p_bool){
if (typeof p_bool === "boolean"){ popupVars.ready = p_bool; }
}

/* Prepare popup and define the mouseover callback */
jQuery(document).ready(function(){
    $('body').append('<div id="pup" style="position:abolute; display:none; z-index:200;"></div>');
    css_width = $('#pup').width();
    if (css_width != 0) popupVars.default_width = css_width;
    // set dynamic coords when the mouse moves
    $(document).mousemove(function(e){ 
        var x,y;
      
        x = $(document).scrollLeft() + e.clientX;
        y = $(document).scrollTop() + e.clientY;

        x += 10; // important: if the popup is where the mouse is, the hoverOver/hoverOut events flicker
      
        if (popupVars.popupVars.ready){
        var x_y = nudge(x,y); // avoids edge overflow

			// remember: the popup is still hidden
			$('#pup').css('top', x_y[1] + 'px');
			$('#pup').css('left', x_y[0] + 'px');
		}
    });
    //ready = true;
});

/*
 The actual callback:
 Write message, show popup w/ custom width if necessary,
 make sure it disappears on mouseout
*/
function popup(msg, width)
{
    if (popupVars.ready) {
        // use default width if not customized here
        if (typeof width === "undefined"){
            width = popupVars.default_width;
        }
        // write content and display
        $('#pup').html(msg).width(width).show();
        // make sure popup goes away on mouse out
        // the event obj needs to be gotten from the virtual 
        //   caller, since we use onmouseover='popup(msg)' 
        var t = getTarget(arguments.callee.caller.arguments[0]);
        $(t).unbind('mouseout').bind('mouseout', 
            function(e){
                $('#pup').hide().width(popupVars.default_width);
            }
        );
    }
}

/* Avoid edge overflow */
function nudge(x,y)
{
    var win = $(window);
    
    // When the mouse is too far on the right, put window to the left
    var xtreme = $(document).scrollLeft() + win.width() - $('#pup').width() - popupVars.minMargin;
    if(x > xtreme) {
        x -= $('#pup').width() + 2 * popupVars.minMargin;
    }
    x = max(x, 0);

    // When the mouse is too far down, move window up
    if((y + $('#pup').height()) > (win.height() +  $(document).scrollTop())) {
        y -= $('#pup').height() + popupVars.minMargin;
    }

    return [ x, y ];
}

/* custom max */
function max(a,b){
    if (a>b) return a;
    else return b;
}

/*
 Get the target (element) of an event.
 Inspired by quirksmode
*/
function getTarget(e) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;
    return targ;
}
