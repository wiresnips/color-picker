
var ColorPicker = (function () {

	///////////////////////////
	// simple utility functions
	///////////////////////////

	function bindEventListener (target, event, handler) {
		if (target.addEventListener)
			target.addEventListener(event, handler, false);
		else if (target.attachEvent)
			target.attachEvent('on'+event, handler);
	}

	function unbindEventListener (target, event, handler) {
		if (target.removeEventListener)
			target.removeEventListener(event, handler, false);
		else if (target.detachEvent)
			target.detachEvent('on'+event, handler);
	}

	function relMouseCoords (target, event) {
		var rect = target.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		return [ x, y ];
	}

	function sqrDistance2 (a, b) {
		var xd = a[0] - b[0];
		var yd = a[1] - b[1];
		return (xd * xd) + (yd * yd);
	}

	function scale3 (v, s) {
		return [ v[0]*s, v[1]*s, v[2]*s ];
	}

	function rgb2hsv (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;

		var min = Math.min( r, g, b );
		var max = Math.max( r, g, b );
		var delta = max - min;

		if (max == 0)
			return [0, 0, 0];

		if (delta == 0)
			return [0, 0, max]

		var h = 0;
		var s = delta / max;
		var v = max;

		if 		(max == r)	h = 0 + (g - b) / delta;
		else if (max == g)	h = 2 + (b - r) / delta;
		else				h = 4 + (r - g) / delta;

		h *= 60;
		if (h < 0)
			h += 360;

		return [h, s, v];
	}

	// [hue, saturation, value]
	function hsv2rgb (hsv) {
		var r, g, b;

		var h = hsv[0]; // 0 to 360
		var s = hsv[1]; // 0 to 1
		var v = hsv[2]; // 0 to 1

		if (s == 0) 
			return [v * 255, v * 255, v * 255];

		// hue sector, and fractional part
		h /= 60;			
		var i = Math.floor( h );
		var f = h - i;

		// fucking magic
		var p = v * ( 1 - s );
		var q = v * ( 1 - s * f );
		var t = v * ( 1 - s * ( 1 - f ) );

		switch (i % 6) {
	        case 0: r = v, g = t, b = p; break;
	        case 1: r = q, g = v, b = p; break;
	        case 2: r = p, g = v, b = t; break;
	        case 3: r = p, g = q, b = v; break;
	        case 4: r = t, g = p, b = v; break;
	        case 5: r = v, g = p, b = q; break;
	    }

	    return [r * 255, g * 255, b * 255];
	}


	// assuming max saturation, of course
	function hue2rgb (hue) {
		hue = (hue % 360) / 60;
		var section = Math.floor(hue);
		var rise = hue - section; // progress through the section
		var fall = 1 - rise;

		switch (section) {
			case 0: return [255,        255 * rise, 0         ];
			case 1: return [255 * fall, 255,        0         ];
			case 2: return [0,          255,        255 * rise];
			case 3: return [0,          255 * fall, 255       ];
			case 4: return [255 * rise, 0,          255       ];
			case 5: return [255,        0,          255 * fall];
		}

		return [0,0,0]; // tha fuck? SOMEONE violated my assumptions about hue's bounds!
	}


	//////////////////////////////////////////////
	// slightly more complex utility: CanvasHandle
	//////////////////////////////////////////////


	function CanvasHandle (canvas, pos, grabRadius) {
		var sqrGrabRadius = grabRadius * grabRadius; // faster math if it's squared beforehand
		
		// generally useful stuff
		this.pos = pos;
		this.deltaPos = [0,0];
		this.mouseDownPos = null;

		// hook functionality in here
		this.grab = null;
		this.move = null;
		this.drop = null;

		// toggle me on/off
		this.disabled = false;


		// keep these private so they don't get accidentally overwritten
		// and so I remember who I am when a listener on something else calls me
		var self = this;

		function startDrag (event) {
			if (self.disabled || self.isLocked())
				return;

			var mouseDownPos = relMouseCoords(canvas, event);
			if (sqrDistance2(self.pos, mouseDownPos) > sqrGrabRadius)
				return;

			self.lock();
			self.mouseDownPos = mouseDownPos;

			if (self.grab != null)
				self.grab();

			bindEventListener(window, "mousemove", drag);
			bindEventListener(window, "mouseup", killDrag);		
		}

		function drag (event) {
			if (self.disabled)
				return killDrag(null);

		self.mouseDownPos = relMouseCoords(canvas, event);
		self.deltaPos = [ self.mouseDownPos[0] - self.pos[0], self.mouseDownPos[1] - self.pos[1] ];
		self.pos = self.mouseDownPos;

			if (self.move != null)
				self.move();
		}

		function killDrag () {
			if (self.drop != null)
				self.drop();

			unbindEventListener(window, "mousemove", drag);
			unbindEventListener(window, "mouseup", killDrag);
			self.unlock();
		}

		bindEventListener(canvas, "mousedown", startDrag);
	}

	// this is a flag lock: only allow one handle to be grabbed at a time
	(function () {
		var locked = false;
		CanvasHandle.prototype.isLocked = function () { return locked; }
		CanvasHandle.prototype.lock = function () { locked = true; }
		CanvasHandle.prototype.unlock = function () { locked = false; }
	})();


	///////////////////////////////////////////////
	// The part we actually care about: ColorPicker
	///////////////////////////////////////////////

	function ColorPane (dim, cursorRadius) {
		cursorRadius = typeof cursorRadius !== 'undefined' ? cursorRadius : 6;

		// this is where we store our actual color (colorPanes think in hue-sat-val)
		var hsv = [0,1,1];

		// this is the actual div we'll be returning
		var pane = document.createElement("div");
			pane.onselectstart = function () { return false; };
			pane.className = "color-pane";

		// hook function to run if our contents change
		pane.colorChange = null;


		pane.getHSV = function () { return [hsv[0], hsv[1], hsv[2]]; }
		pane.setHSV = function (_hsv) {
			if (hsv[0] == _hsv[0] && hsv[1] == _hsv[1] && hsv[2] == _hsv[2])
				return;

			hsv = _hsv;
			setColorMix( hsv[0] );
			updateCursorPos();
			
			if (pane.colorChange != null)
				pane.colorChange( hsv2rgb(hsv) );
		}

		pane.setH = function (h) { pane.setHSV( [h, hsv[1], hsv[2]] ); }
		pane.setS = function (s) { pane.setHSV( [hsv[0], s, hsv[2]] ); }
		pane.setV = function (v) { pane.setHSV( [hsv[0], hsv[1], v] ); }

		pane.getRGB = function () { return hsv2rgb(hsv); }
		pane.setRGB = function (rgb) { pane.setHSV( rgb2hsv(rgb) ); }
		pane.setR = function (r) { rgb = hsv2rgb(hsv); pane.setRGB([r, rgb[1], rgb[2]]); }
		pane.setG = function (g) { rgb = hsv2rgb(hsv); pane.setRGB([rgb[0], g, rgb[2]]); }
		pane.setB = function (b) { rgb = hsv2rgb(hsv); pane.setRGB([rgb[0], rgb[1], b]); }


		// these are composited together into the color window
		var r = this.gradientHelper(dim, dim, 0, "rgba(255,0,0,0)", "rgba(255,0,0,1)");
		var g = this.gradientHelper(dim, dim, 0, "rgba(0,255,0,0)", "rgba(0,255,0,1)");
		var b = this.gradientHelper(dim, dim, 0, "rgba(0,0,255,0)", "rgba(0,0,255,1)");

		var k = this.gradientHelper(dim, 0, dim, "rgba(0,0,0,0)", "rgba(0,0,0,1)");
		var w = this.gradientHelper(dim, dim, 0, "rgba(255,255,255,1)", "rgba(255,255,255,0)");


		// this is how the compositing actually happens
		function setColorMix (hue) {
			var mix = scale3( hue2rgb(hue), 1/255 );
			var context = canvas.getContext("2d");
			context.clearRect( 0, 0, 256, 256 );
			context.globalCompositeOperation = 'lighter';

			context.globalAlpha = 1;
			context.drawImage( w, 0, 0 );

			context.globalAlpha = mix[0];
			context.drawImage( r, 0, 0 );

			context.globalAlpha = mix[1];
			context.drawImage( g, 0, 0 );

			context.globalAlpha = mix[2];
			context.drawImage( b, 0, 0 );

			context.globalCompositeOperation = 'source-over';
			context.globalAlpha = 1;
			context.drawImage( k, 0, 0 );
		}


		var canvas = document.createElement("canvas");
		canvas.width = canvas.height = dim;
		pane.appendChild(canvas);

		var cursor = this.buildCursorImg(cursorRadius);
		pane.appendChild(cursor);


		function updateCursorPos () {
			cursor.style.left = ((     hsv[1]  * dim) - cursorRadius) + "px";
			cursor.style.top  = (((1 - hsv[2]) * dim) - cursorRadius) + "px";
		}

		var handle = new CanvasHandle( canvas, [0,0], dim * 2 );
		handle.grab = handle.move = function () {
			var p = this.mouseDownPos;

			// enforce the boundaries
			if 		(p[0] > dim) p[0] = dim;
			else if (p[0] < 0) 	 p[0] = 0;
			if 		(p[1] > dim) p[1] = dim;
			else if (p[1] < 0) 	 p[1] = 0;

			// color extraction
			hsv[1] =      p[0] / dim ;
			hsv[2] = 1 - (p[1] / dim);

			updateCursorPos();

			// hook
			if (pane.colorChange != null)
				pane.colorChange( hsv2rgb(hsv) );
		}

		// draw the default state
		setColorMix(hsv[0]);
		updateCursorPos();

		return pane;
	}


	ColorPane.prototype.gradientHelper = function (dim, gradX, gradY, color1, color2) {
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
			
		var gradient = context.createLinearGradient( 0, 0, gradX, gradY );
		gradient.addColorStop( 0, color1 );
		gradient.addColorStop( 1, color2 );

		canvas.width = canvas.height = dim;
		context.fillStyle = gradient;
		context.fillRect(0, 0, dim, dim);

		return canvas;
	}

	ColorPane.prototype.buildCursorImg = function (radius) {
		var canvas = document.createElement("canvas");
		canvas.width = canvas.height = radius * 2;
		canvas.className = "cursor";

		var context = canvas.getContext("2d");
		context.strokeStyle = "gray";
		context.lineWidth = 2;
		context.beginPath();
		context.arc( radius, radius, radius - 1, 0, Math.PI*2, true );
		context.stroke();

		return canvas;
	}



	function HueBar (xSize, ySize) {
		var hueBar = document.createElement("div");
			hueBar.className = "hue-bar";

		var canvas = this.buildSpectrum(xSize, ySize);
		var cursor = this.buildCursorImg(xSize);

		hueBar.appendChild(cursor);
		hueBar.appendChild(canvas);

		canvas.onselectstart = function () { return false; };
		hueBar.onselectstart = function () { return false; };

		var y = 0;

		hueBar.hueChange = null;

		hueBar.getHue = function () {
			return y * 360 / canvas.height;
		}

		hueBar.setHue = function (hue) {
			y = hue * canvas.height / 360;
			y = y < 0 ? 0 : y > ySize ? ySize : y;
			cursor.style.top = (y - (cursor.height * 0.5)) + "px";

			if (hueBar.hueChange != null)
				hueBar.hueChange( hueBar.getHue() );
		}

		var handle = new CanvasHandle(canvas, [0,0], xSize + ySize);
		handle.grab = handle.move = function () {
			hueBar.setHue( this.mouseDownPos[1] * 360 / ySize );
		}

		return hueBar;
	}


	HueBar.prototype.buildSpectrum = function (xSize, ySize) {
		var canvas = document.createElement("canvas");
		canvas.width = xSize;
		canvas.height = ySize;

		var context = canvas.getContext("2d");
		var image = context.createImageData(1, ySize);
		var data = image.data;

		for (var y = 0; y < ySize; y++) {
			rgb = hue2rgb(y * 360 / ySize);
			i = y * 4;
			data[i  ] = rgb[0];
			data[i+1] = rgb[1];
			data[i+2] = rgb[2];
			data[i+3] = 255;
		}
		context.putImageData(image, 0, 0);
		context.scale(xSize * 2, 1);
		context.drawImage(canvas, 0, 0);

		return canvas;
	}

	HueBar.prototype.buildCursorImg = function (xSize) {
		var arrow = document.createElement("canvas");
		arrow.width = 4;
		arrow.height= 8;

		var arrowContext = arrow.getContext("2d");
		arrowContext.fillStyle = "white";
		arrowContext.beginPath();
		arrowContext.moveTo( 0, 0 );
		arrowContext.lineTo( 0, 8 );
		arrowContext.lineTo( 4, 4 );
		arrowContext.closePath();
		arrowContext.fill();

		var canvas = document.createElement("canvas");
		canvas.width = xSize + 16;
		canvas.height = 8;
		canvas.style.margin = "0px -8px";
		canvas.className = "cursor";

		var context = canvas.getContext("2d");
		context.drawImage(arrow, 0, 0);
		context.scale(-1, 1);
		context.drawImage(arrow, -(xSize + 16), 0);

		return canvas;
	}



	function ColorPicker (dim) {
		var picker = document.createElement("div");
			picker.className = "color-picker";

		var tintedPane = new ColorPane(dim);
		var hueBar = new HueBar(20, dim);

		picker.appendChild(tintedPane);
		picker.appendChild(hueBar);


		// hook up the HueBar to the ColorPane
		hueBar.hueChange = tintedPane.setH;
		hueBar.setHue(0);

		// present a united front- from the outside, we might as well be a single item
		picker.getHSV = tintedPane.getHSV;
		picker.getRGB = tintedPane.getRGB;

		picker.setHSV = function (hsv) {
			tintedPane.setHSV( hsv );
			hueBar.setHue( hsv[0] );
		}

		picker.setRGB = function (rgb) {
			tintedPane.setRGB( rgb );
			hueBar.setHue( rgb2hsv(rgb)[0] );
		}

		// expose a hook that'll fire if our color changes
		picker.colorChange = null;
		tintedPane.colorChange = function (rgb) {
			if (picker.colorChange != null)
				picker.colorChange(rgb);
		};

		return picker;		
	}

	// here's the styling required to make this not look like shit
	document.write(
		"<style>" + 
			".color-picker { font-size: 0 }" + 
			".color-picker > * { border: 2px solid gray; display: inline-block; }" +
			".color-picker .cursor { position: absolute }" + 
			".color-picker .hue-bar { margin: 0px 10px 0px 15px }" +
		"</style>"
	);

	return ColorPicker;
})();