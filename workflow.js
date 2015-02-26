/*global SVG, jQuery, $,  console*/
var SVGFlow = (function () {
        "use strict";
        var draw, lowerConnector, shapeFuncs, i, config, userOpts = {}, shapes, interactive = true, chartGroup, layoutShapes, itemIds = {}, indexFromId = {}, startEl, startId, lookup = {}, isPositioned = [], toggleNext, clicked = [];

        function setParams(u) {
            userOpts = u;
            interactive = userOpts.interactive !== undefined ? userOpts.interactive : true;
            return userOpts;
        }

        function init() {
          // Set defaults
            var w = userOpts.w || 180,
                h = userOpts.w || 140,
                arrowColour = userOpts.arrowColour || 'grey',
                shapeStrokeColour = 'rgb(66, 66, 66)',
                lightText = '#fff',
                darkText = 'rgb(51, 51, 51)',
                defaultFontSize = userOpts.defaultFontSize || 12,
                defaults = {
                    minOpacity: userOpts.minOpacity || 0,
                    maxOpacity: userOpts.maxOpacity || 1,
                    btnBarHeight: userOpts.btnBarHeight || 40,
                    btnBarWidth: userOpts.btnBarWidth || 87,
                    shapeWidth: userOpts.shapeWidth || userOpts.w || w,
                    shapeHeight: userOpts.shapeHeight || userOpts.h || h,
                    baseUnit: userOpts.baseUnit || 80,
                    gridCol: userOpts.gridCol || 80,
                    rowHeight: userOpts.rowHeight || 20,
                    leftMargin: userOpts.leftMargin || 0,
                    connectorLength: userOpts.connectorLength || 80,
                    startWidth: userOpts.startWidth || userOpts.w || w,
                    startHeight: userOpts.startHeight || 40,
                    startCornerRadius: userOpts.startCornerRadius || 20,
                    startFill:  userOpts.startFill || arrowColour,
                    startStrokeWidth: userOpts.startStrokeWidth || 0.1,
                    startStrokeColour: userOpts.startStrokeColour || 'rgb(66, 66, 66)',
                    startTextColour: userOpts.startTextColour || lightText,
                    startText: userOpts.startText || 'Start',
                    startFontSize: userOpts.startFontSize || userOpts.defaultFontSize || defaultFontSize,
                    decisionWidth: userOpts.decisionWidth || userOpts.w || w,
                    decisionHeight: userOpts.decisionHeight || userOpts.h || h,
                    decisionFill: userOpts.decisionFill || '#8b3572',
                    decisionTextColour: userOpts.decisionTextColour || '#fff',
                    decisionFontSize: userOpts.decisionFontSize || userOpts.defaultFontSize || defaultFontSize,
                    finishTextColour: userOpts.finishTextColour || '#fff',
                    finishWidth: userOpts.finishWidth || userOpts.w || w,
                    finishHeight: userOpts.finishHeight || userOpts.h || h,
                    finishLeftMargin: userOpts.finishLeftMargin || 20,
                    finishFill: userOpts.finishFill || '#0F6C7E',
                    finishFontSize: userOpts.finishFontSize || userOpts.defaultFontSize || defaultFontSize,
                    finishLinkColour: userOpts.finishLinkColour || 'yellow',
                    processWidth: userOpts.processWidth || userOpts.w || w,
                    processHeight: userOpts.processHeight || userOpts.h || h,
                    processLeftMargin: userOpts.processLeftMargin || 20,
                    processFill: userOpts.processFill || '#fff',
                    processStrokeColour: userOpts.processStrokeColour || shapeStrokeColour,
                    processStrokeWidth: userOpts.processStrokeWidth || 0.1,
                    processTextColour: userOpts.processTextColour || darkText,
                    processFontSize: userOpts.processFontSize || userOpts.defaultFontSize || defaultFontSize,
                    processLinkColour: userOpts.processLinkColour || 'darkblue',
                    labelWidth: userOpts.labelWidth || 30,
                    labelHeight: userOpts.labelHeight || 20,
                    labelRadius: userOpts.labelRadius || 5,
                    labelStroke: userOpts.labelStroke || 0.1,
                    labelFill: userOpts.labelFill || arrowColour,
                    labelClickedFill: userOpts.labelClickedFill || 'black',
                    labelOpacity: userOpts.labelOpacity || 1.0,
                    labelFontSize: userOpts.labelFontSize || userOpts.defaultFontSize || defaultFontSize,
                    arrowHeadHeight: userOpts.arrowHeadHeight || 20,
                    arrowStroke: userOpts.arrowStroke ||  1.0,
                    arrowLineColour: userOpts.arrowLineColour || arrowColour,
                    arrowHeadColor: userOpts.arrowHeadColor || arrowColour,
                    arrowTextColour: userOpts.arrowTextColour || '#fff',
                    arrowFontSize: userOpts.arrowFontSize || userOpts.defaultFontSize || defaultFontSize,
                    arrowHeadOpacity: userOpts.arrowHeadOpacity || 1.0
                };
            return defaults;
        }

        function generateLookups(s) {
            shapes = s;
            for (i = 0; i < shapes.length; i += 1) {
                lookup[shapes[i].label] = i;
            }
        }

        function arrowHead(g) {
            var coords =
                    "0,0 " +
                    config.arrowHeadHeight
                    + ",0 "
                    + config.arrowHeadHeight / 2
                    + "," + config.arrowHeadHeight,

                ag = g
                    .polygon(coords).fill({color: config.arrowHeadColor, opacity: config.arrowHeadOpacity})
                    .cx(config.arrowHeadHeight / 2)
                    .cy(config.arrowHeadHeight / 2);

            return ag;
        }

        function arrowLine() {
            var group = draw.group(),
                ah = arrowHead(group)
                    .move(
                        -(config.arrowHeadHeight / 2),
                        config.connectorLength - config.arrowHeadHeight
                    ),
                line = draw
                    .line(0, 0, 0, config.connectorLength - config.arrowHeadHeight)
                    .attr({
                        'stroke-width': config.arrowStroke,
                        'stroke': config.arrowLineColour
                    });
            group.add(line).add(ah);

            return group;
        }

        function lineLabel(t, g) {
            var text, labelGroup = g.group(),
                label = labelGroup
                .rect(
                    config.labelWidth,
                    config.labelHeight
                ).radius(config.labelRadius)
                .stroke({
                    width: config.labelStroke
                })
                .attr({
                    opacity: config.labelOpacity,
                    fill: config.labelFill
                });

            label.move(
                -(config.labelWidth / 2),
                config.labelHeight / 2
            );

            text = labelGroup.text(t).attr({
                fill: config.arrowTextColour,
                'text-anchor': 'middle',
                'font-size' : config.arrowFontSize
            });
            text.cy(label.cy());
            if (interactive === true) {
                labelGroup.hide();
            }
            return labelGroup;
        }

        function showTip(x, y) {
            var tg = draw.group();
            tg.rect(300, 200);
            tg.text('Hello world');
            tg.move(x, y);
        }

        function decision(options) {
            var shape, text,
                group = chartGroup.group(),
                coords =
                "0," +
                config.decisionHeight / 2 +
                " " + config.decisionWidth / 2 +
                ",0 " + config.decisionWidth +
                "," + config.decisionHeight / 2 +
                " " + config.decisionWidth / 2 + ","
                + config.decisionHeight;

            shape = group.polygon(coords)
                .attr({
                    fill: config.decisionFill,
                    "class": 'fc-rhombus'
                });
            group.attr('class', 'fc-decision');

            text = group.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine().attr('text-anchor', 'middle');
                });
            });
            text.fill(config.decisionTextColour).font({size: config.decisionFontSize});

            text.cx(shape.cx() + text.bbox().width + text.bbox().x);
            text.cy(shape.cy());
            return group;
        }

        function finish(options) {
            var tip, group = chartGroup.group()
                .attr({
                    "class": "finish-group"
                }),
                rect = group
                .rect(config.finishWidth, config.finishHeight)
                .attr({
                    fill: config.finishFill,
                    "class": "fc-finish"
                }).radius(20),

                content = group.group();

            content.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine();
                });
            })
                    .fill(config.finishTextColour)
                    .font({size: config.finishFontSize});

            // Dealing with links
            if (options.links) {
                options.links.forEach(function (l) {
                    var url = draw.link(l.url),
                        txt = draw.text(l.text),
                        tbox;
                    url.add(txt);
                    if (l.target) {
                        url.target(l.target);
                    }
                    txt.fill(config.finishLinkColour).font({size: config.finishFontSize});
                    tbox = content.bbox();
                    txt.dmove(0, tbox.height + 5);
                    content.add(url);
                });
            }
            // Dealing with tips
            if (options.tip) {
                console.log(options.tip);
                tip = group.text(options.tip.title)
                    .fill(config.finishLinkColour)
                    .font({size: config.finishFontSize})
                    .attr('cursor', 'pointer');

                tip.move(config.finishLeftMargin, rect.height() - 25);

                tip.on('click', function () {
                    console.log(group.y());
                    showTip(group.x(), group.y());
                });
            }

            // Not sure about the -5 fudge factor
            content.move(config.finishLeftMargin, ((rect.height() -  content.bbox().height) / 2) - 5);
            return group;
        }

        // The process shape that has an outlet, but no choice
        function process(options) {
            var group = chartGroup.group()
                    .attr({
                        "class": "process-group"
                    }),
                rect = group
                    .rect(config.processWidth, config.processHeight)
                    .attr({
                        fill: config.processFill,
                        stroke: config.processStrokeColour,
                        "class": "fc-process"
                    }),
                content = group.group();

            content.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine();
                });
            })
                    .font({size: config.processFontSize});

            // Dealing with links
            if (options.links) {
                options.links.forEach(function (l) {
                    var url = draw.link(l.url),
                        txt = draw.text(l.text),
                        tbox;
                    url.add(txt);
                    if (l.target) {
                        url.target(l.target);
                    }
                    txt.fill(config.processLinkColour).font({size: config.processFontSize});
                    tbox = content.bbox();
                    txt.dmove(0, tbox.height + 5);
                    content.add(url);
                });
            }

            content.move(config.finishLeftMargin, ((rect.height() - content.bbox().height) / 2) - 5);
            return group;
        }

        shapeFuncs = {
            decision: decision,
            finish: finish,
            process: process
        };

        function start(shapes) {
            var text, shapeBox, rect, k,
                group = draw.group().attr({
                    "class": "fc-start"
                });

            rect = group.rect(config.startWidth, config.startHeight)
                .attr({
                    fill: config.startFill,
                    'stroke-width' : config.startStrokeWidth,
                    stroke: config.startStrokeWidth
                })
                .radius(config.startCornerRadius);

            startId = group.attr('id');

            lowerConnector = arrowLine();
            text = group.text(function (add) { add.tspan(config.startText).newLine().attr({
                'text-anchor': 'middle',
                'font-size': config.startFontSize,
                'fill' : config.startTextColour
            }); });

            shapeBox = rect.bbox();
            lowerConnector.move(shapeBox.cx, shapeBox.height);
            text.move(shapeBox.cx);
            text.cy(shapeBox.cy);
            group.add(lowerConnector);

            if (interactive === true) {
                group.attr({"cursor": "pointer"});
                group.click(function () {
                    var firstShape = shapes[0].svgid;

                    if (shapes[0].show === false) {
                        shapes[0].show = true;
                        firstShape.animate().opacity(config.maxOpacity);

                        if (shapes[0].yesBtn) {
                            shapes[0].yesBtn.show();
                        }

                        if (shapes[0].noBtn) {
                            shapes[0].noBtn.show();
                        }
                    } else {
                        firstShape.animate().opacity(config.minOpacity);
                        shapes[0].show = false;

                        if (shapes[0].yesBtn) {
                            shapes[0].yesBtn.hide();
                        }
                        if (shapes[0].noBtn) {
                            shapes[0].noBtn.hide();
                        }
                        for (k = 0; k < clicked.length; k += 1) {
                            shapes[lookup[clicked[k]]].svgid.animate().opacity(config.minOpacity);
                            shapes[lookup[clicked[k]]].show = false;
                        }
                        clicked.splice(0, clicked.length - 1);
                    }
                });
            }
            return group;
        }

        function setRoot(el) {
            draw = el;
            chartGroup = draw.group();
        }

        function unhide() {
            draw.clear();
            interactive = false;
            setRoot(draw);
            layoutShapes(shapes);
        }

        function hide() {
            draw.clear();
            interactive = true;
            setRoot(draw);
            layoutShapes(shapes);
        }

        function buttonBar() {
            var staticBtn,
                btnGroup = draw.group(),
                activeBtn = btnGroup
                    .rect(config.btnBarWidth, config.btnBarHeight)
                    .fill(config.startFill)
                    .radius(10)
                    .attr({
                        "cursor": "pointer"
                    });
            btnGroup.text('Interactive').attr(
                {'fill' : config.startTextColour,
                        'font-size': '12'
                        }
            )
                .cy(config.btnBarHeight / 2)
                .cx(config.btnBarWidth / 2);

            staticBtn = btnGroup
                    .rect(config.btnBarWidth, config.btnBarHeight)
                    .fill(config.startFill)
                    .radius(10).move(config.btnBarWidth + 5, 0)
                    .attr({
                    "cursor": "pointer"
                });

            btnGroup.text('Static').attr(
                {
                    'fill' : config.startTextColour,
                    'font-size': '12'
                }
            )
                    .cy(config.btnBarHeight / 2)
                .cx((config.btnBarWidth * 1.5) + 5);

            activeBtn.on('mouseover', function () {
                //lastActiveColor = activeBtn.attr('fill');
                activeBtn.fill({color: 'LightGray'});
            });
            staticBtn.on('mouseover', function () {
               // lastStaticColor = staticBtn.attr('fill');
                staticBtn.fill({color: 'LightGray'});
            });

            activeBtn.on('mouseout', function () {
                if (interactive === true) {
                    activeBtn.fill('black');
                }
            });
            staticBtn.on('mouseout', function () {
                if (interactive === false) {
                    staticBtn.fill(config.startFill);
                }
            });

            if (interactive === true) {
                activeBtn.fill('black');
                staticBtn.fill(config.startFill);
            }
            if (interactive === false) {
                staticBtn.fill('black');
                activeBtn.fill(config.startFill);
            }

            activeBtn.on('click', function () {
                interactive = true;
                activeBtn.fill('black');
                staticBtn.fill(config.startFill);
                hide();
            });

            staticBtn.on('click', function () {
                interactive = false;
                staticBtn.fill('black');
                activeBtn.fill(config.startFill);
                unhide();
            });

            return btnGroup;
        }

        function makeShapes(element, index) {
            if (element.type && (typeof shapeFuncs[element.type] === 'function')) {
                var shape = shapeFuncs[element.type](element);

                element.id = shape.attr('id');
                element.svgid = shape;
                element.svgshape = shape.get(0);
                itemIds[element.label] = element.id;
                indexFromId[element.id] = index;
                if (interactive === false) {
                    element.show = true;
                    shape.opacity(config.maxOpacity);
                } else {
                    element.show = false;
                    shape.opacity(config.minOpacity);
                }
            } else {
                console.log(element.type + ' is not a valid shape.');
                return false;
            }
        }

        function yesNoIds(element) {
            if (element.yes) {
                element.yesid = itemIds[element.yes];
                element.svgyesid = SVG.get(itemIds[element.yes]);
            }
            if (element.no) {
                element.noid = itemIds[element.no];
                element.svgnoid = SVG.get(itemIds[element.no]);
            }
            if (element.next) {
                element.nextid = itemIds[element.next];
                element.svgnextid = SVG.get(itemIds[element.next]);
            }
        }

        function referringIds(element) {
            var next;

            if (!element.orient) {
                element.orient = {yes: 'b', no: 'r', next: 'b'};
            }

            if (element.yes) {
                next = lookup[element.yes];
                if (shapes[next]) {
                    shapes[next].previd = element.id;
                    shapes[next].prev = element.label;
                    shapes[next].svgprevid = SVG.get(element.id);
                    if (element.orient.yes === 'b') {
                        shapes[next].isBelow = element.id;
                        shapes[next].svgisBelow = SVG.get(element.id);
                    }

                    if (element.orient.yes === 'r') {
                        shapes[next].isRightOf = element.id;
                        shapes[next].svgisRightOf = SVG.get(element.id);
                    }
                }
            }
            if (element.no) {
                next = lookup[element.no];
                if (shapes[next]) {
                    shapes[next].previd = element.id;
                    shapes[next].prev = element.label;
                    shapes[next].svgprevid = SVG.get(element.id);
                    if (element.orient.no === 'b') {
                        shapes[next].isBelow = element.id;
                        shapes[next].svgisBelow = SVG.get(element.id);
                    }

                    if (element.orient.no === 'r') {
                        shapes[next].isRightOf = element.id;
                        shapes[next].svgisRightOf = SVG.get(element.id);
                    }
                }
            }
            if (element.next) {
                next = lookup[element.next];
                if (shapes[next]) {
                    shapes[next].previd = element.id;
                    shapes[next].prev = element.label;
                    shapes[next].svgprevid = SVG.get(element.id);
                    if (element.orient.next === 'b') {
                        shapes[next].isBelow = element.id;
                        shapes[next].svgisBelow = SVG.get(element.id);
                    }

                    if (element.orient.next === 'r') {
                        shapes[next].isRightOf = element.id;
                        shapes[next].svgisRightOf = SVG.get(element.id);
                    }
                }
            }
        }

        function positionShapes(element, index) {
            var ce = element.svgid, rightMargin, eb;

            if (index === 0) {
                element.isBelow = startId;
            }

            if (!element.inNode && element.isBelow) {
                element.inNode = 't';
            }

            if (!element.inNode && element.isRightOf) {
                element.inNode = 'l';
            }

            if (element.isBelow) {
                if (index === 0) {
                    ce.move(0, 0);
                } else {
                    eb = element.svgisBelow;
                    ce.move(eb.x(), eb.y() + eb.bbox().height + config.connectorLength);
                }
            }

            if (element.isRightOf) {
                if (interactive === false) {
                    rightMargin = element.moveRight !== undefined ? element.moveRight : config.connectorLength;
                } else {
                    rightMargin = config.connectorLength;
                }

                eb = element.svgisRightOf;
                ce.move(eb.x() + eb.bbox().width + rightMargin, eb.y());
            }
        }

        toggleNext = function (e, choice) {
            var nextlabel, clckindex, j;

            if (choice === 'yes') {
                /* This toggles the visiblity if this is the second click
                    on the button, i.e. it was already visible */

                if (shapes[lookup[e.yes]].show === true && shapes[lookup[e.no]].show === false) {

                    clckindex = clicked.indexOf(e.yes);

                    for (j = clckindex; j < clicked.length; j += 1) {
                        shapes[lookup[clicked[j]]].show = false;
                        shapes[lookup[clicked[j]]].svgid.animate().opacity(config.minOpacity);
                        if (shapes[lookup[clicked[j]]].noBtn) {
                            shapes[lookup[clicked[j]]].noBtn.hide();
                        }
                        if (shapes[lookup[clicked[j]]].yesBtn) {
                            shapes[lookup[clicked[j]]].yesBtn.hide();
                        }
                    }
                    clicked.splice(clckindex, clicked.length - 1);
                    return;
                }

                clckindex = clicked.indexOf(e.no);
              // if clckindex is more than -1 this element was clicked before
                if (clckindex > -1) {
                    for (j = clckindex; j < clicked.length; j += 1) {
                        shapes[lookup[clicked[j]]].show = false;
                        shapes[lookup[clicked[j]]].svgid.animate().opacity(config.minOpacity);
                        if (shapes[lookup[clicked[j]]].noBtn) {
                            shapes[lookup[clicked[j]]].noBtn.hide();
                        }
                        if (shapes[lookup[clicked[j]]].yesBtn) {
                            shapes[lookup[clicked[j]]].yesBtn.hide();
                        }
                    }
                    clicked.splice(clckindex, clicked.length - 1);
                }
                clicked.push(e.yes);

                if (e.orient.yes === 'b') {
                    e.svgyesid.move(e.svgid.x(), e.svgid.y() + e.svgid.bbox().height);

                    if (shapes[lookup[e.yes]].svgnextid !== undefined) {
                        shapes[lookup[e.yes]].svgnextid.move(e.svgyesid.x(), e.svgyesid.bbox().y + e.svgyesid.bbox().height);
                    }
                }
                if (e.orient.yes === 'r') {
                    e.svgyesid.move(e.svgid.x() + e.svgid.bbox().width, e.svgid.y());
                    if (shapes[lookup[e.yes]].svgnextid !== undefined) {
                        shapes[lookup[e.yes]].svgnextid.move(e.svgyesid.x(), e.svgyesid.bbox().y + e.svgyesid.bbox().height);
                    }
                }

                if (shapes[lookup[e.yes]].noBtn) {
                    shapes[lookup[e.yes]].noBtn.show();
                }
                if (shapes[lookup[e.yes]].yesBtn) {
                    shapes[lookup[e.yes]].yesBtn.show();
                }

                e.svgyesid.animate().opacity(config.maxOpacity);
                shapes[lookup[e.yes]].show = true;
                shapes[lookup[e.no]].svgid.animate().opacity(config.minOpacity);
                shapes[lookup[e.no]].show = false;

                if (shapes[lookup[e.yes]].next !== undefined) {
                    nextlabel = shapes[lookup[e.yes]].next;
                    clicked.push(nextlabel);
                    shapes[lookup[nextlabel]].svgid.animate().opacity(config.maxOpacity);
                    shapes[lookup[nextlabel]].show = true;
                    if (shapes[lookup[nextlabel]].noBtn) {
                        shapes[lookup[nextlabel]].noBtn.show();
                    }
                    if (shapes[lookup[nextlabel]].yesBtn) {
                        shapes[lookup[nextlabel]].yesBtn.show();
                    }
                }
            }

            if (choice === 'no') {
                if (shapes[lookup[e.no]].show === true && shapes[lookup[e.yes]].show === false) {
                    clckindex = clicked.indexOf(e.no);

                    for (j = clckindex; j < clicked.length; j += 1) {
                        shapes[lookup[clicked[j]]].show = false;
                        shapes[lookup[clicked[j]]].svgid.animate().opacity(config.minOpacity);
                        if (shapes[lookup[clicked[j]]].noBtn) {
                            shapes[lookup[clicked[j]]].noBtn.hide();
                        }
                        if (shapes[lookup[clicked[j]]].yesBtn) {
                            shapes[lookup[clicked[j]]].yesBtn.hide();
                        }
                    }
                    clicked.splice(clckindex, clicked.length - 1);
                    return;
                }

                clckindex = clicked.indexOf(e.yes);
              // if clckindex is more than -1 this element was clicked before
                if (clckindex > -1) {
                    for (j = clckindex; j < clicked.length; j += 1) {
                        shapes[lookup[clicked[j]]].show = false;
                        shapes[lookup[clicked[j]]].svgid.animate().opacity(config.minOpacity);
                        if (shapes[lookup[clicked[j]]].noBtn) {
                            shapes[lookup[clicked[j]]].noBtn.hide();
                        }
                        if (shapes[lookup[clicked[j]]].yesBtn) {
                            shapes[lookup[clicked[j]]].yesBtn.hide();
                        }
                    }

                    clicked.splice(clckindex, clicked.length - 1);
                }
                clicked.push(e.no);

                if (e.orient.no === 'b') {
                    e.svgnoid.move(e.svgid.x(), e.svgid.y() + e.svgid.bbox().height);

                    if (shapes[lookup[e.no]].svgnextid !== undefined) {
                        shapes[lookup[e.no]].svgnextid.move(e.svgnoid.x(), e.svgnoid.bbox().y + e.svgnoid.bbox().height);
                    }
                }
                if (e.orient.no === 'r') {
                    e.svgnoid.move(e.svgid.x() + e.svgid.bbox().width, e.svgid.y());
                    if (shapes[lookup[e.no]].svgnextid !== undefined) {
                        shapes[lookup[e.no]].svgnextid.move(e.svgnoid.x(), e.svgnoid.bbox().y + e.svgnoid.bbox().height);
                    }
                }

                if (shapes[lookup[e.no]].noBtn) {
                    shapes[lookup[e.no]].noBtn.show();
                }
                if (shapes[lookup[e.no]].yesBtn) {
                    shapes[lookup[e.no]].yesBtn.show();
                }

                e.svgnoid.animate().opacity(config.maxOpacity);
                shapes[lookup[e.no]].show = true;

                if (shapes[lookup[e.no]].next !== undefined) {
                    nextlabel = shapes[lookup[e.no]].next;
                    clicked.push(nextlabel);
                    if (shapes[lookup[nextlabel]].noBtn) {
                        shapes[lookup[nextlabel]].noBtn.show();
                    }
                    if (shapes[lookup[nextlabel]].yesBtn) {
                        shapes[lookup[nextlabel]].yesBtn.show();
                    }
                    shapes[lookup[nextlabel]].show = true;
                    shapes[lookup[nextlabel]].svgid.animate().opacity(config.maxOpacity);
                }
            }
        };

        function staticNodePoints(element) {
            var ce = element.svgid, te, targetShape,
                group = chartGroup.group();

            if (element.yes && element.yesid !== undefined) {
                te = element.svgyesid;
                targetShape = shapes[lookup[element.yes]];

                if (targetShape.inNodePos === undefined && targetShape.inNode === 't') {
                    targetShape.inNodePos = [te.cx(), te.y()];
                }

                if (element.orient.yes === 'b') {
                    element.yesOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';
                    if (targetShape.inNodePos === undefined) {
                        if (targetShape.inNode === 'l') {
                            targetShape.inNodePos = [te.x() - config.arrowHeadHeight, te.cy()];
                        }
                    }
                }

                if (element.orient.yes === 'r') {
                    element.yesOutPos = [ce.x() + ce.get(0).width(), ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';
                    if (targetShape.inNodePos === undefined) {
                        if (targetShape.inNode === 'l') {
                            targetShape.inNodePos = [te.x(), te.cy()];
                        }
                    }
                }
                isPositioned.push(element.yesid);
            }

            if (element.no && element.noid !== undefined) {
                targetShape = shapes[lookup[element.no]];
                te = element.svgnoid;

                if (element.orient.no === 'b') {
                    element.noOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                    if (targetShape.inNodePos === undefined) {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                }

                if (element.orient.no === 'r') {
                    element.noOutPos = [ce.cx() + ce.get(0).cx(), ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                    if (targetShape.inNodePos === undefined) {
                        if (targetShape.inNode === 't') {
                            targetShape.inNodePos = [te.cx(), te.y()];
                        }
                        if (targetShape.inNode === 'l') {
                            targetShape.inNodePos = [te.x(), te.cy()];
                        }
                    }
                }
                isPositioned.push(element.noid);
            }

            if (element.next) {
                targetShape = shapes[lookup[element.next]];
                if (element.orient.next === 'b') {
                    element.nextOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];

                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                    if (targetShape.inNodePos === undefined && targetShape.yesOutPos === undefined) {
                        if (targetShape.inNode === 't') {
                            te = element.svgnextid;
                            targetShape.inNodePos = [te.cx(), te.y()];
                        }
                        if (targetShape.inNode === 'l') {
                            te = element.svgnoid;
                            targetShape.inNodePos = [te.x(), te.cy()];
                        }
                    }
                }
                if (element.orient.next === 'r') {
                    element.nextOutPos = [ce.x() + ce.get(0).width(), ce.y() + ce.get(0).cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';
                    te = element.svgnextid;

                    if (targetShape.inNodePos === undefined && targetShape.yesOutPos === undefined) {
                        if (targetShape.inNode === 't') {
                            targetShape.inNodePos = [te.cx(), te.y()];
                        }
                        if (targetShape.inNode === 'l') {
                            targetShape.inNodePos = [te.x(), te.cy()];
                        }
                    }
                }
                isPositioned.push(element.nextid);
            }
            element.conngroup = group;
        }

        function nodePoints(element) {
            var ce = element.svgshape, te, targetShape;

            if (element.yes && element.yesid !== undefined) {
                te = shapes[lookup[element.yes]].svgshape;
                targetShape = shapes[lookup[element.yes]];

                if (targetShape.inNodePos === undefined && targetShape.inNode === 't') {
                    targetShape.inNodePos = [te.cx(), te.y()];
                }

                if (element.orient.yes === 'b') {
                    element.yesOutPos = [ce.cx(), ce.y() + ce.bbox().height];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';
                    if (targetShape.inNodePos === undefined) {
                        if (targetShape.inNode === 'l') {
                            targetShape.inNodePos = [te.x() - config.arrowHeadHeight, te.cy()];
                        }
                    }
                }

                if (element.orient.yes === 'r') {
                    element.yesOutPos = [ce.x() + ce.width(), ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';
                    if (targetShape.inNodePos === undefined) {
                        if (targetShape.inNode === 'l') {
                            targetShape.inNodePos = [te.x(), te.cy()];
                        }
                    }
                }
                isPositioned.push(element.yesid);
            }

            if (element.no && element.noid !== undefined) {
                targetShape = shapes[lookup[element.no]];
                te = shapes[lookup[element.no]].svgshape;

                if (element.orient.no === 'b') {
                    element.noOutPos = [ce.cx(), ce.y() + ce.bbox().height];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                    if (targetShape.inNodePos === undefined) {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                }

                if (element.orient.no === 'r') {
                    element.noOutPos = [ce.x() + ce.bbox().width, ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                    if (targetShape.inNodePos === undefined) {
                        if (targetShape.inNode === 't') {
                            targetShape.inNodePos = [te.cx(), te.y()];
                        }
                        if (targetShape.inNode === 'l') {
                            targetShape.inNodePos = [te.x(), te.cy()];
                        }
                    }
                }
                isPositioned.push(element.noid);
            }

            if (element.next) {
                targetShape = shapes[lookup[element.next]];
                if (element.orient.next === 'b') {
                    element.nextOutPos = [ce.cx(), ce.bbox().height + ce.y()];

                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                    if (targetShape.inNodePos === undefined && targetShape.yesOutPos === undefined) {
                        if (targetShape.inNode === 't') {
                            te = shapes[lookup[element.next]].svgshape;
                            targetShape.inNodePos = [te.cx(), te.y()];
                        }
                        if (targetShape.inNode === 'l') {
                            te = element.svgnoid;
                            targetShape.inNodePos = [te.x(), te.cy()];
                        }
                    }
                }
                if (element.orient.next === 'r') {
                    element.nextOutPos = [ce.x() + ce.bbox().width, ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';
                    te = shapes[lookup[element.next]].svgshape;

                    if (targetShape.inNodePos === undefined && targetShape.yesOutPos === undefined) {
                        if (targetShape.inNode === 't') {
                            targetShape.inNodePos = [te.cx(), te.y()];
                        }
                        if (targetShape.inNode === 'l') {
                            targetShape.inNodePos = [te.x(), te.cy()];
                        }
                    }
                }
                isPositioned.push(element.nextid);
            }
        }

        function addLabels(element) {
            var group = element.svgid, label;

            if (element.yes && element.yesid !== undefined) {
                label = lineLabel('Yes', group);
                element.yesBtn = label;
                label.attr('cursor', 'pointer');
                label.on('click', function () {toggleNext(element, 'yes'); });

                if (element.orient.yes === 'b') {
                    label.move(element.yesOutPos[0], element.yesOutPos[1]);
                }

                if (element.orient.yes === 'r') {
                    label.move(element.yesOutPos[0] + 20, element.yesOutPos[1] - 20);
                }
            }

            if (element.no && element.noid !== undefined) {
                label = lineLabel('No', group);
                element.noBtn = label;
                label.attr('cursor', 'pointer');
                label.on('click', function () {toggleNext(element, 'no'); });

                if (element.orient.no === 'b') {
                    label.move(element.noOutPos[0], element.noOutPos[1]);
                }

                if (element.orient.no === 'r') {
                    label.move(element.noOutPos[0] + 20, element.noOutPos[1] - 20);
                }
            }
        }

        function staticAddLabels(element) {
            var group = element.conngroup, label;

            if (element.yes && element.yesid !== undefined) {
                label = lineLabel('Yes', group);

                if (element.orient.yes === 'b') {
                    label.move(element.yesOutPos[0], element.yesOutPos[1]);
                }

                if (element.orient.yes === 'r') {
                    label.move(element.yesOutPos[0] + 20, element.yesOutPos[1] - 20);
                }
            }

            if (element.no && element.noid !== undefined) {
                label = lineLabel('No', group);

                if (element.orient.no === 'b') {
                    label.move(element.noOutPos[0], element.noOutPos[1]);
                }

                if (element.orient.no === 'r') {
                    label.move(element.noOutPos[0] + 20, element.noOutPos[1] - 20);
                }
            }
        }


        function addArrows(element) {
            var group = element.svgid, arrowhead, rightX, rightY, bottomX, bottomY;
            rightX = element.svgshape.x() + element.svgshape.bbox().width + config.connectorLength - config.arrowHeadHeight;
            rightY =  element.svgshape.cy() - (config.arrowHeadHeight / 2);
            bottomX = element.svgshape.cx()  - (config.arrowHeadHeight / 2);
            bottomY = element.svgshape.y() + element.svgshape.bbox().height + config.connectorLength - config.arrowHeadHeight;

            if (element.svgyesid !== undefined) {
                if (element.orient.yes === 'r') {
                    arrowhead = arrowHead(group);
                    arrowhead.move(rightX, rightY);
                    arrowhead.rotate(270);
                }

                if (element.orient.yes === 'b') {
                    arrowhead = arrowHead(group);
                    arrowhead.move(bottomX, bottomY);
                }
            }

            if (element.svgnoid !== undefined) {
                if (element.orient.no === 'r') {
                    arrowhead = arrowHead(group);
                    arrowhead.move(rightX, rightY);
                    arrowhead.rotate(270);
                }

                if (element.orient.no === 'b') {
                    arrowhead = arrowHead(group);
                    arrowhead.move(bottomX, bottomY);
                }
            }

            if (element.svgnextid !== undefined) {
                if (element.orient.next === 'r') {
                    arrowhead = arrowHead(group);
                    arrowhead.move(rightX, rightY);
                    arrowhead.rotate(270);
                }

                if (element.orient.next === 'b') {
                    arrowhead = arrowHead(group);
                    arrowhead.move(bottomX, bottomY);
                }
            }
        }

        function staticAddArrows(element) {
            var group = element.conngroup, arrowhead, nxt;

            if (element.yes && element.yesid !== undefined) {
                arrowhead = arrowHead(group);
                nxt = shapes[lookup[element.yes]];

                if (element.orient.yes === 'b') {
                    arrowhead.move(nxt.inNodePos[0] - (config.arrowHeadHeight / 2), nxt.inNodePos[1] - config.arrowHeadHeight);
                    if (nxt.inNode === 'l') {
                        arrowhead.rotate(270);
                    }
                }

                if (element.orient.yes === 'r') {
                    arrowhead.move(nxt.inNodePos[0] - (config.arrowHeadHeight / 2), nxt.inNodePos[1] - config.arrowHeadHeight);
                    if (nxt.inNode === 'l') {
                        arrowhead.move(nxt.inNodePos[0] - config.arrowHeadHeight, nxt.inNodePos[1] - (config.arrowHeadHeight / 2));
                        arrowhead.rotate(270);
                    }
                }
            }

            if (element.no && element.noid !== undefined) {
                arrowhead = arrowHead(group);
                nxt = shapes[lookup[element.no]];

                if (element.orient.no === 'b') {
                    arrowhead.move(nxt.inNodePos[0] - (config.arrowHeadHeight / 2), nxt.inNodePos[1] - config.arrowHeadHeight);
                }

                if (element.orient.no === 'r') {
                    arrowhead.move(nxt.inNodePos[0] - config.arrowHeadHeight, nxt.inNodePos[1] - (config.arrowHeadHeight / 2));
                    arrowhead.rotate(270);
                }
            }

            if (element.next && element.nextid !== undefined) {
                arrowhead = arrowHead(group);
                nxt = shapes[lookup[element.next]];

                if (element.orient.next === 'b') {
                    arrowhead.move(nxt.inNodePos[0] - (config.arrowHeadHeight / 2), nxt.inNodePos[1] - config.arrowHeadHeight);
                    if (nxt.inNode === 'l') {
                        arrowhead.rotate(270);
                    }
                }

                if (element.orient.next === 'r') {
                    arrowhead.move(nxt.inNodePos[0] - config.arrowHeadHeight, nxt.inNodePos[1] - (config.arrowHeadHeight / 2));
                    arrowhead.rotate(270);
                }
            }
        }

        function angleLine(start, end, element) {

            var e = element.svgshape, p1, p2, p3, p4, p5, spacer = config.arrowHeadHeight * 2;

                // See if it's at the bottom
            if (start[1] === e.y() + e.height()) {

                p1 = start;
                p2 = [start[0], start[1] + spacer ];

                if (end[1] > start[1]) {
                    p2 = [start[0], end[1] - spacer];
                    p3 = [end[0], end[1] - spacer];
                }

                if (end[0] < start[0]) {
                    p3 = [end[0], end[1] - spacer];
                }

                if (end[1] <= start[1]) {
                    p3 = [end[0], end[1] + spacer];
                }
                return [p1, p2, p3, end];
            }

            // see if out is on the right and in is at the top
            if ((start[0] < end[0]) && (start[1] > end[1])) {
                p1 = start;
                p2 = [start[0] + spacer, start[1]];
                p3 = [start[0] + spacer, end[1] - spacer];
                p4 = [end[0], end[1] - spacer];
                return [p1, p2, p3, p4, end];
            }

            // see if it starts on the right and finishes on the left below
            if ((start[0] > end[0]) && (start[1] < end[1])) {
                p1 = start;
                p2 = [start[0] + spacer, start[1]];
                p3 = [start[0] + spacer, end[1] - (config.shapeHeight / 2) - spacer];
                p4 = [end[0] - spacer, end[1] - (config.shapeHeight / 2) - spacer];
                p5 = [end[0] - spacer, end[1]];

                return [p1, p2, p3, p4, p5, end];
            }
            return [start, end];
        }

        function addConnectors(element) {
            var startln, endln;

            if (element.yesid) {
                startln = element.yesOutPos;

                if (element.orient.yes === 'b') {
                    endln = [startln[0], startln[1] + config.connectorLength];
                }

                if (element.orient.yes === 'r') {
                    endln = [startln[0] + config.connectorLength, startln[1]];
                }

                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width: 1}).fill('none').back();
            }

            if (element.noid) {
                startln = element.noOutPos;

                if (element.orient.no === 'b') {
                    endln = [startln[0], startln[1] + config.connectorLength];
                }

                if (element.orient.no === 'r') {
                    endln = [startln[0] + config.connectorLength, startln[1]];
                }

                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width: 1}).fill('none');
            }

            if (element.nextid) {
                startln = element.nextOutPos;

                if (element.orient.next === 'b') {
                    endln = [startln[0], startln[1] + config.connectorLength];
                }

                if (element.orient.next === 'r') {
                    endln = [startln[0] + config.connectorLength, startln[1]];
                }

                if (endln === undefined) {
                    endln = shapes[lookup[element.next]].yesOutPos;
                }
                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width: 1}).fill('none');
            }
        }

        function staticAddConnectors(element) {
            var startln, endln;

            if (element.yesid) {
                startln = element.yesOutPos;
                endln = shapes[lookup[element.yes]].inNodePos;
                element.conngroup.polyline(angleLine(startln, endln, element)).stroke({ width: 1}).fill('none').back();
            }

            if (element.noid) {
                startln = element.noOutPos;
                endln = shapes[lookup[element.no]].inNodePos;
                element.conngroup.polyline(angleLine(startln, endln, element)).stroke({ width: 1}).fill('none');
            }

            if (element.nextid) {
                startln = element.nextOutPos;
                endln = shapes[lookup[element.next]].inNodePos;

                if (endln === undefined) {
                    endln = shapes[lookup[element.next]].yesOutPos;
                }
                element.conngroup.polyline(angleLine(startln, endln, element)).stroke({ width: 1}).fill('none');
            }
        }

        layoutShapes = function (s) {
            shapes = s;
            console.log(shapes);
            var btnBar;
            config = init();
            config.showButtons = true;
            if (config.showButtons === true) {
                btnBar = buttonBar();
            }
            startEl = start(shapes);
            if (btnBar !== undefined) {
                startEl.y(btnBar.bbox().height + 10);
            }

            chartGroup.y(startEl.y() + startEl.bbox().height);
            shapes.forEach(makeShapes);
            shapes.forEach(yesNoIds);
            generateLookups(shapes);
            shapes.forEach(referringIds);
            shapes.forEach(positionShapes);
            if (interactive === true) {
                shapes.forEach(nodePoints);
                shapes.forEach(addConnectors);
                shapes.forEach(addLabels);
                shapes.forEach(addArrows);
            }

            if (interactive === false) {
                shapes.forEach(staticNodePoints);
                shapes.forEach(staticAddConnectors);
                shapes.forEach(staticAddLabels);
                shapes.forEach(staticAddArrows);
            }
        };

        return {
            config: setParams,
            unhide: unhide,
            hide: hide,
            draw: setRoot,
            shapes: layoutShapes
        };
    }());