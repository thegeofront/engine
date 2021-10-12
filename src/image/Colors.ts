// found this here:
// https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion

import { Color } from "./Color";

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
export function hslToRgb(h: number, s: number, l: number) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        let hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
export function rgbToHsl(r: number, g: number, b: number) {
    (r /= 255), (g /= 255), (b /= 255);
    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h,
        s,
        l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            default:
                throw "nope";
        }
        h /= 6;
    }

    return [h, s, l];
}

export const COLOR = {
    "aliceblue": Color.fromHex("#f0f8ff")!,
    "antiquewhite": Color.fromHex("#faebd7")!,
    "aqua": Color.fromHex("#00ffff")!!,
    "aquamarine": Color.fromHex("#7fffd4")!!,
    "azure": Color.fromHex("#f0ffff")!!,
    "beige": Color.fromHex("#f5f5dc")!,
    "bisque": Color.fromHex("#ffe4c4")!,
    "black": Color.fromHex("#000000")!,
    "blanchedalmond": Color.fromHex("#ffebcd")!,
    "blue": Color.fromHex("#0000ff")!,
    "blueviolet": Color.fromHex("#8a2be2")!,
    "brown": Color.fromHex("#a52a2a")!,
    "burlywood": Color.fromHex("#deb887")!,
    "cadetblue": Color.fromHex("#5f9ea0")!,
    "chartreuse": Color.fromHex("#7fff00")!,
    "chocolate": Color.fromHex("#d2691e")!,
    "coral": Color.fromHex("#ff7f50")!,
    "cornflowerblue": Color.fromHex("#6495ed")!,
    "cornsilk": Color.fromHex("#fff8dc")!,
    "crimson": Color.fromHex("#dc143c")!,
    "cyan": Color.fromHex("#00ffff")!,
    "darkblue": Color.fromHex("#00008b")!,
    "darkcyan": Color.fromHex("#008b8b")!,
    "darkgoldenrod": Color.fromHex("#b8860b")!,
    "darkgray": Color.fromHex("#a9a9a9")!,
    "darkgreen": Color.fromHex("#006400")!,
    "darkgrey": Color.fromHex("#a9a9a9")!,
    "darkkhaki": Color.fromHex("#bdb76b")!,
    "darkmagenta": Color.fromHex("#8b008b")!,
    "darkolivegreen": Color.fromHex("#556b2f")!,
    "darkorange": Color.fromHex("#ff8c00")!,
    "darkorchid": Color.fromHex("#9932cc")!,
    "darkred": Color.fromHex("#8b0000")!,
    "darksalmon": Color.fromHex("#e9967a")!,
    "darkseagreen": Color.fromHex("#8fbc8f")!,
    "darkslateblue": Color.fromHex("#483d8b")!,
    "darkslategray": Color.fromHex("#2f4f4f")!,
    "darkslategrey": Color.fromHex("#2f4f4f")!,
    "darkturquoise": Color.fromHex("#00ced1")!,
    "darkviolet": Color.fromHex("#9400d3")!,
    "deeppink": Color.fromHex("#ff1493")!,
    "deepskyblue": Color.fromHex("#00bfff")!,
    "dimgray": Color.fromHex("#696969")!,
    "dimgrey": Color.fromHex("#696969")!,
    "dodgerblue": Color.fromHex("#1e90ff")!,
    "firebrick": Color.fromHex("#b22222")!,
    "floralwhite": Color.fromHex("#fffaf0")!,
    "forestgreen": Color.fromHex("#228b22")!,
    "fuchsia": Color.fromHex("#ff00ff")!,
    "gainsboro": Color.fromHex("#dcdcdc")!,
    "ghostwhite": Color.fromHex("#f8f8ff")!,
    "goldenrod": Color.fromHex("#daa520")!,
    "gold": Color.fromHex("#ffd700")!,
    "gray": Color.fromHex("#808080")!,
    "green": Color.fromHex("#008000")!,
    "greenyellow": Color.fromHex("#adff2f")!,
    "grey": Color.fromHex("#808080")!,
    "honeydew": Color.fromHex("#f0fff0")!,
    "hotpink": Color.fromHex("#ff69b4")!,
    "indianred": Color.fromHex("#cd5c5c")!,
    "indigo": Color.fromHex("#4b0082")!,
    "ivory": Color.fromHex("#fffff0")!,
    "khaki": Color.fromHex("#f0e68c")!,
    "lavenderblush": Color.fromHex("#fff0f5")!,
    "lavender": Color.fromHex("#e6e6fa")!,
    "lawngreen": Color.fromHex("#7cfc00")!,
    "lemonchiffon": Color.fromHex("#fffacd")!,
    "lightblue": Color.fromHex("#add8e6")!,
    "lightcoral": Color.fromHex("#f08080")!,
    "lightcyan": Color.fromHex("#e0ffff")!,
    "lightgoldenrodyellow": Color.fromHex("#fafad2")!,
    "lightgray": Color.fromHex("#d3d3d3")!,
    "lightgreen": Color.fromHex("#90ee90")!,
    "lightgrey": Color.fromHex("#d3d3d3")!,
    "lightpink": Color.fromHex("#ffb6c1")!,
    "lightsalmon": Color.fromHex("#ffa07a")!,
    "lightseagreen": Color.fromHex("#20b2aa")!,
    "lightskyblue": Color.fromHex("#87cefa")!,
    "lightslategray": Color.fromHex("#778899")!,
    "lightslategrey": Color.fromHex("#778899")!,
    "lightsteelblue": Color.fromHex("#b0c4de")!,
    "lightyellow": Color.fromHex("#ffffe0")!,
    "lime": Color.fromHex("#00ff00")!,
    "limegreen": Color.fromHex("#32cd32")!,
    "linen": Color.fromHex("#faf0e6")!,
    "magenta": Color.fromHex("#ff00ff")!,
    "maroon": Color.fromHex("#800000")!,
    "mediumaquamarine": Color.fromHex("#66cdaa")!,
    "mediumblue": Color.fromHex("#0000cd")!,
    "mediumorchid": Color.fromHex("#ba55d3")!,
    "mediumpurple": Color.fromHex("#9370db")!,
    "mediumseagreen": Color.fromHex("#3cb371")!,
    "mediumslateblue": Color.fromHex("#7b68ee")!,
    "mediumspringgreen": Color.fromHex("#00fa9a")!,
    "mediumturquoise": Color.fromHex("#48d1cc")!,
    "mediumvioletred": Color.fromHex("#c71585")!,
    "midnightblue": Color.fromHex("#191970")!,
    "mintcream": Color.fromHex("#f5fffa")!,
    "mistyrose": Color.fromHex("#ffe4e1")!,
    "moccasin": Color.fromHex("#ffe4b5")!,
    "navajowhite": Color.fromHex("#ffdead")!,
    "navy": Color.fromHex("#000080")!,
    "oldlace": Color.fromHex("#fdf5e6")!,
    "olive": Color.fromHex("#808000")!,
    "olivedrab": Color.fromHex("#6b8e23")!,
    "orange": Color.fromHex("#ffa500")!,
    "orangered": Color.fromHex("#ff4500")!,
    "orchid": Color.fromHex("#da70d6")!,
    "palegoldenrod": Color.fromHex("#eee8aa")!,
    "palegreen": Color.fromHex("#98fb98")!,
    "paleturquoise": Color.fromHex("#afeeee")!,
    "palevioletred": Color.fromHex("#db7093")!,
    "papayawhip": Color.fromHex("#ffefd5")!,
    "peachpuff": Color.fromHex("#ffdab9")!,
    "peru": Color.fromHex("#cd853f")!,
    "pink": Color.fromHex("#ffc0cb")!,
    "plum": Color.fromHex("#dda0dd")!,
    "powderblue": Color.fromHex("#b0e0e6")!,
    "purple": Color.fromHex("#800080")!,
    "rebeccapurple": Color.fromHex("#663399")!,
    "red": Color.fromHex("#ff0000")!,
    "rosybrown": Color.fromHex("#bc8f8f")!,
    "royalblue": Color.fromHex("#4169e1")!,
    "saddlebrown": Color.fromHex("#8b4513")!,
    "salmon": Color.fromHex("#fa8072")!,
    "sandybrown": Color.fromHex("#f4a460")!,
    "seagreen": Color.fromHex("#2e8b57")!,
    "seashell": Color.fromHex("#fff5ee")!,
    "sienna": Color.fromHex("#a0522d")!,
    "silver": Color.fromHex("#c0c0c0")!,
    "skyblue": Color.fromHex("#87ceeb")!,
    "slateblue": Color.fromHex("#6a5acd")!,
    "slategray": Color.fromHex("#708090")!,
    "slategrey": Color.fromHex("#708090")!,
    "snow": Color.fromHex("#fffafa")!,
    "springgreen": Color.fromHex("#00ff7f")!,
    "steelblue": Color.fromHex("#4682b4")!,
    "tan": Color.fromHex("#d2b48c")!,
    "teal": Color.fromHex("#008080")!,
    "thistle": Color.fromHex("#d8bfd8")!,
    "tomato": Color.fromHex("#ff6347")!,
    "turquoise": Color.fromHex("#40e0d0")!,
    "violet": Color.fromHex("#ee82ee")!,
    "wheat": Color.fromHex("#f5deb3")!,
    "white": Color.fromHex("#ffffff")!,
    "whitesmoke": Color.fromHex("#f5f5f5")!,
    "yellow": Color.fromHex("#ffff00")!,
    "yellowgreen":Color.fromHex("#9acd32")!
  }