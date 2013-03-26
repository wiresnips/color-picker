#ColorPicker

A pure canvas colorpicker. Won't pollute your namespace, and has minimal CSS. Demo [here](http://novorobo.com/programming/javascript/utilities/color-picker.html)

##Constructor Params
###dim
- The width & height of the main value/saturation picker.

##Methods
###getHSV()
- Return the current color as an array [h, s, v]. h is 0-360. s and v are  0-1.

###getRGB()
- Return the current color as an array [r, g, b]. All values are 0-255.

###setHSV(hsv)
- Takes an array [h, s, v], assumed to respect the bounds above. Sets the colorpicker to the color specified.

###setRGB(rgb)
- Takes an array [r, g, b], assumed to respect the bounds above. Sets the colorpicker to the color specified.

##Method Hooks
###colorChange(rgb)
- This function, if it exists, will be called whenever the color of the picker changes. It will be passed an array [r, g, b] of the new color.
