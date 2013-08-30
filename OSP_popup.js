/*global define:false */
// (above) http://www.jshint.com/ validation parameters 

// using require.js boilerplate for asnyc loading

/**
 OSP_popup
 @desc Modified version of popup.js configured for use with backbone.js and require.js
 @requires jquery
 @example :   initialize -     this.ospPopup = new OSP_Popup({"class" : "osp_message", "width": 400 });
			  usage with Backbone - 	events: {
											"mouseenter" : function(){	p_popup.display( this.model.get('message') ); },  	
											"mouseleave" : function(){  p_popup.hide(); } 
										}
 @param: object
         -id:     id tag for the popup div
		 -class:  class name for the popup div
		 -width:  forced inline width attribute for the popup
		 -fadeInTimer:   time in milliseconds for the fade in effect
		 -fadeOutTimer:  - time in milliseconds for the fade out effect 	
*/

define(['jquery'], function ($) {
    
	'use strict';
	function OSP_Popup(p_obj){
		
			
		if (!(this instanceof OSP_Popup)) {
			throw new TypeError("OSP_Popup constructor cannot be called as a function.");
		}
		
		this.minMargin = 15;                       // set how much minimal space there should be (in pixels)
		this.ready = false;                        // we are ready when the mouse event is set up
		this.id = p_obj["id"] || "ws_pup";      // default tag to use for target element (default ws_pup)
		this.popClass = p_obj["class"]  || "";     //  class to use for target element (default - none)
		this.$el;            // jquery cache of the element
		this.currentMouseXY = [];  // holder for the current mouse position
		this.mouseEventBound = false;   // track if the mouse trackign code is bound
		this.width = p_obj["width"]  || 450;
		this.fadeInTimer = p_obj["fadeInTimer"]  || 500;
		this.fadeOutTimer = p_obj["fadeOutTimer"]  || 500;
		this.timer;
		
		this.init();
	}
	
	OSP_Popup.prototype = {
	
		constructor: OSP_Popup,
		
		setReady : function(p_bool){
			if (typeof p_bool === "boolean"){ this.ready = p_bool; }
		},
		/**
		  internal function to initialize the the popup 
		  @method: init
		  @event binds a listener to the document to obtain the mouse position
		*/
		init : function(){
			var that = this;
			if (!this.$el){
				$('body').append('<div id="'+this.id+'"></div>');
				this.$el = $('#'+this.id);
				if(this.popClass) {this.$el.addClass(this.popClass); }
				this.$el.css({"position": "absolute", "display":"none", "z-index":"9999", "width": this.width }); 
			}
			if (!this.mouseEventBound){
				 $(document).on('mousemove', function(e){ 
					that.currentMouseXY = that.readMousePos(e);
					if (that.ready){
						that.setElementPos(that.currentMouseXY);
					}
				});
				this.mouseEventBound = true;
			}
		},
		/**
		  display the popup
		  @param   string with the popup content
		  @method: display
		*/
		
		display: function(p_msg){
			var that = this;
			that.setReady(true);
			this.timer = window.setTimeout(function(){ that.$el.html(p_msg).fadeIn(that.fadeInTimer); }, 500 );
		},
		/**
		  hide the popup
		  @method: display
		*/
		hide: function(){
			var clearBool = false, that = this;
			that.setReady(false);
			if (this.timer){ 
				window.clearTimeout(this.timer);
				if (that.$el.is(':visible')) { clearBool = true; }
			}
			else { clearBool = true; } 
			if (clearBool){ that.$el.fadeOut(this.fadeOutTimer); }
				
			
		},
		// set the target element position
		setElementPos : function(p_xyArr){
			var x_y = this.nudge(p_xyArr[0],p_xyArr[1]); // avoids edge overflow
								
			// remember: the popup is still hidden, add 5px to the y position
			this.$el.css('top', (x_y[1]+5) + 'px');
			this.$el.css('left', x_y[0] + 'px');
			

		},
		/**
		  function to move the popup on initial display if it is too close to the display edge
		  barrowed from the popup script authored by Nicolas Hoening
		  @link https://github.com/nhoening/popup.js
		  @see: http://www.nicolashoening.de
		  @method: nudge
		*/	
		nudge : function(x,y){
			var win = $(window);
			
			// When the mouse is too far on the right, put window to the left
			var xtreme = $(document).scrollLeft() + win.width() - this.$el.width() - this.minMargin;
			if(x > xtreme) {
				x -= this.$el.width() + 2 * this.minMargin;
			}
			x = this.max(x, 0);

			// When the mouse is too far down, move window up
			if((y + this.$el.height()) > (win.height() + $(document).scrollTop())) {
				y -= this.$el.height() + this.minMargin;
			}

			return [ x, y ];
		},
		/* custom max */
		max : function(a,b){
			if (a>b) return a;
			else return b;
		}, 
		readMousePos : function(e){
			var x,y;
			
			x = e.pageX;
			y = e.pageY;
			x += 10; // important: if the popup is where the mouse is, the hoverOver/hoverOut events flicker
			return ([x,y]);
		}
		
			
	}
	return OSP_Popup;
});
	
		

	
