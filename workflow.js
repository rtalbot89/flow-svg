/*global SVG, jQuery, $,  console*/
var SVGFlow = (function () {
        "use strict";
        var draw, lowerConnector, shapeFuncs, i, config, userOpts = {}, shapes, interactive = true, chartGroup, layoutShapes, itemIds = {}, indexFromId = {}, startEl, startId, lookup = {}, isPositioned = [], toggleNext, clicked = [];

        function setParams(u) {
            userOpts = u;
            interactive = userOpts.interactive !== undefined ? userOpts.interactive : true;
            //console.log(interactive);
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
                    startFontSize: userOpts.startFontSize || 12,
                    decisionWidth: userOpts.decisionWidth || userOpts.w || w,
                    decisionHeight: userOpts.decisionHeight || userOpts.h || h,
                    decisionFill: userOpts.decisionFill || '#8b3572',
                    decisionTextColour: userOpts.decisionTextColour || '#fff',
                    decisionFontSize: userOpts.decisionFontSize || 12,
                    finishTextColour: userOpts.finishTextColour || '#fff',
                    finishWidth: userOpts.finishWidth || userOpts.w || w,
                    finishHeight: userOpts.finishHeight || userOpts.h || h,
                    finishLeftMargin: userOpts.finishLeftMargin || 20,
                    finishFill: userOpts.finishFill || '#0F6C7E',
                    finishFontSize: userOpts.finishFontSize || 12,
                    processWidth: userOpts.processWidth || userOpts.w || w,
                    processHeight: userOpts.processHeight || userOpts.h || h,
                    processLeftMargin: userOpts.processLeftMargin || 20,
                    processFill: userOpts.processFill || '#fff',
                    processStrokeColour: userOpts.processStrokeColour || shapeStrokeColour,
                    processStrokeWidth: userOpts.processStrokeWidth || 0.1,
                    processTextColour: userOpts.processTextColour || darkText,
                    processFontSize: userOpts.processFontSize || 12,
                    labelWidth: userOpts.labelWidth || 30,
                    labelHeight: userOpts.labelHeight || 20,
                    labelRadius: userOpts.labelRadius || 5,
                    labelStroke: userOpts.labelStroke || 0.1,
                    labelFill: userOpts.labelFill || arrowColour,
                    labelClickedFill: userOpts.labelClickedFill || 'black',
                    labelOpacity: userOpts.labelOpacity || 1.0,
                    labelFontSize: userOpts.labelFontSize || 12,
                    arrowHeadHeight: userOpts.arrowHeadHeight || 20,
                    arrowStroke: userOpts.arrowStroke ||  1.0,
                    arrowLineColour: userOpts.arrowLineColour || arrowColour,
                    arrowHeadColor: userOpts.arrowHeadColor || arrowColour,
                    arrowTextColour: userOpts.arrowTextColour || '#fff',
                    arrowFontSize: userOpts.arrowFontSize || 12,
                    arrowHeadOpacity: userOpts.arrowHeadOpacity || 1.0
                    //extendLeft: userOpts.extendLeft || 0
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
            return labelGroup;
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
            var text,
                group = chartGroup.group(),
                content = chartGroup.group();

            group.attr({
                "class": "finish-group"
            });
            group
                .rect(config.finishWidth, config.finishHeight)
                .attr({
                    fill: config.finishFill,
                    "class": "fc-finish"
                }).radius(20);

            text = content.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine();
                });
            });
            text.fill(config.finishTextColour).font({size: config.finishFontSize});

            group.add(content);

            // Dealing with links
            if (options.links) {
                options.links.forEach(function (l) {
                    var url = draw.link(l.url),
                        txt = draw.text(l.text),
                        tbox;
                    url.add(txt);
                    txt.fill('yellow').font({size: config.finishFontSize});
                    tbox = content.bbox();
                    txt.dmove(0, tbox.height + 5);
                    content.add(url);
                });
            }
            // check content y. might be a bit of a gap
            content.cy(config.finishHeight / 2);
            content.x(config.finishLeftMargin);
            return group;
        }

        // The process shape that has an outlet, but no choice
        function process(options) {
            var text,
                group = chartGroup.group()
                    .attr({
                        "class": "process-group"
                    }),
                rect = group
                    .rect(config.processWidth, config.processHeight)
                    .attr({
                        fill: config.processFill,
                        stroke: config.processStrokeColour,
                        "class": "fc-process"
                    });

            text = group.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine();
                });
            });

            // This is buggy but best that can be done for now
            text.cy(rect.bbox().cy);
            text.move(config.finishLeftMargin);
            text.font({size: config.processFontSize});
            return group;
        }

        shapeFuncs = {
            decision: decision,
            finish: finish,
            process: process
        };

        function start(shapes) {
            var text, shapeBox, rect,
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
                //group.attr({"cursor": "pointer"});
                group.click(function () {
                    var firstShape = shapes[0].svgid;
                    if (firstShape.opacity() === config.minOpacity) {
                        firstShape.animate().opacity(config.maxOpacity);
                        //shapes[0].conngroup.animate().opacity(config.maxOpacity);
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
            draw.each(function () {
                if (this.opacity() === config.minOpacity) {
                    this.opacity(config.maxOpacity);
                }
            }, true);
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
                //chartGroup.add(shape);
                element.id = shape.attr('id');
                element.svgid = shape;
                element.svgshape = shape.get(0);
                itemIds[element.label] = element.id;
                indexFromId[element.id] = index;
                if (interactive === false) {
                    shape.opacity(config.maxOpacity);
                } else {
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
                if (e.svgyesid.opacity() === config.maxOpacity) {
                    clckindex = clicked.indexOf(e.yes);

                    for (j = clckindex; j < clicked.length; j += 1) {
                        shapes[lookup[clicked[j]]].svgid.animate().opacity(config.minOpacity);
                    }
                    clicked.splice(clckindex, clicked.length - 1);
                    return;
                }

                clckindex = clicked.indexOf(e.no);
              // if clckindex is more than -1 this element was clicked before
                if (clckindex > -1) {
                    for (j = clckindex; j < clicked.length; j += 1) {
                        shapes[lookup[clicked[j]]].svgid.animate().opacity(config.minOpacity);
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

                e.svgyesid.animate().opacity(config.maxOpacity);

               // shapes[lookup[e.yes]].conngroup.animate().opacity(config.maxOpacity);

                shapes[lookup[e.no]].svgid.animate().opacity(config.minOpacity);

                if (shapes[lookup[e.yes]].next !== undefined) {
                    nextlabel = shapes[lookup[e.yes]].next;
                    clicked.push(nextlabel);
                    shapes[lookup[nextlabel]].svgid.animate().opacity(config.maxOpacity);
                }
            }

            if (choice === 'no') {
                if (e.svgnoid.opacity() === config.maxOpacity) {
                    clckindex = clicked.indexOf(e.no);
                    console.log(clckindex);

                    for (j = clckindex; j < clicked.length; j += 1) {
                        shapes[lookup[clicked[j]]].svgid.animate().opacity(config.minOpacity);
                    }
                    clicked.splice(clckindex, clicked.length - 1);
                    return;
                }

                clckindex = clicked.indexOf(e.yes);
              // if clckindex is more thsn -1 this element was clicked before
                if (clckindex > -1) {
                    for (j = clckindex; j < clicked.length; j += 1) {
                        shapes[lookup[clicked[j]]].svgid.animate().opacity(config.minOpacity);
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

                e.svgnoid.animate().opacity(config.maxOpacity);

                if (shapes[lookup[e.no]].next !== undefined) {
                    nextlabel = shapes[lookup[e.no]].next;
                    clicked.push(nextlabel);
                    shapes[lookup[nextlabel]].svgid.animate().opacity(config.maxOpacity);
                }
            }
        };

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
                            //te = element.svgnextid;
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
                    //te = element.svgnextid;
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
            //element.conngroup = group;
        }

        function addLabels(element) {
            var group = element.svgid, label;

            if (element.yes && element.yesid !== undefined) {
                label = lineLabel('Yes', group);
                element.yesBtn = label;
                label.attr('cursor', 'pointer');

                if (interactive === true) {
                    label.on('click', function () {toggleNext(element, 'yes'); });
                }

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

                if (interactive === true) {
                    label.on('click', function () {toggleNext(element, 'no'); });
                }

                if (element.orient.no === 'b') {
                    label.move(element.noOutPos[0], element.noOutPos[1]);
                }

                if (element.orient.no === 'r') {
                    label.move(element.noOutPos[0] + 20, element.noOutPos[1] - 20);
                }
            }
        }

        function addArrows(element) {
            var group = element.svgid, arrowhead, nxt, rightX, rightY, bottomX, bottomY;
            if (interactive === true) {
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

            if (interactive === false) {
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
        }

        function angleLine(start, end, element) {

            var e = element.svgid, p1, p2, p3, p4, p5, spacer = config.arrowHeadHeight * 2;

                // See if it's at the bottom
            if (start[1] === e.y() + e.get(0).height()) {

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
                //console.log('start is to the left and below end');
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

                if (interactive === true) {
                    if (element.orient.yes === 'b') {
                        endln = [startln[0], startln[1] + config.connectorLength];
                    }

                    if (element.orient.yes === 'r') {
                        endln = [startln[0] + config.connectorLength, startln[1]];
                    }
                }

                if (interactive === false) {
                    endln = shapes[lookup[element.yes]].inNodePos;
                }
                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width: 1}).fill('none').back();
            }

            if (element.noid) {
                startln = element.noOutPos;

                if (interactive === true) {
                    if (element.orient.no === 'b') {
                        endln = [startln[0], startln[1] + config.connectorLength];
                    }

                    if (element.orient.no === 'r') {
                        endln = [startln[0] + config.connectorLength, startln[1]];
                    }
                }

                if (interactive === false) {
                    endln = shapes[lookup[element.no]].inNodePos;
                }

                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width: 1}).fill('none');
            }

            if (element.nextid) {
                startln = element.nextOutPos;

                if (interactive === true) {
                    if (element.orient.next === 'b') {
                        endln = [startln[0], startln[1] + config.connectorLength];
                    }

                    if (element.orient.next === 'r') {
                        endln = [startln[0] + config.connectorLength, startln[1]];
                    }
                }

                if (interactive === false) {
                    endln = shapes[lookup[element.next]].inNodePos;
                }

                if (endln === undefined) {
                    endln = shapes[lookup[element.next]].yesOutPos;
                }
                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width: 1}).fill('none');
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
            shapes.forEach(nodePoints);
            shapes.forEach(addConnectors);
            shapes.forEach(addLabels);
            shapes.forEach(addArrows);

            //hide all the connectors
            if (interactive === true) {
                shapes.forEach(function (element) {
                  // New do it by property way
                    //element.show = false;
                    element.svgid.opacity(config.minOpacity);
                    if (element.conngroup) {
                        element.conngroup.opacity(config.minOpacity);
                    }
                });
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