/*
 * Raphael 0.8.1 - JavaScript Vector Library
 *
 * Copyright (c) 2008 - 2009 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */


window.Raphael = (function () {
    var separator = /[, ]+/,
        doc = document,
        win = window,
        oldRaphael = {
            was: "Raphael" in window,
            is: window.Raphael
        },
        R = function () {
            return create.apply(R, arguments);
        },
        paper = {},
        availableAttrs = {cx: 0, cy: 0, fill: "#fff", "fill-opacity": 1, font: '10px "Arial"', "font-family": '"Arial"', "font-size": "10", "font-style": "normal", "font-weight": 400, gradient: 0, height: 0, href: "http://raphaeljs.com/", opacity: 1, path: "M0,0", r: 0, rotation: 0, rx: 0, ry: 0, scale: "1 1", src: "", stroke: "#000", "stroke-dasharray": "", "stroke-linecap": "butt", "stroke-linejoin": "butt", "stroke-miterlimit": 0, "stroke-opacity": 1, "stroke-width": 1, target: "_blank", "text-anchor": "middle", title: "Raphael", translation: "0 0", width: 0, x: 0, y: 0},
        availableAnimAttrs = {cx: "number", cy: "number", fill: "colour", "fill-opacity": "number", "font-size": "number", height: "number", opacity: "number", path: "path", r: "number", rotation: "csv", rx: "number", ry: "number", scale: "csv", stroke: "colour", "stroke-opacity": "number", "stroke-width": "number", translation: "csv", width: "number", x: "number", y: "number"},
        events = ["click", "dblclick", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup"];
    R.version = "0.8";
    R.type = (window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    R.svg = !(R.vml = R.type == "VML");
    R.idGenerator = 0;
    R.fn = {};
    R.setWindow = function (newwin) {
        win = newwin;
        doc = win.document;
    };
    // colour utilities
    R.hsb2rgb = function (hue, saturation, brightness) {
        if (typeof hue == "object" && "h" in hue && "s" in hue && "b" in hue) {
            brightness = hue.b;
            saturation = hue.s;
            hue = hue.h;
        }
        var red,
            green,
            blue;
        if (brightness == 0) {
            return {r: 0, g: 0, b: 0, hex: "#000"};
        }
        if (hue > 1 || saturation > 1 || brightness > 1) {
            hue /= 255;
            saturation /= 255;
            brightness /= 255;
        }
        var i = Math.floor(hue * 6),
            f = (hue * 6) - i,
            p = brightness * (1 - saturation),
            q = brightness * (1 - (saturation * f)),
            t = brightness * (1 - (saturation * (1 - f)));
        red = [brightness, q, p, p, t, brightness, brightness][i];
        green = [t, brightness, brightness, q, p, p, t][i];
        blue = [p, p, t, brightness, brightness, q, p][i];
        red *= 255;
        green *= 255;
        blue *= 255;
        var rgb = {r: red, g: green, b: blue};
        var r = Math.round(red).toString(16);
        if (r.length == 1) {
            r = "0" + r;
        }
        var g = Math.round(green).toString(16);
        if (g.length == 1) {
            g = "0" + g;
        }
        var b = Math.round(blue).toString(16);
        if (b.length == 1) {
            b = "0" + b;
        }
        rgb.hex = "#" + r + g + b;
        return rgb;
    };
    R.rgb2hsb = function (red, green, blue) {
        if (typeof red == "object" && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (typeof red == "string") {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = Math.max(red, green, blue),
            min = Math.min(red, green, blue),
            hue,
            saturation,
            brightness = max;
        if (min == max) {
            return {h: 0, s: 0, b: max};
        } else {
            var delta = (max - min);
            saturation = delta / max;
            if (red == max) {
                hue = (green - blue) / delta;
            } else if (green == max) {
                hue = 2 + ((blue - red) / delta);
            } else {
                hue = 4 + ((red - green) / delta);
            }
            hue /= 6;
            if (hue < 0) {
                hue += 1;
            }
            if (hue > 1) {
                hue -= 1;
            }
        }
        return {h: hue, s: saturation, b: brightness};
    };
    var getRGBcache = {}, getRGBcount = [];
    R.getRGB = function (colour) {
        if (colour in getRGBcache) {
            return getRGBcache[colour];
        }
        var htmlcolors = {aliceblue: "#f0f8ff", amethyst: "#96c", antiquewhite: "#faebd7", aqua: "#0ff", aquamarine: "#7fffd4", azure: "#f0ffff", beige: "#f5f5dc", bisque: "#ffe4c4", black: "#000", blanchedalmond: "#ffebcd", blue: "#00f", blueviolet: "#8a2be2", brown: "#a52a2a", burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00", chocolate: "#d2691e", coral: "#ff7f50", cornflowerblue: "#6495ed", cornsilk: "#fff8dc", crimson: "#dc143c", cyan: "#0ff", darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b", darkgray: "#a9a9a9", darkgreen: "#006400", darkkhaki: "#bdb76b", darkmagenta: "#8b008b", darkolivegreen: "#556b2f", darkorange: "#ff8c00", darkorchid: "#9932cc", darkred: "#8b0000", darksalmon: "#e9967a", darkseagreen: "#8fbc8f", darkslateblue: "#483d8b", darkslategray: "#2f4f4f", darkturquoise: "#00ced1", darkviolet: "#9400d3", deeppink: "#ff1493", deepskyblue: "#00bfff", dimgray: "#696969", dodgerblue: "#1e90ff", firebrick: "#b22222", floralwhite: "#fffaf0", forestgreen: "#228b22", fuchsia: "#f0f", gainsboro: "#dcdcdc", ghostwhite: "#f8f8ff", gold: "#ffd700", goldenrod: "#daa520", gray: "#808080", green: "#008000", greenyellow: "#adff2f", honeydew: "#f0fff0", hotpink: "#ff69b4", indianred: "#cd5c5c", indigo: "#4b0082", ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa", lavenderblush: "#fff0f5", lawngreen: "#7cfc00", lemonchiffon: "#fffacd", lightblue: "#add8e6", lightcoral: "#f08080", lightcyan: "#e0ffff", lightgoldenrodyellow: "#fafad2", lightgreen: "#90ee90", lightgrey: "#d3d3d3", lightpink: "#ffb6c1", lightsalmon: "#ffa07a", lightsalmon: "#ffa07a", lightseagreen: "#20b2aa", lightskyblue: "#87cefa", lightslategray: "#789", lightsteelblue: "#b0c4de", lightyellow: "#ffffe0", lime: "#0f0", limegreen: "#32cd32", linen: "#faf0e6", magenta: "#f0f", maroon: "#800000", mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3", mediumpurple: "#9370db", mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee", mediumslateblue: "#7b68ee", mediumspringgreen: "#00fa9a", mediumturquoise: "#48d1cc", mediumvioletred: "#c71585", midnightblue: "#191970", mintcream: "#f5fffa", mistyrose: "#ffe4e1", moccasin: "#ffe4b5", navajowhite: "#ffdead", navy: "#000080", oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23", orange: "#ffa500", orangered: "#ff4500", orchid: "#da70d6", palegoldenrod: "#eee8aa", palegreen: "#98fb98", paleturquoise: "#afeeee", palevioletred: "#db7093", papayawhip: "#ffefd5", peachpuff: "#ffdab9", peru: "#cd853f", pink: "#ffc0cb", plum: "#dda0dd", powderblue: "#b0e0e6", purple: "#800080", red: "#f00", rosybrown: "#bc8f8f", royalblue: "#4169e1", saddlebrown: "#8b4513", salmon: "#fa8072", sandybrown: "#f4a460", seagreen: "#2e8b57", seashell: "#fff5ee", sienna: "#a0522d", silver: "#c0c0c0", skyblue: "#87ceeb", slateblue: "#6a5acd", slategray: "#708090", snow: "#fffafa", springgreen: "#00ff7f", steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080", thistle: "#d8bfd8", tomato: "#ff6347", turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3", white: "#fff", whitesmoke: "#f5f5f5", yellow: "#ff0", yellowgreen: "#9acd32"},
        res;
        if ((colour + "").toLowerCase() in htmlcolors) {
            colour = htmlcolors[colour.toString().toLowerCase()];
        }
        if (!colour) {
            return {r: 0, g: 0, b: 0, hex: "#000"};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none"};
        }
        var red, green, blue,
            rgb = (colour + "").match(/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgb\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|rgb\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\)|hsb\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|hsb\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\))\s*$/i);
        if (rgb) {
            if (rgb[2]) {
                blue = parseInt(rgb[2].substring(5), 16);
                green = parseInt(rgb[2].substring(3, 5), 16);
                red = parseInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = parseInt(rgb[3].substring(3) + rgb[3].substring(3), 16);
                green = parseInt(rgb[3].substring(2, 3) + rgb[3].substring(2, 3), 16);
                red = parseInt(rgb[3].substring(1, 2) + rgb[3].substring(1, 2), 16);
            }
            if (rgb[4]) {
                rgb = rgb[4].split(/\s*,\s*/);
                red = parseFloat(rgb[0]);
                green = parseFloat(rgb[1]);
                blue = parseFloat(rgb[2]);
            }
            if (rgb[5]) {
                rgb = rgb[5].split(/\s*,\s*/);
                red = parseFloat(rgb[0]) * 2.55;
                green = parseFloat(rgb[1]) * 2.55;
                blue = parseFloat(rgb[2]) * 2.55;
            }
            if (rgb[6]) {
                rgb = rgb[6].split(/\s*,\s*/);
                red = parseFloat(rgb[0]);
                green = parseFloat(rgb[1]);
                blue = parseFloat(rgb[2]);
                return R.hsb2rgb(red, green, blue);
            }
            if (rgb[7]) {
                rgb = rgb[7].split(/\s*,\s*/);
                red = parseFloat(rgb[0]) * 2.55;
                green = parseFloat(rgb[1]) * 2.55;
                blue = parseFloat(rgb[2]) * 2.55;
                return R.hsb2rgb(red, green, blue);
            }
            var rgb = {r: red, g: green, b: blue};
            var r = Math.round(red).toString(16);
            (r.length == 1) && (r = "0" + r);
            var g = Math.round(green).toString(16);
            (g.length == 1) && (g = "0" + g);
            var b = Math.round(blue).toString(16);
            (b.length == 1) && (b = "0" + b);
            rgb.hex = "#" + r + g + b;
            res = rgb;
        } else {
            res = {r: -1, g: -1, b: -1, hex: "none"};
        }
        if (getRGBcount.length > 20) {
            delete getRGBcache[getRGBcount.unshift()];
        }
        getRGBcount.push(colour);
        getRGBcache[colour] = res;
        return res;
    };
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            if (start.s <= 0) {
                this.getColor.start = {h: 0, s: 1, b: start.b};
            }
        }
        return rgb.hex;
    };
    R.getColor.reset = function () {
        delete this.start;
    };
    // path utilities
    var pathcache = {}, pathcount = [];
    R.parsePathString = function (pathString) {
        if (pathString in pathcache) {
            return pathcache[pathString];
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [],
            toString = function () {
                var res = "";
                for (var i = 0, ii = this.length; i < ii; i++) {
                    res += this[i][0] + this[i].join(",").substring(2);
                }
                return res;
            };
        if (pathString.toString.toString() == toString.toString()) {
            data = pathString;
        }
        if (!data.length) {
            pathString.replace(/([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig, function (a, b, c) {
                var params = [], name = b.toLowerCase();
                c.replace(/(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig, function (a, b) {
                    b && params.push(+b);
                });
                while (params.length >= paramCounts[name]) {
                    data.push([b].concat(params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    };
                }
            });
            data.toString = toString;
        }
        if (pathcount.length > 20) {
            delete pathcache[pathcount.unshift()];
        }
        pathcount.push(pathString);
        pathcache[pathString] = data;
        return data;
    };
    var pathDimensions = function (path) {
        var pathArray = path;
        if (typeof path == "string") {
            pathArray = R.parsePathString(path);
        }
        pathArray = pathToAbsolute(pathArray);
        var x = [], y = [], length = 0;
        for (var i = 0, ii = pathArray.length; i < ii; i++) {
            var pa = pathArray[i];
            switch (pa[0]) {
                case "Z":
                    break;
                case "A":
                    x.push(pa[pa.length - 2]);
                    y.push(pa[pa.length - 1]);
                    break;
                default:
                    for (var j = 1, jj = pa.length; j < jj; j++) {
                        (j % 2 ? x : y).push(pa[j]);
                    }
            }
        }
        var minx = Math.min.apply(Math, x),
            miny = Math.min.apply(Math, y);
        if (!x.length) {
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                X: 0,
                Y: 0
            };
        } else {
            return {
                x: minx,
                y: miny,
                width: Math.max.apply(Math, x) - minx,
                height: Math.max.apply(Math, y) - miny,
                X: x,
                Y: y
            };
        }
    },
        pathToRelative = function (pathArray) {
            var res = [];
            if (typeof pathArray == "string") {
                pathArray = R.parsePathString(pathArray);
            }
            var x = 0, y = 0, start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                start++;
                res.push(["M", x, y]);
            }
            for (var i = start, ii = pathArray.length; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != pa[0].toLowerCase()) {
                    r[0] = pa[0].toLowerCase();
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = 0;
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = (pa[1] - y).toFixed(3);
                            break;
                        default:
                            for (var j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                switch (res[i][0]) {
                    case "z":
                        break;
                    case "h":
                        x += res[i][res[i].length - 1];
                        break;
                    case "v":
                        y += res[i][res[i].length - 1];
                        break;
                    default:
                        x += res[i][res[i].length - 2];
                        y += res[i][res[i].length - 1];
                }
            }
            res.toString = pathArray.toString;
            return res;
        },
        pathToAbsolute = function (pathArray) {
            var res = [];
            if (typeof pathArray == "string") {
                pathArray = R.parsePathString(pathArray);
            }
            var x = 0,
                y = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                start++;
                res[0] = ["M", x, y];
            }
            for (var i = start, ii = pathArray.length; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != (pa[0] + "").toUpperCase()) {
                    r[0] = (pa[0] + "").toUpperCase();
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = 0;
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x).toFixed(3);
                            r[7] = +(pa[7] + y).toFixed(3);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        default:
                            for (var j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else {
                    r = res[i] = [];
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    default:
                        x = res[i][res[i].length - 2];
                        y = res[i][res[i].length - 1];
                }
            }
            res.toString = pathArray.toString;
            return res;
        },
        pecache = {}, pecount = [],
        pathEqualiser = function (path1, path2) {
            if ((path1 + path2) in pecache) {
                return pecache[path1 + path2];
            }
            var data = [pathToAbsolute(R.parsePathString(path1)), pathToAbsolute(R.parsePathString(path2))],
                attrs = [{x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0}, {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0}],
                processPath = function (path, d) {
                    if (!path) {
                        return ["U"];
                    }
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "S":
                            var nx = d.x + (d.x - (d.bx || d.x));
                            var ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny, path[1], path[2], path[3], path[4]];
                            break;
                        case "T":
                            var nx = d.x + (d.x - (d.bx || d.x));
                            var ny = d.y + (d.y - (d.by || d.y));
                            path = ["Q", nx, ny, path[1], path[2]];
                            break;
                        case "H":
                            path = ["L", path[1], d.y];
                            break;
                        case "V":
                            path = ["L", d.x, path[1]];
                            break;
                        case "Z":
                            path = ["L", d.X, d.Y];
                            break;
                    }
                    return path;
                },
                edgeCases = function (a, b, i) {
                    if (data[a][i][0] == "M" && data[b][i][0] != "M") {
                        data[b].splice(i, 0, ["M", attrs[b].x, attrs[b].y]);
                        attrs[a].bx = data[a][i][data[a][i].length - 4] || 0;
                        attrs[a].by = data[a][i][data[a][i].length - 3] || 0;
                        attrs[a].x = data[a][i][data[a][i].length - 2];
                        attrs[a].y = data[a][i][data[a][i].length - 1];
                        return true;
                    } else if (data[a][i][0] == "L" && data[b][i][0] == "C") {
                        data[a][i] = ["C", attrs[a].x, attrs[a].y, data[a][i][1], data[a][i][2], data[a][i][1], data[a][i][2]];
                    } else if (data[a][i][0] == "L" && data[b][i][0] == "Q") {
                        data[a][i] = ["Q", data[a][i][1], data[a][i][2], data[a][i][1], data[a][i][2]];
                    } else if (data[a][i][0] == "Q" && data[b][i][0] == "C") {
                        var x = data[b][i][data[b][i].length - 2];
                        var y = data[b][i][data[b][i].length - 1];
                        data[b].splice(i + 1, 0, ["Q", x, y, x, y]);
                        data[a].splice(i, 0, ["C", attrs[a].x, attrs[a].y, attrs[a].x, attrs[a].y, attrs[a].x, attrs[a].y]);
                        i++;
                        attrs[b].bx = data[b][i][data[b][i].length - 4] || 0;
                        attrs[b].by = data[b][i][data[b][i].length - 3] || 0;
                        attrs[b].x = data[b][i][data[b][i].length - 2];
                        attrs[b].y = data[b][i][data[b][i].length - 1];
                        return true;
                    } else if (data[a][i][0] == "A" && data[b][i][0] == "C") {
                        var x = data[b][i][data[b][i].length - 2];
                        var y = data[b][i][data[b][i].length - 1];
                        data[b].splice(i + 1, 0, ["A", 0, 0, data[a][i][3], data[a][i][4], data[a][i][5], x, y]);
                        data[a].splice(i, 0, ["C", attrs[a].x, attrs[a].y, attrs[a].x, attrs[a].y, attrs[a].x, attrs[a].y]);
                        i++;
                        attrs[b].bx = data[b][i][data[b][i].length - 4] || 0;
                        attrs[b].by = data[b][i][data[b][i].length - 3] || 0;
                        attrs[b].x = data[b][i][data[b][i].length - 2];
                        attrs[b].y = data[b][i][data[b][i].length - 1];
                        return true;
                    } else if (data[a][i][0] == "U") {
                        data[a][i][0] = data[b][i][0];
                        for (var j = 1, jj = data[b][i].length; j < jj; j++) {
                            data[a][i][j] = (j % 2) ? attrs[a].x : attrs[a].y;
                        }
                    }
                    return false;
                };
            for (var i = 0; i < Math.max(data[0].length, data[1].length); i++) {
                data[0][i] = processPath(data[0][i], attrs[0]);
                data[1][i] = processPath(data[1][i], attrs[1]);
                if (data[0][i][0] != data[1][i][0] && (edgeCases(0, 1, i) || edgeCases(1, 0, i))) {
                    continue;
                }
                attrs[0].bx = data[0][i][data[0][i].length - 4] || 0;
                attrs[0].by = data[0][i][data[0][i].length - 3] || 0;
                attrs[0].x = data[0][i][data[0][i].length - 2];
                attrs[0].y = data[0][i][data[0][i].length - 1];
                attrs[1].bx = data[1][i][data[1][i].length - 4] || 0;
                attrs[1].by = data[1][i][data[1][i].length - 3] || 0;
                attrs[1].x = data[1][i][data[1][i].length - 2];
                attrs[1].y = data[1][i][data[1][i].length - 1];
            }
            if (pecount.length > 20) {
                delete pecache[pecount.unshift()];
            }
            pecount.push(path1 + path2);
            pecache[path1 + path2] = data;
            return data;
        },
        toGradient = function (gradient) {
        if (typeof gradient == "string") {
            gradient = gradient.split(/\s*\-\s*/);
            var angle = gradient.shift();
            if (angle.toLowerCase() == "v") {
                angle = 90;
            } else if (angle.toLowerCase() == "h") {
                angle = 0;
            } else {
                angle = parseFloat(angle);
            }
            angle = -angle;
            var grobj = {angle: angle, type: "linear", dots: [], vector: [0, 0, Math.cos(angle * Math.PI / 180).toFixed(3), Math.sin(angle * Math.PI / 180).toFixed(3)]};
            var max = 1 / (Math.max(Math.abs(grobj.vector[2]), Math.abs(grobj.vector[3])) || 1);
            grobj.vector[2] *= max;
            grobj.vector[3] *= max;
            if (grobj.vector[2] < 0) {
                grobj.vector[0] = -grobj.vector[2];
                grobj.vector[2] = 0;
            }
            if (grobj.vector[3] < 0) {
                grobj.vector[1] = -grobj.vector[3];
                grobj.vector[3] = 0;
            }
            grobj.vector[0] = grobj.vector[0].toFixed(3);
            grobj.vector[1] = grobj.vector[1].toFixed(3);
            grobj.vector[2] = grobj.vector[2].toFixed(3);
            grobj.vector[3] = grobj.vector[3].toFixed(3);
            for (var i = 0, ii = gradient.length; i < ii; i++) {
                var dot = {};
                var par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]).hex;
                par[2] && (dot.offset = par[2] + "%");
                grobj.dots.push(dot);
            }
            for (var i = 1, ii = grobj.dots.length - 1; i < ii; i++) {
                if (!grobj.dots[i].offset) {
                    var start = parseFloat(grobj.dots[i - 1].offset || 0),
                        end = false;
                    for (var j = i + 1; j < ii; j++) {
                        if (grobj.dots[j].offset) {
                            end = grobj.dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = parseFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        grobj.dots[i].offset = start + "%";
                    }
                }
            }
            return grobj;
        } else {
            return gradient;
        }
    },
        getContainer = function () {
        var container, x, y, width, height;
        if (typeof arguments[0] == "string" || typeof arguments[0] == "object") {
            if (typeof arguments[0] == "string") {
                container = doc.getElementById(arguments[0]);
            } else {
                container = arguments[0];
            }
            if (container.tagName) {
                if (arguments[1] == null) {
                    return {
                        container: container,
                        width: container.style.pixelWidth || container.offsetWidth,
                        height: container.style.pixelHeight || container.offsetHeight
                    };
                } else {
                    return {container: container, width: arguments[1], height: arguments[2]};
                }
            }
        } else if (typeof arguments[0] == "number" && arguments.length > 3) {
            return {container: 1, x: arguments[0], y: arguments[1], width: arguments[2], height: arguments[3]};
        }
    },
        plugins = function (con, add) {
            var that = this;
            for (var prop in add) if (add.hasOwnProperty(prop) && !(prop in con)) {
                switch (typeof add[prop]) {
                    case "function":
                        (function (f) {
                            con[prop] = con === that ? f : function () { return f.apply(that, arguments); };
                        })(add[prop]);
                    break;
                    case "object":
                        con[prop] = con[prop] || {};
                        plugins.call(this, con[prop], add[prop]);
                    break;
                    default:
                        con[prop] = add[prop];
                    break;
                }
            }
        };

    // SVG
    if (R.svg) {
        R.toString = function () {
            return  "Your browser supports SVG.\nYou are running Rapha\u00ebl " + this.version;
        };
        var thePath = function (params, pathString, SVG) {
            var el = doc.createElementNS(SVG.svgns, "path");
            if (SVG.canvas) {
                SVG.canvas.appendChild(el);
            }
            var p = new Element(el, SVG);
            p.isAbsolute = true;
            p.type = "path";
            p.last = {x: 0, y: 0, bx: 0, by: 0};
            p.absolutely = function () {
                this.isAbsolute = true;
                return this;
            };
            p.relatively = function () {
                this.isAbsolute = false;
                return this;
            };
            p.moveTo = function (x, y) {
                var d = this.isAbsolute?"M":"m";
                d += parseFloat(x).toFixed(3) + " " + parseFloat(y).toFixed(3) + " ";
                var oldD = this[0].getAttribute("d") || "";
                (oldD == "M0,0") && (oldD = "");
                this[0].setAttribute("d", oldD + d);
                this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(x);
                this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(y);
                this.attrs.path = oldD + d;
                return this;
            };
            p.lineTo = function (x, y) {
                this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(x);
                this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(y);
                var d = this.isAbsolute?"L":"l";
                d += parseFloat(x).toFixed(3) + " " + parseFloat(y).toFixed(3) + " ";
                var oldD = this[0].getAttribute("d") || "";
                this[0].setAttribute("d", oldD + d);
                this.attrs.path = oldD + d;
                return this;
            };
            p.arcTo = function (rx, ry, large_arc_flag, sweep_flag, x, y) {
                var d = this.isAbsolute ? "A" : "a";
                d += [parseFloat(rx).toFixed(3), parseFloat(ry).toFixed(3), 0, large_arc_flag, sweep_flag, parseFloat(x).toFixed(3), parseFloat(y).toFixed(3)].join(" ");
                var oldD = this[0].getAttribute("d") || "";
                this[0].setAttribute("d", oldD + d);
                this.last.x = parseFloat(x);
                this.last.y = parseFloat(y);
                this.attrs.path = oldD + d;
                return this;
            };
            p.cplineTo = function (x1, y1, w1) {
                if (!w1) {
                    return this.lineTo(x1, y1);
                } else {
                    var p = {};
                    var x = parseFloat(x1);
                    var y = parseFloat(y1);
                    var w = parseFloat(w1);
                    var d = this.isAbsolute?"C":"c";
                    var attr = [+this.last.x + w, +this.last.y, x - w, y, x, y];
                    for (var i = 0, ii = attr.length; i < ii; i++) {
                        d += attr[i].toFixed(3) + " ";
                    }
                    this.last.x = (this.isAbsolute ? 0 : this.last.x) + attr[4];
                    this.last.y = (this.isAbsolute ? 0 : this.last.y) + attr[5];
                    this.last.bx = attr[2];
                    this.last.by = attr[3];
                    var oldD = this[0].getAttribute("d") || "";
                    this[0].setAttribute("d", oldD + d);
                    this.attrs.path = oldD + d;
                    return this;
                }
            };
            p.curveTo = function () {
                var p = {},
                    command = [0, 1, 2, 3, "s", 5, "c"];

                var d = command[arguments.length];
                if (this.isAbsolute) {
                    d = d.toUpperCase();
                }
                for (var i = 0, ii = arguments.length; i < ii; i++) {
                    d += parseFloat(arguments[i]).toFixed(3) + " ";
                }
                this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(arguments[arguments.length - 2]);
                this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(arguments[arguments.length - 1]);
                this.last.bx = parseFloat(arguments[arguments.length - 4]);
                this.last.by = parseFloat(arguments[arguments.length - 3]);
                var oldD = this.node.getAttribute("d") || "";
                this.node.setAttribute("d", oldD + d);
                this.attrs.path = oldD + d;
                return this;
            };
            p.qcurveTo = function () {
                var p = {},
                    command = [0, 1, "t", 3, "q"];

                var d = command[arguments.length];
                if (this.isAbsolute) {
                    d = d.toUpperCase();
                }
                for (var i = 0, ii = arguments.length; i < ii; i++) {
                    d += parseFloat(arguments[i]).toFixed(3) + " ";
                }
                this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(arguments[arguments.length - 2]);
                this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(arguments[arguments.length - 1]);
                if (arguments.length != 2) {
                    this.last.qx = parseFloat(arguments[arguments.length - 4]);
                    this.last.qy = parseFloat(arguments[arguments.length - 3]);
                }
                var oldD = this.node.getAttribute("d") || "";
                this.node.setAttribute("d", oldD + d);
                this.attrs.path = oldD + d;
                return this;
            };
            p.addRoundedCorner = function (r, dir) {
                var R = .5522 * r, rollback = this.isAbsolute, o = this;
                if (rollback) {
                    this.relatively();
                    rollback = function () {
                        o.absolutely();
                    };
                } else {
                    rollback = function () {};
                }
                var actions = {
                    l: function () {
                        return {
                            u: function () {
                                o.curveTo(-R, 0, -r, -(r - R), -r, -r);
                            },
                            d: function () {
                                o.curveTo(-R, 0, -r, r - R, -r, r);
                            }
                        };
                    },
                    r: function () {
                        return {
                            u: function () {
                                o.curveTo(R, 0, r, -(r - R), r, -r);
                            },
                            d: function () {
                                o.curveTo(R, 0, r, r - R, r, r);
                            }
                        };
                    },
                    u: function () {
                        return {
                            r: function () {
                                o.curveTo(0, -R, -(R - r), -r, r, -r);
                            },
                            l: function () {
                                o.curveTo(0, -R, R - r, -r, -r, -r);
                            }
                        };
                    },
                    d: function () {
                        return {
                            r: function () {
                                o.curveTo(0, R, -(R - r), r, r, r);
                            },
                            l: function () {
                                o.curveTo(0, R, R - r, r, -r, r);
                            }
                        };
                    }
                };
                actions[dir[0]]()[dir[1]]();
                rollback();
                return o;
            };
            p.andClose = function () {
                var oldD = this[0].getAttribute("d") || "";
                this[0].setAttribute("d", oldD + "Z ");
                this.attrs.path = oldD + "Z ";
                return this;
            };
            if (pathString) {
                p.attrs.path = "" + pathString;
                p.absolutely();
                paper.pathfinder(p, p.attrs.path);
            }
            if (params) {
                !params.gradient && (params.fill = params.fill || "none");
                params.stroke = params.stroke || "#000";
            } else {
                params = {fill: "none", stroke: "#000"};
            }
            setFillAndStroke(p, params);
            return p;
        };
        var addGradientFill = function (o, gradient, SVG) {
            gradient = toGradient(gradient);
            var el = doc.createElementNS(SVG.svgns, (gradient.type || "linear") + "Gradient");
            el.id = "raphael-gradient-" + R.idGenerator++;
            if (gradient.vector && gradient.vector.length) {
                el.setAttribute("x1", gradient.vector[0]);
                el.setAttribute("y1", gradient.vector[1]);
                el.setAttribute("x2", gradient.vector[2]);
                el.setAttribute("y2", gradient.vector[3]);
            }
            SVG.defs.appendChild(el);
            var isopacity = true;
            for (var i = 0, ii = gradient.dots.length; i < ii; i++) {
                var stop = doc.createElementNS(SVG.svgns, "stop");
                if (gradient.dots[i].offset) {
                    isopacity = false;
                }
                stop.setAttribute("offset", gradient.dots[i].offset ? gradient.dots[i].offset : (i == 0) ? "0%" : "100%");
                stop.setAttribute("stop-color", R.getRGB(gradient.dots[i].color).hex || "#fff");
                // ignoring opacity for internal points, because VML doesn't support it
                el.appendChild(stop);
            };
            if (isopacity && typeof gradient.dots[ii - 1].opacity != "undefined") {
                stop.setAttribute("stop-opacity", gradient.dots[ii - 1].opacity);
            }
            o.setAttribute("fill", "url(#" + el.id + ")");
            o.style.fill = "";
            o.style.opacity = 1;
            o.style.fillOpacity = 1;
            o.setAttribute("opacity", 1);
            o.setAttribute("fill-opacity", 1);
        };
        var updatePosition = function (o) {
            if (o.pattern) {
                var bbox = o.getBBox();
                o.pattern.setAttribute("patternTransform", "translate(".concat(bbox.x, ",", bbox.y, ")"));
            }
        };
        var setFillAndStroke = function (o, params) {
            var dasharray = {
                "-": [3, 1],
                ".": [1, 1],
                "-.": [3, 1, 1, 1],
                "-..": [3, 1, 1, 1, 1, 1],
                ". ": [1, 3],
                "- ": [4, 3],
                "--": [8, 3],
                "- .": [4, 3, 1, 3],
                "--.": [8, 3, 1, 3],
                "--..": [8, 3, 1, 3, 1, 3]
            },
            node = o.node,
            attrs = o.attrs;
            addDashes = function (o, value) {
                value = dasharray[value.toString().toLowerCase()];
                if (value) {
                    var width = o.attrs["stroke-width"] || "1",
                        butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                        dashes = [];
                    for (var i = 0, ii = value.length; i < ii; i++) {
                        dashes.push(value[i] * width + ((i % 2) ? 1 : -1) * butt);
                    }
                    value = dashes.join(",");
                    node.setAttribute("stroke-dasharray", value);
                }
            };
            for (var att in params) {
                if (!(att in availableAttrs)) {
                    continue;
                }
                var value = params[att];
                attrs[att] = value;
                switch (att) {
                    // Hyperlink
                    case "href":
                    case "title":
                    case "target":
                        var pn = node.parentNode;
                        if (pn.tagName.toLowerCase() != "a") {
                            var hl = doc.createElementNS(o.paper.svgns, "a");
                            pn.insertBefore(hl, node);
                            hl.appendChild(node);
                            pn = hl;
                        }
                        pn.setAttributeNS(o.paper.xlink, att, value);
                      break;
                    case "path":
                        if (o.type == "path") {
                            node.setAttribute("d", "M0,0");
                            paper.pathfinder(o, value);
                        }
                    case "width":
                        node.setAttribute(att, value);
                        if (attrs.fx) {
                            att = "x";
                            value = attrs.x;
                        } else {
                            break;
                        }
                    case "x":
                        if (attrs.fx) {
                            value = -attrs.x - (attrs.width || 0);
                        }
                    case "rx":
                    case "cx":
                        node.setAttribute(att, value);
                        updatePosition(o);
                        break;
                    case "height":
                        node.setAttribute(att, value);
                        if (attrs.fy) {
                            att = "y";
                            value = attrs.y;
                        } else {
                            break;
                        }
                    case "y":
                        if (attrs.fy) {
                            value = -attrs.y - (attrs.height || 0);
                        }
                    case "ry":
                    case "cy":
                        node.setAttribute(att, value);
                        updatePosition(o);
                        break;
                    case "r":
                        if (o.type == "rect") {
                            node.setAttribute("rx", value);
                            node.setAttribute("ry", value);
                        } else {
                            node.setAttribute(att, value);
                        }
                        break;
                    case "src":
                        if (o.type == "image") {
                            node.setAttributeNS(o.paper.xlink, "href", value);
                        }
                        break;
                    case "stroke-width":
                        node.style.strokeWidth = value;
                        // Need following line for Firefox
                        node.setAttribute(att, value);
                        if (attrs["stroke-dasharray"]) {
                            addDashes(o, attrs["stroke-dasharray"]);
                        }
                        break;
                    case "stroke-dasharray":
                        addDashes(o, value);
                        break;
                    case "rotation":
                        o.rotate(value, true);
                        break;
                    case "translation":
                        var xy = (value + "").split(separator);
                        o.translate((+xy[0] + 1 || 2) - 1, (+xy[1] + 1 || 2) - 1);
                        break;
                    case "scale":
                        var xy = (value + "").split(separator);
                        o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
                        break;
                    case "fill":
                        var isURL = (value + "").match(/^url\(([^\)]+)\)$/i);
                        if (isURL) {
                            var el = doc.createElementNS(o.paper.svgns, "pattern");
                            var ig = doc.createElementNS(o.paper.svgns, "image");
                            el.id = "raphael-pattern-" + R.idGenerator++;
                            el.setAttribute("x", 0);
                            el.setAttribute("y", 0);
                            el.setAttribute("patternUnits", "userSpaceOnUse");
                            ig.setAttribute("x", 0);
                            ig.setAttribute("y", 0);
                            ig.setAttributeNS(o.paper.xlink, "href", isURL[1]);
                            el.appendChild(ig);

                            var img = doc.createElement("img");
                            img.style.position = "absolute";
                            img.style.top = "-9999em";
                            img.style.left = "-9999em";
                            img.onload = function () {
                                el.setAttribute("width", this.offsetWidth);
                                el.setAttribute("height", this.offsetHeight);
                                ig.setAttribute("width", this.offsetWidth);
                                ig.setAttribute("height", this.offsetHeight);
                                doc.body.removeChild(this);
                                paper.safari();
                            };
                            doc.body.appendChild(img);
                            img.src = isURL[1];
                            o.paper.defs.appendChild(el);
                            node.style.fill = "url(#" + el.id + ")";
                            node.setAttribute("fill", "url(#" + el.id + ")");
                            o.pattern = el;
                            updatePosition(o);
                            break;
                        }
                        delete params.gradient;
                        delete attrs.gradient;
                        if (typeof attrs.opacity != "undefined" && typeof params.opacity == "undefined" ) {
                            node.style.opacity = attrs.opacity;
                            // Need following line for Firefox
                            node.setAttribute("opacity", attrs.opacity);
                        }
                        if (typeof attrs["fill-opacity"] != "undefined" && typeof params["fill-opacity"] == "undefined" ) {
                            node.style.fillOpacity = o.attrs["fill-opacity"];
                            // Need following line for Firefox
                            node.setAttribute("fill-opacity", attrs["fill-opacity"]);
                        }
                    case "stroke":
                        node.style[att] = R.getRGB(value).hex;
                        // Need following line for Firefox
                        node.setAttribute(att, R.getRGB(value).hex);
                        break;
                    case "gradient":
                        addGradientFill(node, value, o.paper);
                        break;
                    case "opacity":
                    case "fill-opacity":
                        if (attrs.gradient) {
                            var gradient = doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, ""));
                            if (gradient) {
                                var stops = gradient.getElementsByTagName("stop");
                                stops[stops.length - 1].setAttribute("stop-opacity", value);
                            }
                            break;
                        }
                    default :
                        var cssrule = att.replace(/(\-.)/g, function (w) {
                            return w.substring(1).toUpperCase();
                        });
                        node.style[cssrule] = value;
                        // Need following line for Firefox
                        node.setAttribute(att, value);
                        break;
                }
            }
            
            tuneText(o, params);
        };
        var leading = 1.2;
        var tuneText = function (el, params) {
            if (el.type != "text" || !("text" in params || "font" in params || "font-size" in params || "x" in params || "y" in params)) {
                return;
            }
            var a = el.attrs,
                node = el.node,
                fontSize = node.firstChild ? parseInt(doc.defaultView.getComputedStyle(node.firstChild, "").getPropertyValue("font-size"), 10) : 10;

            if ("text" in params) {
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
                var texts = (params.text + "").split("\n");
                for (var i = 0, ii = texts.length; i < ii; i++) {
                    var tspan = doc.createElementNS(el.paper.svgns, "tspan");
                    i && tspan.setAttribute("dy", fontSize * leading);
                    i && tspan.setAttribute("x", a.x);
                    tspan.appendChild(doc.createTextNode(texts[i]));
                    node.appendChild(tspan);
                }
            } else {
                var texts = node.getElementsByTagName("tspan");
                for (var i = 0, ii = texts.length; i < ii; i++) {
                    i && texts[i].setAttribute("dy", fontSize * leading);
                    i && texts[i].setAttribute("x", a.x);
                }
            }
            node.setAttribute("y", a.y);
            var bb = el.getBBox(),
                dif = a.y - (bb.y + bb.height / 2);
            dif && node.setAttribute("y", a.y + dif);
        };
        var Element = function (node, svg) {
            var X = 0,
                Y = 0;
            this[0] = node;
            this.node = node;
            this.paper = svg;
            this.attrs = this.attrs || {};
            this.transformations = []; // rotate, translate, scale
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg: 0, x: 0, y: 0},
                sx: 1,
                sy: 1
            };
        };
        Element.prototype.rotate = function (deg, cx, cy) {
            if (deg == null) {
                return this._.rt.deg;
            }
            var bbox = this.getBBox();
            deg = deg.toString().split(separator);
            if (deg.length - 1) {
                cx = parseFloat(deg[1]);
                cy = parseFloat(deg[2]);
            }
            deg = parseFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            if (cy == null) {
                cx = null;
            }
            cx = cx == null ? bbox.x + bbox.width / 2 : cx;
            cy = cy == null ? bbox.y + bbox.height / 2 : cy;
            if (this._.rt.deg) {
                this.transformations[0] = ("rotate(" + this._.rt.deg + " " + cx + " " + cy + ")");
            } else {
                this.transformations[0] = "";
            }
            this.node.setAttribute("transform", this.transformations.join(" "));
            return this;
        };
        Element.prototype.hide = function () {
            this.node.style.display = "none";
            return this;
        };
        Element.prototype.show = function () {
            this.node.style.display = "block";
            return this;
        };
        Element.prototype.remove = function () {
            this.node.parentNode.removeChild(this.node);
        };
        Element.prototype.getBBox = function () {
            var bbox = this.node.getBBox();
            if (this.type == "text") {
                bbox = {x: bbox.x, y: Infinity, width: bbox.width, height: 0};
                for (var i = 0, ii = this.node.getNumberOfChars(); i < ii; i++) {
                    var bb = this.node.getExtentOfChar(i);
                    (bb.y < bbox.y) && (bbox.y = bb.y);
                    (bb.y + bb.height - bbox.y > bbox.height) && (bbox.height = bb.y + bb.height - bbox.y);
                }
            }
            return bbox;
        };
        Element.prototype.attr = function () {
            if (arguments.length == 1 && typeof arguments[0] == "string") {
                if (arguments[0] == "translation") {
                    return this.translate();
                }
                return this.attrs[arguments[0]];
            }
            if (arguments.length == 1 && arguments[0] instanceof win.Array) {
                var values = {};
                for (var j in arguments[0]) {
                    values[arguments[0][j]] = this.attrs[arguments[0][j]];
                }
                return values;
            }
            if (arguments.length == 2) {
                var params = {};
                params[arguments[0]] = arguments[1];
                setFillAndStroke(this, params);
            } else if (arguments.length == 1 && typeof arguments[0] == "object") {
                setFillAndStroke(this, arguments[0]);
            }
            return this;
        };
        Element.prototype.toFront = function () {
            this.node.parentNode.appendChild(this.node);
            return this;
        };
        Element.prototype.toBack = function () {
            if (this.node.parentNode.firstChild != this.node) {
                this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
            }
            return this;
        };
        Element.prototype.insertAfter = function (element) {
            if (element.node.nextSibling) {
                element.node.parentNode.insertBefore(this.node, element.node.nextSibling);
            } else {
                element.node.parentNode.appendChild(this.node);
            }
            return this;
        };
        Element.prototype.insertBefore = function (element) {
            element.node.parentNode.insertBefore(this.node, element.node);
            return this;
        };
        var theCircle = function (svg, x, y, r) {
            var el = doc.createElementNS(svg.svgns, "circle");
            el.setAttribute("cx", x);
            el.setAttribute("cy", y);
            el.setAttribute("r", r);
            el.setAttribute("fill", "none");
            el.setAttribute("stroke", "#000");
            if (svg.canvas) {
                svg.canvas.appendChild(el);
            }
            var res = new Element(el, svg);
            res.attrs = res.attrs || {};
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.r = r;
            res.attrs.stroke = "#000";
            res.type = "circle";
            return res;
        };
        var theRect = function (svg, x, y, w, h, r) {
            var el = doc.createElementNS(svg.svgns, "rect");
            el.setAttribute("x", x);
            el.setAttribute("y", y);
            el.setAttribute("width", w);
            el.setAttribute("height", h);
            if (r) {
                el.setAttribute("rx", r);
                el.setAttribute("ry", r);
            }
            el.setAttribute("fill", "none");
            el.setAttribute("stroke", "#000");
            if (svg.canvas) {
                svg.canvas.appendChild(el);
            }
            var res = new Element(el, svg);
            res.attrs = res.attrs || {};
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.width = w;
            res.attrs.height = h;
            res.attrs.stroke = "#000";
            if (r) {
                res.attrs.rx = res.attrs.ry = r;
            }
            res.type = "rect";
            return res;
        };
        var theEllipse = function (svg, x, y, rx, ry) {
            var el = doc.createElementNS(svg.svgns, "ellipse");
            el.setAttribute("cx", x);
            el.setAttribute("cy", y);
            el.setAttribute("rx", rx);
            el.setAttribute("ry", ry);
            el.setAttribute("fill", "none");
            el.setAttribute("stroke", "#000");
            if (svg.canvas) {
                svg.canvas.appendChild(el);
            }
            var res = new Element(el, svg);
            res.attrs = res.attrs || {};
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.rx = rx;
            res.attrs.ry = ry;
            res.attrs.stroke = "#000";
            res.type = "ellipse";
            return res;
        };
        var theImage = function (svg, src, x, y, w, h) {
            var el = doc.createElementNS(svg.svgns, "image");
            el.setAttribute("x", x);
            el.setAttribute("y", y);
            el.setAttribute("width", w);
            el.setAttribute("height", h);
            el.setAttribute("preserveAspectRatio", "none");
            el.setAttributeNS(svg.xlink, "href", src);
            if (svg.canvas) {
                svg.canvas.appendChild(el);
            }
            var res = new Element(el, svg);
            res.attrs = res.attrs || {};
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.width = w;
            res.attrs.height = h;
            res.type = "image";
            return res;
        };
        var theText = function (svg, x, y, text) {
            var el = doc.createElementNS(svg.svgns, "text");
            el.setAttribute("x", x);
            el.setAttribute("y", y);
            el.setAttribute("text-anchor", "middle");
            if (svg.canvas) {
                svg.canvas.appendChild(el);
            }
            var res = new Element(el, svg);
            res.attrs = res.attrs || {};
            res.attrs.x = x;
            res.attrs.y = y;
            res.type = "text";
            setFillAndStroke(res, {font: availableAttrs.font, stroke: "none", fill: "#000", text: text});
            return res;
        };
        var setSize = function (width, height) {
            this.width = width || this.width;
            this.height = height || this.height;
            this.canvas.setAttribute("width", this.width);
            this.canvas.setAttribute("height", this.height);
            return this;
        };
        var create = function () {
            var con = getContainer.apply(null, arguments);
            var container = con.container,
                x = con.x,
                y = con.y,
                width = con.width,
                height = con.height;
            if (!container) {
                throw new Error("SVG container not found.");
            }
            paper.canvas = doc.createElementNS(paper.svgns, "svg");
            paper.canvas.setAttribute("width", width || 512);
            paper.width = width || 512;
            paper.canvas.setAttribute("height", height || 342);
            paper.height = height || 342;
            if (container == 1) {
                doc.body.appendChild(paper.canvas);
                paper.canvas.style.position = "absolute";
                paper.canvas.style.left = x + "px";
                paper.canvas.style.top = y + "px";
            } else {
                if (container.firstChild) {
                    container.insertBefore(paper.canvas, container.firstChild);
                } else {
                    container.appendChild(paper.canvas);
                }
            }
            container = {
                canvas: paper.canvas,
                clear: function () {
                    while (this.canvas.firstChild) {
                        this.canvas.removeChild(this.canvas.firstChild);
                    }
                    this.defs = doc.createElementNS(paper.svgns, "defs");
                    this.canvas.appendChild(this.defs);
                }
            };
            for (var prop in paper) {
                if (prop != "create") {
                    container[prop] = paper[prop];
                }
            }
            plugins.call(container, container, R.fn);
            container.clear();
            container.raphael = R;
            return container;
        };
        paper.remove = function () {
            this.canvas.parentNode.removeChild(this.canvas);
        };
        paper.svgns = "http://www.w3.org/2000/svg";
        paper.xlink = "http://www.w3.org/1999/xlink";
        paper.safari = function () {
            if ({"Apple Computer, Inc.": 1, "Google Inc.": 1}[navigator.vendor]) {
                var rect = this.rect(-this.width, -this.height, this.width * 3, this.height * 3).attr({stroke: "none"});
                setTimeout(function () {rect.remove();});
            }
        };
    }

    // VML
    if (R.vml) {
        R.toString = function () {
            return  "Your browser doesn\u2019t support SVG.\nYou are running Rapha\u00ebl " + this.version;
        };
        thePath = function (params, pathString, VML) {
            var g = createNode("group"), gl = g.style;
            gl.position = "absolute";
            gl.left = 0;
            gl.top = 0;
            gl.width = VML.width + "px";
            gl.height = VML.height + "px";
            var el = createNode("shape"), ol = el.style;
            ol.width = VML.width + "px";
            ol.height = VML.height + "px";
            el.path = "";
            if (params["class"]) {
                el.className = "rvml " + params["class"];
            }
            el.coordsize = this.coordsize;
            el.coordorigin = this.coordorigin;
            g.appendChild(el);
            var p = new Element(el, g, VML);
            p.isAbsolute = true;
            p.type = "path";
            p.path = [];
            p.last = {x: 0, y: 0, bx: 0, by: 0, isAbsolute: true};
            p.Path = "";
            p.absolutely = function () {
                this.isAbsolute = true;
                return this;
            };
            p.relatively = function () {
                this.isAbsolute = false;
                return this;
            };
            p.moveTo = function (x, y) {
                var d = this.isAbsolute?"m":"t";
                d += Math.round(parseFloat(x)) + " " + Math.round(parseFloat(y));
                this.node.path = this.Path += d;
                this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(x);
                this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(y);
                this.last.isAbsolute = this.isAbsolute;
                this.attrs.path += (this.isAbsolute ? "M" : "m") + [x, y];
                return this;
            };
            p.lineTo = function (x, y) {
                var d = this.isAbsolute?"l":"r";
                d += Math.round(parseFloat(x)) + " " + Math.round(parseFloat(y));
                this[0].path = this.Path += d;
                this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(x);
                this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(y);
                this.last.isAbsolute = this.isAbsolute;
                this.attrs.path += (this.isAbsolute ? "L" : "l") + [x, y];
                return this;
            };
            p.arcTo = function (rx, ry, large_arc_flag, sweep_flag, x2, y2) {
                // for more information of where this math came from visit:
                // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
                x2 = (this.isAbsolute ? 0 : this.last.x) + x2;
                y2 = (this.isAbsolute ? 0 : this.last.y) + y2;
                var x1 = this.last.x,
                    y1 = this.last.y,
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        Math.sqrt(Math.abs(rx * rx * ry * ry - rx * rx * y * y - ry * ry * x * x) / (rx * rx * y * y + ry * ry * x * x)),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    d = sweep_flag ? (this.isAbsolute ? "wa" : "wr") : (this.isAbsolute ? "at" : "ar"),
                    left = Math.round(cx - rx),
                    top = Math.round(cy - ry);
                d += [left, top, Math.round(left + rx * 2), Math.round(top + ry * 2), Math.round(x1), Math.round(y1), Math.round(parseFloat(x2)), Math.round(parseFloat(y2))].join(", ");
                this.node.path = this.Path += d;
                this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(x2);
                this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(y2);
                this.last.isAbsolute = this.isAbsolute;
                this.attrs.path += (this.isAbsolute ? "A" : "a") + [rx, ry, 0, large_arc_flag, sweep_flag, x2, y2];
                return this;
            };
            p.cplineTo = function (x1, y1, w1) {
                if (!w1) {
                    return this.lineTo(x1, y1);
                } else {
                    var x = Math.round(Math.round(parseFloat(x1) * 100) / 100),
                        y = Math.round(Math.round(parseFloat(y1) * 100) / 100),
                        w = Math.round(Math.round(parseFloat(w1) * 100) / 100),
                        d = this.isAbsolute ? "c" : "v",
                        attr = [Math.round(this.last.x) + w, Math.round(this.last.y), x - w, y, x, y],
                        svgattr = [this.last.x + w1, this.last.y, x1 - w1, y1, x1, y1];
                    d += attr.join(" ") + " ";
                    this.last.x = (this.isAbsolute ? 0 : this.last.x) + attr[4];
                    this.last.y = (this.isAbsolute ? 0 : this.last.y) + attr[5];
                    this.last.bx = attr[2];
                    this.last.by = attr[3];
                    this.node.path = this.Path += d;
                    this.attrs.path += (this.isAbsolute ? "C" : "c") + svgattr;
                    return this;
                }
            };
            p.curveTo = function () {
                var d = this.isAbsolute ? "c" : "v";
                if (arguments.length == 6) {
                    this.last.bx = (this.isAbsolute ? 0 : this.last.x) + parseFloat(arguments[2]);
                    this.last.by = (this.isAbsolute ? 0 : this.last.y) + parseFloat(arguments[3]);
                    this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(arguments[4]);
                    this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(arguments[5]);
                    d += [Math.round(parseFloat(arguments[0])),
                         Math.round(parseFloat(arguments[1])),
                         Math.round(parseFloat(arguments[2])),
                         Math.round(parseFloat(arguments[3])),
                         Math.round(parseFloat(arguments[4])),
                         Math.round(parseFloat(arguments[5]))].join(" ") + " ";
                    this.last.isAbsolute = this.isAbsolute;
                    this.attrs.path += (this.isAbsolute ? "C" : "c") + Array.prototype.splice.call(arguments, 0, arguments.length);
                }
                if (arguments.length == 4) {
                    var bx = this.last.x * 2 - this.last.bx;
                    var by = this.last.y * 2 - this.last.by;
                    this.last.bx = (this.isAbsolute ? 0 : this.last.x) + parseFloat(arguments[0]);
                    this.last.by = (this.isAbsolute ? 0 : this.last.y) + parseFloat(arguments[1]);
                    this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(arguments[2]);
                    this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(arguments[3]);
                    d += [Math.round(bx), Math.round(by),
                         Math.round(parseFloat(arguments[0])),
                         Math.round(parseFloat(arguments[1])),
                         Math.round(parseFloat(arguments[2])),
                         Math.round(parseFloat(arguments[3]))].join(" ") + " ";
                     this.attrs.path += (this.isAbsolute ? "S" : "s") + Array.prototype.splice.call(arguments, 0, arguments.length);
                }
                this.node.path = this.Path += d;
                return this;
            };
            p.qcurveTo = function () {
                var d = "qb";
                if (arguments.length == 4) {
                    this.last.qx = (this.isAbsolute ? 0 : this.last.x) + parseFloat(arguments[0]);
                    this.last.qy = (this.isAbsolute ? 0 : this.last.y) + parseFloat(arguments[1]);
                    this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(arguments[2]);
                    this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(arguments[3]);
                    d += [Math.round(this.last.qx),
                         Math.round(this.last.qy),
                         Math.round(this.last.x),
                         Math.round(this.last.y)].join(" ") + " ";
                    this.last.isAbsolute = this.isAbsolute;
                    this.attrs.path += (this.isAbsolute ? "Q" : "q") + Array.prototype.splice.call(arguments, 0, arguments.length);
                }
                if (arguments.length == 2) {
                    this.last.qx = this.last.x * 2 - this.last.qx;
                    this.last.qy = this.last.y * 2 - this.last.qy;
                    this.last.x = (this.isAbsolute ? 0 : this.last.x) + parseFloat(arguments[2]);
                    this.last.y = (this.isAbsolute ? 0 : this.last.y) + parseFloat(arguments[3]);
                    d += [Math.round(this.last.qx),
                         Math.round(this.last.qy),
                         Math.round(this.last.x),
                         Math.round(this.last.y)].join(" ") + " ";
                     this.attrs.path += (this.isAbsolute ? "T" : "t") + Array.prototype.splice.call(arguments, 0, arguments.length);
                }
                this.node.path = this.Path += d;
                this.path.push({type: "qcurve", arg: [].slice.call(arguments, 0), pos: this.isAbsolute});
                return this;
            };
            p.addRoundedCorner = function (r, dir) {
                var R = .5522 * r, rollback = this.isAbsolute, o = this;
                if (rollback) {
                    this.relatively();
                    rollback = function () {
                        o.absolutely();
                    };
                } else {
                    rollback = function () {};
                }
                var actions = {
                    l: function () {
                        return {
                            u: function () {
                                o.curveTo(-R, 0, -r, -(r - R), -r, -r);
                            },
                            d: function () {
                                o.curveTo(-R, 0, -r, r - R, -r, r);
                            }
                        };
                    },
                    r: function () {
                        return {
                            u: function () {
                                o.curveTo(R, 0, r, -(r - R), r, -r);
                            },
                            d: function () {
                                o.curveTo(R, 0, r, r - R, r, r);
                            }
                        };
                    },
                    u: function () {
                        return {
                            r: function () {
                                o.curveTo(0, -R, -(R - r), -r, r, -r);
                            },
                            l: function () {
                                o.curveTo(0, -R, R - r, -r, -r, -r);
                            }
                        };
                    },
                    d: function () {
                        return {
                            r: function () {
                                o.curveTo(0, R, -(R - r), r, r, r);
                            },
                            l: function () {
                                o.curveTo(0, R, R - r, r, -r, r);
                            }
                        };
                    }
                };
                actions[dir.charAt(0)]()[dir.charAt(1)]();
                rollback();
                return o;
            };
            p.andClose = function () {
                this.node.path = (this.Path += "x");
                this.attrs.path += "z";
                return this;
            };
            if (pathString) {
                p.absolutely();
                p.attrs.path = "";
                paper.pathfinder(p, "" + pathString);
            }
            if (params) {
                params.fill = params.fill || "none";
                params.stroke = params.stroke || "#000";
            } else {
                params = {fill: "none", stroke: "#000"};
            }
            setFillAndStroke(p, params);
            if (params.gradient) {
                addGradientFill(p, params.gradient);
            }
            VML.canvas.appendChild(g);
            return p;
        };
        var setFillAndStroke = function (o, params) {
            var node = o.node,
                s = node.style,
                res = o;
            o.attrs = o.attrs || {};
            for (var par in params) {
                o.attrs[par] = params[par];
            }
            params.href && (node.href = params.href);
            params.title && (node.title = params.title);
            params.target && (node.target = params.target);
            if (params.path && o.type == "path") {
                o.Path = "";
                o.path = [];
                paper.pathfinder(o, params.path);
            }
            if (params.rotation != null) {
                o.rotate(params.rotation, true);
            }
            if (params.translation) {
                var xy = (params.translation + "").split(separator);
                o.translate(xy[0], xy[1]);
            }
            if (params.scale) {
                var xy = (params.scale + "").split(separator);
                o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
            }
            if (o.type == "image" && params.src) {
                node.src = params.src;
            }
            if (o.type == "image" && params.opacity) {
                node.filterOpacity = " progid:DXImageTransform.Microsoft.Alpha(opacity=" + (params.opacity * 100) + ")";
                node.style.filter = (node.filterMatrix || "") + (node.filterOpacity || "");
            }
            params.font && (s.font = params.font);
            params["font-family"] && (s.fontFamily = params["font-family"]);
            params["font-size"] && (s.fontSize = params["font-size"]);
            params["font-weight"] && (s.fontWeight = params["font-weight"]);
            params["font-style"] && (s.fontStyle = params["font-style"]);
            if (typeof params.opacity != "undefined" || typeof params["stroke-width"] != "undefined" || typeof params.fill != "undefined" || typeof params.stroke != "undefined" || params["stroke-width"] || params["stroke-opacity"] || params["fill-opacity"] || params["stroke-dasharray"] || params["stroke-miterlimit"] || params["stroke-linejoin"] || params["stroke-linecap"]) {
                o = o.shape || node;
                var fill = (o.getElementsByTagName("fill") && o.getElementsByTagName("fill")[0]) || createNode("fill");
                if ("fill-opacity" in params || "opacity" in params) {
                    fill.opacity = ((+params["fill-opacity"] + 1 || 2) - 1) * ((+params.opacity + 1 || 2) - 1);
                }
                params.fill && (fill.on = true);
                if (typeof fill.on == "undefined" || params.fill == "none") {
                    fill.on = false;
                }
                if (fill.on && params.fill) {
                    var isURL = params.fill.match(/^url\(([^\)]+)\)$/i);
                    if (isURL) {
                        fill.src = isURL[1];
                        fill.type = "tile";
                    } else {
                        fill.color = R.getRGB(params.fill).hex;
                        fill.src = "";
                        fill.type = "solid";
                    }
                }
                o.appendChild(fill);
                var stroke = (o.getElementsByTagName("stroke") && o.getElementsByTagName("stroke")[0]) || createNode("stroke");
                if ((params.stroke && params.stroke != "none") || params["stroke-width"] || typeof params["stroke-opacity"] != "undefined" || params["stroke-dasharray"] || params["stroke-miterlimit"] || params["stroke-linejoin"] || params["stroke-linecap"]) {
                    stroke.on = true;
                }
                if (params.stroke == "none" || typeof stroke.on == "undefined" || params.stroke == 0) {
                    stroke.on = false;
                }
                if (stroke.on && params.stroke) {
                    stroke.color = R.getRGB(params.stroke).hex;
                }
                stroke.opacity = ((+params["stroke-opacity"] + 1 || 2) - 1) * ((+params.opacity + 1 || 2) - 1);
                params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
                stroke.miterlimit = params["stroke-miterlimit"] || 8;
                params["stroke-linecap"] && (stroke.endcap = {butt: "flat", square: "square", round: "round"}[params["stroke-linecap"]] || "miter");
                params["stroke-width"] && (stroke.weight = (parseFloat(params["stroke-width"]) || 1) * 12 / 16);
                if (params["stroke-dasharray"]) {
                    var dasharray = {
                        "-": "shortdash",
                        ".": "shortdot",
                        "-.": "shortdashdot",
                        "-..": "shortdashdotdot",
                        ". ": "dot",
                        "- ": "dash",
                        "--": "longdash",
                        "- .": "dashdot",
                        "--.": "longdashdot",
                        "--..": "longdashdotdot"
                    };
                    stroke.dashstyle = dasharray[params["stroke-dasharray"]] || "";
                }
                o.appendChild(stroke);
            }
            if (res.type == "text") {
                var span = doc.createElement("span"),
                    s = span.style,
                    a = res.attrs;
                s.padding = 0;
                s.margin = 0;
                s.lineHeight = 1;
                s.display = "inline";
                a.font && (s.font = a.font);
                a["font-family"] && (s.fontFamily = a["font-family"]);
                a["font-size"] && (s.fontSize = a["font-size"]);
                a["font-weight"] && (s.fontWeight = a["font-weight"]);
                a["font-style"] && (s.fontStyle = a["font-style"]);
                res.node.parentNode.appendChild(span);
                span.innerText = res.node.string;
                res.W = a.w = span.offsetWidth;
                res.H = a.h = span.offsetHeight;
                res.X = a.x;
                res.Y = a.y + Math.round(res.H / 2);
                res.node.parentNode.removeChild(span);

                // text-anchor emulation
                switch (a["text-anchor"]) {
                    case "start":
                        res.node.style["v-text-align"] = "left";
                        res.bbx = Math.round(res.W / 2);
                    break;
                    case "end":
                        res.node.style["v-text-align"] = "right";
                        res.bbx = -Math.round(res.W / 2);
                    break;
                    default:
                        res.node.style["v-text-align"] = "center";
                    break;
                }
            }
        };
        var getAngle = function (a, b, c, d) {
            var angle = Math.round(Math.atan((parseFloat(c) - parseFloat(a)) / (parseFloat(d) - parseFloat(b))) * 57.29) || 0;
            if (!angle && parseFloat(a) < parseFloat(b)) {
                angle = 180;
            }
            angle -= 180;
            if (angle < 0) {
                angle += 360;
            }
            return angle;
        };
        var addGradientFill = function (o, gradient) {
            gradient = toGradient(gradient);
            o.attrs = o.attrs || {};
            var attrs = o.attrs;
            o.attrs.gradient = gradient;
            o = o.shape || o[0];
            var fill = o.getElementsByTagName("fill");
            if (fill.length) {
                fill = fill[0];
            } else {
                fill = createNode("fill");
            }
            if (gradient.dots.length) {
                fill.on = true;
                fill.method = "none";
                fill.type = ((gradient.type + "").toLowerCase() == "radial") ? "gradientTitle" : "gradient";
                if (typeof gradient.dots[0].color != "undefined") {
                    fill.color = R.getRGB(gradient.dots[0].color).hex;
                }
                if (typeof gradient.dots[gradient.dots.length - 1].color != "undefined") {
                    fill.color2 = R.getRGB(gradient.dots[gradient.dots.length - 1].color).hex;
                }
                var clrs = [];
                for (var i = 0, ii = gradient.dots.length; i < ii; i++) {
                    if (gradient.dots[i].offset) {
                        clrs.push(gradient.dots[i].offset + " " + R.getRGB(gradient.dots[i].color).hex);
                    }
                };
                var fillOpacity = typeof gradient.dots[gradient.dots.length - 1].opacity == "undefined" ? (typeof attrs.opacity == "undefined" ? 1 : attrs.opacity) : gradient.dots[gradient.dots.length - 1].opacity;
                if (clrs.length) {
                    fill.colors.value = clrs.join(",");
                    fillOpacity = typeof attrs.opacity == "undefined" ? 1 : attrs.opacity;
                } else {
                    fill.colors && (fill.colors.value = "0% " + fill.color);
                }
                fill.opacity = fillOpacity;
                if (typeof gradient.angle != "undefined") {
                    fill.angle = (-gradient.angle + 270) % 360;
                } else if (gradient.vector) {
                    fill.angle = getAngle.apply(null, gradient.vector);
                }
                if ((gradient.type + "").toLowerCase() == "radial") {
                    fill.focus = "100%";
                    fill.focusposition = "0.5 0.5";
                }
            }
        };
        var Element = function (node, group, vml) {
            var Rotation = 0,
                RotX = 0,
                RotY = 0,
                Scale = 1;
            this[0] = node;
            this.node = node;
            this.X = 0;
            this.Y = 0;
            this.attrs = {};
            this.Group = group;
            this.paper = vml;
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg:0},
                sx: 1,
                sy: 1
            };
        };
        Element.prototype.rotate = function (deg, cx, cy) {
            if (deg == null) {
                return this._.rt.deg;
            }
            deg = deg.toString().split(separator);
            if (deg.length - 1) {
                cx = parseFloat(deg[1]);
                cy = parseFloat(deg[2]);
            }
            deg = parseFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            if (cy == null) {
                cx = null;
            }
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            this.setBox(null, cx, cy);
            this.Group.style.rotation = this._.rt.deg;
            // gradient fix for rotation. TODO
            // var fill = (this.shape || this.node).getElementsByTagName("fill");
            // fill = fill[0] || {};
            // var b = ((360 - this._.rt.deg) - 270) % 360;
            // typeof fill.angle != "undefined" && (fill.angle = b);
            return this;
        };
        Element.prototype.setBox = function (params, cx, cy) {
            var gs = this.Group.style,
                os = (this.shape && this.shape.style) || this.node.style;
            params = params || {};
            for (var i in params) {
                this.attrs[i] = params[i];
            }
            cx = cx || this._.rt.cx;
            cy = cy || this._.rt.cy;
            var attr = this.attrs, x, y, w, h;
            switch (this.type) {
                case "circle":
                    x = attr.cx - attr.r;
                    y = attr.cy - attr.r;
                    w = h = attr.r * 2;
                    break;
                case "ellipse":
                    x = attr.cx - attr.rx;
                    y = attr.cy - attr.ry;
                    w = attr.rx * 2;
                    h = attr.ry * 2;
                    break;
                case "rect":
                case "image":
                    x = attr.x;
                    y = attr.y;
                    w = attr.width || 0;
                    h = attr.height || 0;
                    break;
                case "text":
                    this.textpath.v = ["m", Math.round(attr.x), ", ", Math.round(attr.y - 2), "l", Math.round(attr.x) + 1, ", ", Math.round(attr.y - 2)].join("");
                    x = attr.x - Math.round(this.W / 2);
                    y = attr.y - this.H / 2;
                    w = this.W;
                    h = this.H;
                    break;
                case "path":
                    if (!this.attrs.path) {
                        x = 0;
                        y = 0;
                        w = this.paper.width;
                        h = this.paper.height;
                    } else {
                        var dim = pathDimensions(this.attrs.path),
                        x = dim.x;
                        y = dim.y;
                        w = dim.width;
                        h = dim.height;
                    }
                    break;
                default:
                    x = 0;
                    y = 0;
                    w = this.paper.width;
                    h = this.paper.height;
                    break;
            }
            cx = (cx == null) ? x + w / 2 : cx;
            cy = (cy == null) ? y + h / 2 : cy;
            var left = cx - this.paper.width / 2,
                top = cy - this.paper.height / 2;
            if (this.type == "path" || this.type == "text") {
                (gs.left != left + "px") && (gs.left = left + "px");
                (gs.top != top + "px") && (gs.top = top + "px");
                this.X = this.type == "text" ? x : -left;
                this.Y = this.type == "text" ? y : -top;
                this.W = w;
                this.H = h;
                (os.left != -left + "px") && (os.left = -left + "px");
                (os.top != -top + "px") && (os.top = -top + "px");
            } else {
                (gs.left != left + "px") && (gs.left = left + "px");
                (gs.top != top + "px") && (gs.top = top + "px");
                this.X = x;
                this.Y = y;
                this.W = w;
                this.H = h;
                (gs.width != this.paper.width + "px") && (gs.width = this.paper.width + "px");
                (gs.height != this.paper.height + "px") && (gs.height = this.paper.height + "px");
                (os.left != x - left + "px") && (os.left = x - left + "px");
                (os.top != y - top + "px") && (os.top = y - top + "px");
                (os.width != w + "px") && (os.width = w + "px");
                (os.height != h + "px") && (os.height = h + "px");
                var arcsize = (+params.r || 0) / (Math.min(w, h));
                if (this.type == "rect" && this.arcsize != arcsize && (arcsize || this.arcsize)) {
                    // We should replace element with the new one
                    var o = createNode(arcsize ? "roundrect" : "rect");
                    o.arcsize = arcsize;
                    this.Group.appendChild(o);
                    this.node.parentNode.removeChild(this.node);
                    this.node = o;
                    this.arcsize = arcsize;
                    setFillAndStroke(this, this.attrs);
                    this.setBox(this.attrs);
                }
            }
        };
        Element.prototype.hide = function () {
            this.Group.style.display = "none";
            return this;
        };
        Element.prototype.show = function () {
            this.Group.style.display = "block";
            return this;
        };
        Element.prototype.getBBox = function () {
            if (this.type == "path") {
                return pathDimensions(this.attr("path"));
            }
            return {
                x: this.X + (this.bbx || 0),
                y: this.Y,
                width: this.W,
                height: this.H
            };
        };
        Element.prototype.remove = function () {
            this[0].parentNode.removeChild(this[0]);
            this.Group.parentNode.removeChild(this.Group);
            this.shape && this.shape.parentNode.removeChild(this.shape);
        };
        Element.prototype.attr = function () {
            if (arguments.length == 1 && typeof arguments[0] == "string") {
                if (arguments[0] == "translation") {
                    return this.translate();
                }
                return this.attrs[arguments[0]];
            }
            if (this.attrs && arguments.length == 1 && arguments[0] instanceof win.Array) {
                var values = {};
                for (var i = 0, ii = arguments[0].length; i < ii; i++) {
                    values[arguments[0][i]] = this.attrs[arguments[0][i]];
                };
                return values;
            }
            var params;
            if (arguments.length == 2) {
                params = {};
                params[arguments[0]] = arguments[1];
            }
            if (arguments.length == 1 && typeof arguments[0] == "object") {
                params = arguments[0];
            }
            if (params) {
                if (params.gradient) {
                    addGradientFill(this, params.gradient);
                }
                if (params.text && this.type == "text") {
                    this.node.string = params.text;
                }
                if (params.id) {
                    this.node.id = params.id;
                }
                setFillAndStroke(this, params);
                this.setBox(params);
            }
            return this;
        };
        Element.prototype.toFront = function () {
            this.Group.parentNode.appendChild(this.Group);
            return this;
        };
        Element.prototype.toBack = function () {
            if (this.Group.parentNode.firstChild != this.Group) {
                this.Group.parentNode.insertBefore(this.Group, this.Group.parentNode.firstChild);
            }
            return this;
        };
        Element.prototype.insertAfter = function (element) {
            if (element.Group.nextSibling) {
                element.Group.parentNode.insertBefore(this.Group, element.Group.nextSibling);
            } else {
                element.Group.parentNode.appendChild(this.Group);
            }
            return this;
        };
        Element.prototype.insertBefore = function (element) {
            element.Group.parentNode.insertBefore(this.Group, element.Group);
            return this;
        };
        var theCircle = function (vml, x, y, r) {
            var g = createNode("group");
            var o = createNode("oval");
            g.appendChild(o);
            var res = new Element(o, g, vml);
            res.type = "circle";
            setFillAndStroke(res, {stroke: "#000", fill: "none"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.r = r;
            res.setBox({x: x - r, y: y - r, width: r * 2, height: r * 2});
            vml.canvas.appendChild(g);
            return res;
        };
        var theRect = function (vml, x, y, w, h, r) {
            var g = createNode("group"),
                o = createNode(r ? "roundrect" : "rect"),
                arcsize = (+r || 0) / (Math.min(w, h));
            o.arcsize = arcsize;
            g.appendChild(o);
            var res = new Element(o, g, vml);
            res.type = "rect";
            setFillAndStroke(res, {stroke: "#000"});
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = w;
            res.attrs.h = h;
            res.attrs.r = +r;
            res.arcsize = arcsize;
            res.setBox({x: x, y: y, width: w, height: h});
            vml.canvas.appendChild(g);
            return res;
        };
        var theEllipse = function (vml, x, y, rx, ry) {
            var g = createNode("group");
            var o = createNode("oval");
            g.appendChild(o);
            var res = new Element(o, g, vml);
            res.type = "ellipse";
            setFillAndStroke(res, {stroke: "#000"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.rx = rx;
            res.attrs.ry = ry;
            res.setBox({x: x - rx, y: y - ry, width: rx * 2, height: ry * 2});
            vml.canvas.appendChild(g);
            return res;
        };
        var theImage = function (vml, src, x, y, w, h) {
            var g = createNode("group");
            var o = createNode("image");
            o.src = src;
            g.appendChild(o);
            var res = new Element(o, g, vml);
            res.type = "image";
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = w;
            res.attrs.h = h;
            res.setBox({x: x, y: y, width: w, height: h});
            vml.canvas.appendChild(g);
            return res;
        };
        var theText = function (vml, x, y, text) {
            var g = createNode("group"), gs = g.style;
            var el = createNode("shape"), ol = el.style;
            var path = createNode("path"), ps = path.style;
            path.v = ["m", Math.round(x), ", ", Math.round(y - 2), "l", Math.round(x) + 1, ", ", Math.round(y - 2)].join("");
            path.textpathok = true;
            ol.width = vml.width;
            ol.height = vml.height;
            gs.position = "absolute";
            gs.left = 0;
            gs.top = 0;
            gs.width = vml.width;
            gs.height = vml.height;
            var o = createNode("textpath");
            o.string = text;
            o.on = true;
            o.coordsize = vml.coordsize;
            o.coordorigin = vml.coordorigin;
            el.appendChild(o);
            el.appendChild(path);
            g.appendChild(el);
            var res = new Element(o, g, vml);
            res.shape = el;
            res.textpath = path;
            res.type = "text";
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = 1;
            res.attrs.h = 1;
            setFillAndStroke(res, {font: availableAttrs.font, stroke: "none", fill: "#000"});
            res.setBox();
            vml.canvas.appendChild(g);
            return res;
        };
        var setSize = function (width, height) {
            this.width = width || this.width;
            this.height = height || this.height;
            this.canvas.style.width = this.width + "px";
            this.canvas.style.height = this.height + "px";
            this.canvas.parentNode.style.clip = "rect(0 " + this.width + "px " + this.height + "px 0)";
            this.canvas.coordsize = this.width + " " + this.height;
            return this;
        };
        doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        try {
            if (!doc.namespaces.rvml) {
                doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            }
            var createNode = function (tagName) {
                return doc.createElement('<rvml:' + tagName + ' class="rvml">');
            };
        } catch (e) {
            var createNode = function (tagName) {
                return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
            };
        }
        var create = function () {
            var con = getContainer.apply(null, arguments);
            var container = con.container,
                x = con.x,
                y = con.y,
                width = con.width,
                height = con.height;
            if (!container) {
                throw new Error("VML container not found.");
            }
            var c = doc.createElement("div"),
                d = doc.createElement("div"),
                r = paper.canvas = createNode("group"),
                cs = c.style, rs = r.style;
            paper.width = width;
            paper.height = height;
            width = width || "512px";
            height = height || "342px";
            cs.clip = "rect(0 " + width + "px " + height + "px 0)";
            cs.top = "-2px";
            cs.left = "-2px";
            cs.position = "absolute";
            rs.position = "absolute";
            d.style.position = "relative";
            rs.width  = width;
            rs.height = height;
            r.coordsize = (/%$/.test(width) ? width : parseFloat(width)) + " " + (/%$/.test(height) ? height : parseFloat(height));
            r.coordorigin = "0 0";

            var b = createNode("rect"), bs = b.style;
            bs.left = bs.top = 0;
            bs.width  = rs.width;
            bs.height = rs.height;
            b.filled = b.stroked = "f";

            r.appendChild(b);
            c.appendChild(r);
            d.appendChild(c);
            if (container == 1) {
                doc.body.appendChild(d);
                cs.position = "absolute";
                cs.left = x + "px";
                cs.top = y + "px";
                cs.width = width;
                cs.height = height;
                container = {
                    style: {
                        width: width,
                        height: height
                    }
                };
            } else {
                cs.width = container.style.width = width;
                cs.height = container.style.height = height;
                if (container.firstChild) {
                    container.insertBefore(d, container.firstChild);
                } else {
                    container.appendChild(d);
                }
            }
            for (var prop in paper) {
                container[prop] = paper[prop];
            }
            plugins.call(container, container, R.fn);
            container.clear = function () {
                var todel = [];
                for (var i = 0, ii = r.childNodes.length; i < ii; i++) {
                    if (r.childNodes[i] != b) {
                        todel.push(r.childNodes[i]);
                    }
                }
                for (i = 0, ii = todel.length; i < ii; i++) {
                    r.removeChild(todel[i]);
                }
            };
            container.raphael = R;
            return container;
        };
        paper.remove = function () {
            this.canvas.parentNode.parentNode.parentNode.removeChild(this.canvas.parentNode.parentNode);
        };
        paper.safari = function () {};
    }

    // rest

    // Events
    var addEvent = (function () {
        if (doc.addEventListener) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    return fn.call(element, e);
                };
                obj.addEventListener(type, f, false);
                return function () {
                    obj.removeEventListener(type, f, false);
                    return true;
                };
            };
        } else if (doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    return fn.call(element, e || win.event);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                if (type == "mouseover") {
                    obj.attachEvent("onmouseenter", f);
                    return function () {
                        obj.detachEvent("onmouseenter", f);
                        return detacher();
                    };
                } else if (type == "mouseout") {
                    obj.attachEvent("onmouseleave", f);
                    return function () {
                        obj.detachEvent("onmouseleave", f);
                        return detacher();
                    };
                }
                return detacher;
            };
        }
    })();
    for (var i = events.length; i--;) {
        (function (eventName) {
            Element.prototype[eventName] = function (fn) {
                if (typeof fn == "function") {
                    this.events = this.events || {};
                    this.events[eventName] = this.events[eventName] || {};
                    this.events[eventName][fn] = this.events[eventName][fn] || [];
                    this.events[eventName][fn].push(addEvent(this.shape || this.node, eventName, fn, this));
                }
                return this;
            };
            Element.prototype["un" + eventName] = function (fn) {
                this.events &&
                this.events[eventName] &&
                this.events[eventName][fn] &&
                this.events[eventName][fn].length &&
                this.events[eventName][fn].shift()() &&
                !this.events[eventName][fn].length &&
                delete this.events[eventName][fn];
            };

        })(events[i]);
    }
    paper.circle = function (x, y, r) {
        return theCircle(this, x, y, r);
    };
    paper.rect = function (x, y, w, h, r) {
        return theRect(this, x, y, w, h, r);
    };
    paper.ellipse = function (x, y, rx, ry) {
        return theEllipse(this, x, y, rx, ry);
    };
    paper.path = function (params, pathString) {
        return thePath(params, pathString, this);
    };
    paper.image = function (src, x, y, w, h) {
        return theImage(this, src, x, y, w, h);
    };
    paper.text = function (x, y, text) {
        return theText(this, x, y, text);
    };
    paper.drawGrid = function (x, y, w, h, wv, hv, color) {
        color = color || "#000";
        var path = ["M", x, y, "L", x + w, y, x + w, y + h, x, y + h, x, y],
            rowHeight = h / hv,
            columnWidth = w / wv;
        for (var i = 1; i < hv; i++) {
            path = path.concat(["M", x, y + i * rowHeight, "L", x + w, y + i * rowHeight]);
        }
        for (var i = 1; i < wv; i++) {
            path = path.concat(["M", x + i * columnWidth, y, "L", x + i * columnWidth, y + h]);
        }
        return this.path({stroke: color, "stroke-width": 1}, path.join(","));
    };
    paper.pathfinder = function (p, path) {
        var commands = {
            M: function (x, y) {
                this.moveTo(x, y);
            },
            C: function (x1, y1, x2, y2, x3, y3) {
                this.curveTo(x1, y1, x2, y2, x3, y3);
            },
            Q: function (x1, y1, x2, y2) {
                this.qcurveTo(x1, y1, x2, y2);
            },
            T: function (x, y) {
                this.qcurveTo(x, y);
            },
            S: function (x1, y1, x2, y2) {
                p.curveTo(x1, y1, x2, y2);
            },
            L: function (x, y) {
                p.lineTo(x, y);
            },
            H: function (x) {
                this.lineTo(x, this.last.y);
            },
            V: function (y) {
                this.lineTo(this.last.x, y);
            },
            A: function (rx, ry, xaxisrotation, largearcflag, sweepflag, x, y) {
                this.arcTo(rx, ry, largearcflag, sweepflag, x, y);
            },
            Z: function () {
                this.andClose();
            }
        };

        path = pathToAbsolute(path);
        for (var i = 0, ii = path.length; i < ii; i++) {
            var b = path[i].shift();
            commands[b].apply(p, path[i]);
            path[i].unshift(b);
        }
    };
    paper.set = function (itemsArray) {
        return new Set(itemsArray);
    };
    paper.setSize = setSize;
    Element.prototype.stop = function () {
        clearTimeout(this.animation_in_progress);
    };
    Element.prototype.scale = function (x, y, cx, cy) {
        if (x == null && y == null) {
            return {x: this._.sx, y: this._.sy, toString: function () { return this.x.toFixed(3) + " " + this.y.toFixed(3); }};
        }
        y = y || x;
        !+y && (y = x);
        var dx, dy, dcx, dcy, a = this.attrs;
        if (x != 0) {
            var bb = this.type == "path" ? pathDimensions(a.path) : this.getBBox(),
                rcx = bb.x + bb.width / 2,
                rcy = bb.y + bb.height / 2;
            cx = (+cx || cx == 0) ? cx : rcx;
            cy = (+cy || cy == 0) ? cy : rcy;
            var dirx = Math.round(x / Math.abs(x)),
                diry = Math.round(y / Math.abs(y)),
                s = this.node.style,
                ncx = cx + (rcx - cx) * x * dirx / this._.sx,
                ncy = cy + (rcy - cy) * y * diry / this._.sy;
            switch (this.type) {
                case "rect":
                case "image":
                    var neww = a.width * x * dirx / this._.sx,
                        newh = a.height * y * diry / this._.sy,
                        newx = ncx - neww / 2,
                        newy = ncy - newh / 2;
                    this.attr({
                        width: neww,
                        height: newh,
                        x: newx,
                        y: newy
                    });
                    break;
                case "circle":
                case "ellipse":
                    this.attr({
                        rx: a.rx * x / this._.sx,
                        ry: a.ry * y / this._.sy,
                        r: a.r * x / this._.sx,
                        cx: ncx,
                        cy: ncy
                    });
                    break;
                case "path":
                    var path = pathToRelative(a.path),
                        skip = true;
                    for (var i = 0, ii = path.length; i < ii; i++) {
                        var p = path[i];
                        if (p[0].toUpperCase() == "M" && skip) {
                            continue;
                        } else {
                            skip = false;
                        }
                        if (R.svg && p[0].toUpperCase() == "A") {
                            p[path[i].length - 2] *= x / this._.sx;
                            p[path[i].length - 1] *= y / this._.sy;
                            p[1] *= x / this._.sx;
                            p[2] *= y / this._.sy;
                            p[5] = +(dirx + diry ? !!+p[5] : !+p[5]);
                        } else {
                            for (var j = 1, jj = p.length; j < jj; j++) {
                                p[j] *= (j % 2) ? x / this._.sx : y / this._.sy;
                            }
                        }
                    }
                    var dim2 = pathDimensions(path),
                        dx = ncx - dim2.x - dim2.width / 2,
                        dy = ncy - dim2.y - dim2.height / 2;
                    path = pathToRelative(path);
                    path[0][1] += dx;
                    path[0][2] += dy;
                    
                    this.attr({path: path.join(" ")});
                break;
            }
            if (this.type in {text: 1, image:1} && (dirx != 1 || diry != 1)) {
                if (this.transformations) {
                    this.transformations[2] = "scale(".concat(dirx, ",", diry, ")");
                    this.node.setAttribute("transform", this.transformations.join(" "));
                    dx = (dirx == -1) ? -a.x - (neww || 0) : a.x;
                    dy = (diry == -1) ? -a.y - (newh || 0) : a.y;
                    this.attr({x: dx, y: dy});
                    a.fx = dirx - 1;
                    a.fy = diry - 1;
                } else {
                    this.node.filterMatrix = " progid:DXImageTransform.Microsoft.Matrix(M11=".concat(dirx,
                        ", M12=0, M21=0, M22=", diry,
                        ", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");
                    s.filter = (this.node.filterMatrix || "") + (this.node.filterOpacity || "");
                }
            } else {
                if (this.transformations) {
                    this.transformations[2] = "";
                    this.node.setAttribute("transform", this.transformations.join(" "));
                    a.fx = 0;
                    a.fy = 0;
                } else {
                    this.node.filterMatrix = "";
                    s.filter = (this.node.filterMatrix || "") + (this.node.filterOpacity || "");
                }
            }
            a.scale = [x, y, cx, cy].join(" ");
            this._.sx = x;
            this._.sy = y;
        }
        return this;
    };
    Element.prototype.animate = function (params, ms, callback) {
        clearTimeout(this.animation_in_progress);
        var from = {},
            to = {},
            diff = {},
            t = {x: 0, y: 0};
        for (var attr in params) {
            if (attr in availableAnimAttrs) {
                from[attr] = this.attr(attr);
                (typeof from[attr] == "undefined") && (from[attr] = availableAttrs[attr]);
                to[attr] = params[attr];
                switch (availableAnimAttrs[attr]) {
                    case "number":
                        diff[attr] = (to[attr] - from[attr]) / ms;
                        break;
                    case "colour":
                        from[attr] = R.getRGB(from[attr]);
                        var toColour = R.getRGB(to[attr]);
                        diff[attr] = {
                            r: (toColour.r - from[attr].r) / ms,
                            g: (toColour.g - from[attr].g) / ms,
                            b: (toColour.b - from[attr].b) / ms
                        };
                        break;
                    case "path":
                        var pathes = pathEqualiser(from[attr], to[attr]);
                        from[attr] = pathes[0];
                        to[attr] = pathes[1];
                        diff[attr] = [];
                        for (var i = 0, ii = from[attr].length; i < ii; i++) {
                            diff[attr][i] = [0];
                            for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                            }
                        }
                        break;
                    case "csv":
                        var values = (params[attr] + "").split(separator),
                            from2 = (from[attr] + "").split(separator);
                        switch (attr) {
                            case "translation":
                                from[attr] = [0, 0];
                                diff[attr] = [values[0] / ms, values[1] / ms];
                            break;
                            case "rotation":
                                from[attr] = (from2[1] == values[1] && from2[2] == values[2]) ? from2 : [0, values[1], values[2]];
                                diff[attr] = [(values[0] - from[attr][0]) / ms, 0, 0];
                            break;
                            case "scale":
                                params[attr] = values;
                                from[attr] = (from[attr] + "").split(separator);
                                diff[attr] = [(values[0] - from[attr][0]) / ms, (values[1] - from[attr][1]) / ms, 0, 0];
                        }
                        to[attr] = values;
                }
            }
        }
        var start = +new Date,
            prev = 0,
            that = this;
        (function tick() {
            var time = new Date - start,
                set = {},
                now;
            if (time < ms) {
                for (var attr in from) {
                    switch (availableAnimAttrs[attr]) {
                        case "number":
                            now = +from[attr] + time * diff[attr];
                            break;
                        case "colour":
                            now = "rgb(" + [
                                Math.round(from[attr].r + time * diff[attr].r),
                                Math.round(from[attr].g + time * diff[attr].g),
                                Math.round(from[attr].b + time * diff[attr].b)
                            ].join(",") + ")";
                            break;
                        case "path":
                            now = [];
                            for (var i = 0, ii = from[attr].length; i < ii; i++) {
                                now[i] = [from[attr][i][0]];
                                for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                    now[i][j] = from[attr][i][j] + time * diff[attr][i][j];
                                }
                                now[i] = now[i].join(" ");
                            }
                            now = now.join(" ");
                            break;
                        case "csv":
                            switch (attr) {
                                case "translation":
                                    var x = diff[attr][0] * (time - prev),
                                        y = diff[attr][1] * (time - prev);
                                    t.x += x;
                                    t.y += y;
                                    now = [x, y].join(" ");
                                break;
                                case "rotation":
                                    now = +from[attr][0] + time * diff[attr][0];
                                    from[attr][1] && (now += "," + from[attr][1] + "," + from[attr][2]);
                                break;
                                case "scale":
                                    now = [+from[attr][0] + time * diff[attr][0], +from[attr][1] + time * diff[attr][1], (2 in params[attr] ? params[attr][2] : ""), (3 in params[attr] ? params[attr][3] : "")].join(" ");
                            }
                            break;
                    }
                    if (attr == "font-size") {
                        set[attr] = now + "px";
                    } else {
                        set[attr] = now;
                    }
                }
                that.attr(set);
                that.animation_in_progress = setTimeout(tick);
                paper.safari();
            } else {
                (t.x || t.y) && that.translate(-t.x, -t.y);
                that.attr(params);
                clearTimeout(that.animation_in_progress);
                paper.safari();
                (typeof callback == "function") && callback.call(that);
            }
            prev = time;
        })();
        return this;
    };
    Element.prototype.translate = function (x, y) {
        if (x == null) {
            return {x: this._.tx, y: this._.ty};
        }
        this._.tx += +x;
        this._.ty += +y;
        switch (this.type) {
            case "circle":
            case "ellipse":
                this.attr({cx: this.attrs.cx + x, cy: this.attrs.cy + y});
                break;
            case "rect":
            case "image":
            case "text":
                this.attr({x: this.attrs.x + (+x), y: this.attrs.y + (+y)});
                break;
            case "path":
                var path = pathToRelative(this.attrs.path);
                path[0][1] += +x;
                path[0][2] += +y;
                this.attr({path: path.join(" ")});
            break;
        }
        return this;
    };

    // Set
    var Set = function () {
        this.items = [];
        this.length = 0;
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            if (arguments[i] && (arguments[i].constructor == Element || arguments[i].constructor == Set)) {
                this[this.items.length] = this.items[this.items.length] = arguments[i];
                this.length++;
            }
        }
    };
    Set.prototype.push = function (item) {
        if (item && item.constructor == Element || item.constructor == Set) {
            var len = this.items.length;
            this[len] = this.items[len] = item;
            this.length++;
        }
        return this;
    };
    Set.prototype.pull = function (id) {
        var res = this.items.splice(id, 1)[0];
        for (var j = id, jj = this.items.length; j < jj; j++) {
            this[j] = this[j + 1];
        }
        delete this[jj + 1];
        this.length--;
        return res;
    };
    for (var method in Element.prototype) {
        Set.prototype[method] = (function (methodname) {
            return function () {
                for (var i = 0, ii = this.items.length; i < ii; i++) {
                    this.items[i][methodname].apply(this.items[i], arguments);
                }
                return this;
            };
        })(method);
    }
    Set.prototype.attr = function (name, value) {
        if (name && name instanceof Array && typeof name[0] == "object") {
            for (var j = 0, jj = name.length; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items.length; i < ii; i++) {
                this.items[i].attr.apply(this.items[i], arguments);
            }
        }
        return this;
    };
    
    Set.prototype.getBBox = function () {
        var x = [], y = [], w = [], h = [];
        for (var i = this.items.length; i--;) {
            var box = this.items[i].getBBox();
            x.push(box.x);
            y.push(box.y);
            w.push(box.x + box.width);
            h.push(box.y + box.height);
        }
        x = Math.min.apply(Math, x);
        y = Math.min.apply(Math, y);
        return {
            x: x,
            y: y,
            width: Math.max.apply(Math, w) - x,
            height: Math.max.apply(Math, h) - y
        };
    };

    R.registerFont = function (font) {
        if (!font.face) {
            return;
        }
        this.fonts = this.fonts || {};
        if (this.fonts[font.face["font-family"]]) {
            this.fonts[font.face["font-family"]].push(font);
        } else {
            this.fonts[font.face["font-family"]] = [font];
        }
        if (!font.svg) {
            font.face["units-per-em"] = parseInt(font.face["units-per-em"], 10);

            for (var glyph in font.glyphs) {
                var path = font.glyphs[glyph];
                if (path.d) {
                    path.d = "M" + path.d.replace(/[mlcxtrv]/g, function (command) {
                        return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                    }) + "z";
                }
            }
        }
    };
    paper.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, "") + "(\\s|$)", "i");
            for (var fontName in R.fonts) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font.length; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    paper.print = function (x, y, string, font, size) {
        var out = this.set(),
            letters = (string + "").split(""),
            shift = 0,
            path = "",
            scale;
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            for (var i = 0, ii = letters.length; i < ii; i++) {
                var prev = i && font.glyphs[letters[i - 1]] || {},
                    curr = font.glyphs[letters[i]];
                shift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) : 0;
                curr && curr.d && out.push(this.path({fill: "#000", stroke: "none"}, curr.d).translate(shift, 0));
            }
            out.scale(scale, scale, 0, y).translate(x, (size || 16) / 2);
        }
        return out;
    };

    R.ninja = function () {
        var r = window.Raphael;
        if (oldRaphael.was) {
            window.Raphael = oldRaphael.is;
        } else {
            try {
                delete window.Raphael;
            } catch (e) {
                window.Raphael = void(0);
            }
        }
        return r;
    };
    R.el = Element.prototype;
    return R;
})();