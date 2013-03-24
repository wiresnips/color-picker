var ColorPicker=function(){function l(a,c,b){a.addEventListener?a.addEventListener(c,b,!1):a.attachEvent&&a.attachEvent("on"+c,b)}function s(a,c){var b=a.getBoundingClientRect();return[c.clientX-b.left,c.clientY-b.top]}function t(a){var c=a[0]/255,b=a[1]/255;a=a[2]/255;var f=Math.min(c,b,a),e=Math.max(c,b,a),f=e-f;if(0==e)return[0,0,0];if(0==f)return[0,0,e];var d=0,d=60*(e==c?0+(b-a)/f:e==b?2+(a-c)/f:4+(c-b)/f);0>d&&(d+=360);return[d,f/e,e]}function h(a){var c,b,f,e=a[0],d=a[1];a=a[2];if(0==d)return[255*
a,255*a,255*a];var e=e/60,g=Math.floor(e),r=e-g,e=a*(1-d),m=a*(1-d*r),d=a*(1-d*(1-r));switch(g%6){case 0:c=a;b=d;f=e;break;case 1:c=m;b=a;f=e;break;case 2:c=e;b=a;f=d;break;case 3:c=e;b=m;f=a;break;case 4:c=d;b=e;f=a;break;case 5:c=a,b=e,f=m}return[255*c,255*b,255*f]}function u(a){a=a%360/60;var c=Math.floor(a);a-=c;var b=1-a;switch(c){case 0:return[255,255*a,0];case 1:return[255*b,255,0];case 2:return[0,255,255*a];case 3:return[0,255*b,255];case 4:return[255*a,0,255];case 5:return[255,0,255*b]}return[0,
0,0]}function n(a,c,b){function f(b){if(g.disabled)return e(null);g.mouseDownPos=s(a,b);g.deltaPos=[g.mouseDownPos[0]-g.pos[0],g.mouseDownPos[1]-g.pos[1]];g.pos=g.mouseDownPos;null!=g.move&&g.move()}function e(){null!=g.drop&&g.drop();var a=window,b=f;a.removeEventListener?a.removeEventListener("mousemove",b,!1):a.detachEvent&&a.detachEvent("onmousemove",b);a=window;b=e;a.removeEventListener?a.removeEventListener("mouseup",b,!1):a.detachEvent&&a.detachEvent("onmouseup",b);g.unlock()}var d=b*b;this.pos=
c;this.deltaPos=[0,0];this.drop=this.move=this.grab=this.mouseDownPos=null;this.disabled=!1;var g=this;l(a,"mousedown",function(b){if(!g.disabled&&!g.isLocked()){b=s(a,b);var c=g.pos,h=c[0]-b[0],c=c[1]-b[1];h*h+c*c>d||(g.lock(),g.mouseDownPos=b,null!=g.grab&&g.grab(),l(window,"mousemove",f),l(window,"mouseup",e))}})}function p(a,c){function b(a){a=u(a);var b=1/255;a=[a[0]*b,a[1]*b,a[2]*b];b=q.getContext("2d");b.clearRect(0,0,256,256);b.globalCompositeOperation="lighter";b.globalAlpha=1;b.drawImage(p,
0,0);b.globalAlpha=a[0];b.drawImage(g,0,0);b.globalAlpha=a[1];b.drawImage(r,0,0);b.globalAlpha=a[2];b.drawImage(m,0,0);b.globalCompositeOperation="source-over";b.globalAlpha=1;b.drawImage(l,0,0)}function f(){j.style.left=e[1]*a-c+"px";j.style.top=(1-e[2])*a-c+"px"}c="undefined"!==typeof c?c:6;var e=[0,1,1],d=document.createElement("div");d.onselectstart=function(){return!1};d.className="color-pane";d.colorChange=null;d.getHSV=function(){return[e[0],e[1],e[2]]};d.setHSV=function(a){e[0]==a[0]&&e[1]==
a[1]&&e[2]==a[2]||(e=a,b(e[0]),f(),null!=d.colorChange&&d.colorChange(h(e)))};d.setH=function(a){d.setHSV([a,e[1],e[2]])};d.setS=function(a){d.setHSV([e[0],a,e[2]])};d.setV=function(a){d.setHSV([e[0],e[1],a])};d.getRGB=function(){return h(e)};d.setRGB=function(a){d.setHSV(t(a))};d.setR=function(a){rgb=h(e);d.setRGB([a,rgb[1],rgb[2]])};d.setG=function(a){rgb=h(e);d.setRGB([rgb[0],a,rgb[2]])};d.setB=function(a){rgb=h(e);d.setRGB([rgb[0],rgb[1],a])};var g=this.gradientHelper(a,a,0,"rgba(255,0,0,0)",
"rgba(255,0,0,1)"),r=this.gradientHelper(a,a,0,"rgba(0,255,0,0)","rgba(0,255,0,1)"),m=this.gradientHelper(a,a,0,"rgba(0,0,255,0)","rgba(0,0,255,1)"),l=this.gradientHelper(a,0,a,"rgba(0,0,0,0)","rgba(0,0,0,1)"),p=this.gradientHelper(a,a,0,"rgba(255,255,255,1)","rgba(255,255,255,0)"),q=document.createElement("canvas");q.width=q.height=a;d.appendChild(q);var j=this.buildCursorImg(c);d.appendChild(j);var k=new n(q,[0,0],2*a);k.grab=k.move=function(){var b=this.mouseDownPos;b[0]>a?b[0]=a:0>b[0]&&(b[0]=
0);b[1]>a?b[1]=a:0>b[1]&&(b[1]=0);e[1]=b[0]/a;e[2]=1-b[1]/a;f();null!=d.colorChange&&d.colorChange(h(e))};b(e[0]);f();return d}function j(a,c){var b=document.createElement("div");b.className="hue-bar";var f=this.buildSpectrum(a,c),e=this.buildCursorImg(a);b.appendChild(e);b.appendChild(f);f.onselectstart=function(){return!1};b.onselectstart=function(){return!1};var d=0;b.hueChange=null;b.getHue=function(){return 360*d/f.height};b.setHue=function(a){d=a*f.height/360;d=0>d?0:d>c?c:d;e.style.top=d-0.5*
e.height+"px";null!=b.hueChange&&b.hueChange(b.getHue())};var g=new n(f,[0,0],a+c);g.grab=g.move=function(){b.setHue(360*this.mouseDownPos[1]/c)};return b}var k=!1;n.prototype.isLocked=function(){return k};n.prototype.lock=function(){k=!0};n.prototype.unlock=function(){k=!1};p.prototype.gradientHelper=function(a,c,b,f,e){var d=document.createElement("canvas"),g=d.getContext("2d");c=g.createLinearGradient(0,0,c,b);c.addColorStop(0,f);c.addColorStop(1,e);d.width=d.height=a;g.fillStyle=c;g.fillRect(0,
0,a,a);return d};p.prototype.buildCursorImg=function(a){var c=document.createElement("canvas");c.width=c.height=2*a;c.className="cursor";var b=c.getContext("2d");b.strokeStyle="gray";b.lineWidth=2;b.beginPath();b.arc(a,a,a-1,0,2*Math.PI,!0);b.stroke();return c};j.prototype.buildSpectrum=function(a,c){var b=document.createElement("canvas");b.width=a;b.height=c;for(var f=b.getContext("2d"),e=f.createImageData(1,c),d=e.data,g=0;g<c;g++)rgb=u(360*g/c),i=4*g,d[i]=rgb[0],d[i+1]=rgb[1],d[i+2]=rgb[2],d[i+
3]=255;f.putImageData(e,0,0);f.scale(2*a,1);f.drawImage(b,0,0);return b};j.prototype.buildCursorImg=function(a){var c=document.createElement("canvas");c.width=4;c.height=8;var b=c.getContext("2d");b.fillStyle="white";b.beginPath();b.moveTo(0,0);b.lineTo(0,8);b.lineTo(4,4);b.closePath();b.fill();b=document.createElement("canvas");b.width=a+16;b.height=8;b.style.margin="0px -8px";b.className="cursor";var f=b.getContext("2d");f.drawImage(c,0,0);f.scale(-1,1);f.drawImage(c,-(a+16),0);return b};document.write("<style>.color-picker { font-size: 0 }.color-picker > * { border: 2px solid gray; display: inline-block; }.color-picker .cursor { position: absolute }.color-picker .hue-bar { margin: 0px 10px 0px 15px }</style>");
return function(a){var c=document.createElement("div");c.className="color-picker";var b=new p(a),f=new j(20,a);c.appendChild(b);c.appendChild(f);f.hueChange=b.setH;f.setHue(0);c.setToColor=function(a){b.setRGB(a);f.setHue(t(a)[0])};c.colorChange=null;b.colorChange=function(a){null!=c.colorChange&&c.colorChange(a)};return c}}();