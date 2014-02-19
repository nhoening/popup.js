/*
--------------------------------------------------------------------------
Code for link-hover text boxes
By Nicolas Honing
Updated on 2-19-2014 by kevin.anderson
usage:
 honingpop = new HoningPopup();
 $('div.popup').on("mouseover", function(e){ honingpop.show({'msg':"test", 'bind':this, "class": "custompopup"}); });

--------------------------------------------------------------------------
*/
var HoningPopup = function(){

	if (!(this instanceof HoningPopup)) {
		throw new TypeError("HoningPopup constructor cannot be called as a function.");
	}

	this.minMargin = 15; // set how much minimal space there should be (in pixels)
									// between the popup and everything else (borders, mouse)
	this.ready = false;  			// we are ready when the mouse event is set up
	this.default_width = 450; // will be set to popup width in document.ready
	this.defaultIdTag = "pup"; // default tag to use for  popup element
	this.idTag = null;
	this.currentMouseXY = [];  // holder for the current mouse position
	this.timer = null;

	// class used for styling a single popup differently 
	this.defaultClass = ""; // default class to use for popup element (none)
	this.elemClass = null;
	
	this.init();

};

HoningPopup.prototype = {
	
	constructor: HoningPopup,

	// activate or deactivate the move hoverover
	setReady : function(p_bool){
		if (typeof p_bool === "boolean"){ this.ready = p_bool; }
	},
	
	/**
	  add a new popup to the DOM if one does not already exist
	  @method createNew
	  @param {string} p_elemTag target element id for the new popup
	  @param {string} p_elemClass optional class for the new popup
	*/
	createNew : function(p_elemTag, p_elemClass){
		var l_elemClass = "", css_width;
		if (typeof p_elemClass === "string"){ l_elemClass = p_elemClass; }
		// only create the hidden target div if it doesnt already exist
		if ( (typeof p_elemTag === "string") && (!($('#'+p_elemTag).length))){
			$('body').append('<div id="'+p_elemTag+'" class="'+l_elemClass+'" style="position:absolute; display:none; z-index:200;"></div>');
			css_width = $('#'+p_elemTag).width();
			if (css_width !== 0) this.default_width = css_width;
		}
	},


	/* Prepare popup and define the mouseover callback */
	/**
	  load the nessesary dom mouse listener events when the class is instanciated
	  @method init 
	  @link http://stackoverflow.com/questions/5706757/is-there-a-way-to-check-document-ready-if-jquery-is-not-available
	*/
	init : function(){
	
		var that = this, tid = setInterval( function () {
			if ( document.readyState !== 'complete' ) return;
			clearInterval( tid );       
			// document loaded, begin setup
			that.idTag = that.defaultIdTag;  // init the popup tag to the default
			that.elemClass = that.defaultClass; // init the popup class to the default
			// create default popup on the page
			// this.createNew(this.idTag, this.elemClass); // unnessesary - element should be created the first time the popup function called
			
			// set dynamic coords when the mouse moves
			$(document).mousemove(function(e){ 
				that.currentMouseXY = that.readMousePos(e);
				if (that.ready){
					that.setElementPos(that.currentMouseXY);
				}
			});
			
		}, 100 );
	
	},
	/**
	  read the current mouse position when mouse movement even occurs
	  and return it an array with x at 0 and y at 1
	  @method: readMousePos
	  @param {object} e javascript event object
	  @returns {array}
	*/
	readMousePos : function(e){
		var x,y;
		// adding the scroll causes mislocation of the taget element issues...not sure why this was ever done
		//x = $(document).scrollLeft() + e.pageX;  
		//y = $(document).scrollTop() + e.pageY;
		x = e.pageX;
		y = e.pageY;
		x += 10; // important: if the popup is where the mouse is, the hoverOver/hoverOut events flicker
		return ([x,y]);
	},

	
	/**
	  set the target element position
	  @method setElementPos
	  @param {array} array of mouse co-ordinates [x,y]
	  @param {string} p_targetElemId optional html elment id for setting the screen position
	*/
	setElementPos : function(p_xyArr,p_targetElemId){
		var l_targetElemId = this.idTag;
		if (typeof p_targetElemId === "string"){ l_targetElemId = p_targetElemId; }
		// only adjust the target element if it exists and the control flag is true
		var l_targetElem = $('#'+l_targetElemId);
		if (l_targetElem.length){
			var x_y = this.nudge(p_xyArr[0],p_xyArr[1]); // avoids edge overflow
							
			// remember: the popup is still hidden, add 5px to the y position
			l_targetElem.css('top', (x_y[1]+5) + 'px');
			l_targetElem.css('left', x_y[0] + 'px');
		}

	},

	/**
	 display the popup, and hide on mouseout from the target element
	 @method show
	 @param {object} p_obj
	 @member {string} p_obj.msg html/text content to add to the popup
	 @member {string} p_obj.id optional target element id
	 @member {string} p_obj.class optional class for the popup
	 @member {string} p_obj.width optional width for the popup
	 @member {event}  p_obj.bind reference to the element that the show event is bound to
	 @example  honingpop = new HoningPopup();
	 $('div.popup').on("mouseover", function(e){ honingpop.show({'msg':"test", 'bind':this}); });
	 */
	
	show : function( p_obj)
	{
		var that = this;
		if (typeof p_obj !== "object"){
			throw TypeError ("HoningPopup.show requires parameter to be of type \"Object\"");
		}
		if ( (!('bind' in p_obj)) || !p_obj.bind){
			throw ReferenceError ("HoningPopup.show requires a reference to the bound element is passed as a parameter");
		}
	
		var l_elemClass, l_width;
		l_elemClass = p_obj.class || "";
		l_width = p_obj.width || this.default_width;
		this.idTag =  p_obj.id || this.defaultIdTag;
		
		// create new popup on the page
		this.createNew(this.idTag, l_elemClass);
	
		
		var popupElement = $('#'+this.idTag);
		if (popupElement.length){
			popupElement.attr("class", "");  // clear the current class(es)
			popupElement.attr("class", l_elemClass);  // assign the class argument
			this.setReady(true);
			// write content and display
			popupElement.html(p_obj.msg).width(l_width).show();
			// make sure popup goes away on mouse out
			$(p_obj.bind).one("mouseout", function(){
				popupElement.hide().width(that.default_width);
			})

		}   
	},

	/*  */
	/**
	  Avoid target dom element from edge overflow
	  returns array with updated co-ordinates [x,y]
	  @method nudge
	  @param {number} x target element x position
	  @param {number} y target element y position 
	  @returns {array}
	*/
	nudge : function(x,y)
	{
		var win = $(window);
		
		// When the mouse is too far on the right, put window to the left
		var xtreme = $(document).scrollLeft() + win.width() - $('#'+this.idTag).width() - this.minMargin;
		if(x > xtreme) {
			x -= $('#'+this.idTag).width() + 2 * this.minMargin;
		}
		x = this.max(x, 0);

		// When the mouse is too far down, move window up
		if((y + $('#'+this.idTag).height()) > (win.height() +  $(document).scrollTop())) {
			y -= $('#'+this.idTag).height() + this.minMargin;
		}

		return [ x, y ];
	},

	/* custom max */
	max : function(a,b){
		if (a>b) return a;
		else return b;
	},

	/*
	 Get the target (element) of an event.
	 Inspired by quirksmode
	*/
	getTarget : function(e) {
		var targ;
		if (!e){
			e = window.event;
		}
		if (e.target){
			targ = e.target;
		}
		else if (e.srcElement) targ = e.srcElement;
		if (targ.nodeType == 3) // defeat Safari bug
			targ = targ.parentNode;
		return targ;
	}
};





