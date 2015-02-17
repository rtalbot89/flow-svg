/*global SVG, jQuery, $,  console*/
var SVGFlow = (function () {
        "use strict";
        var draw, lowerConnector, shapeFuncs, i, config, userOpts = {}, shapes, interactive = true, chartGroup, layoutShapes, itemIds = {}, indexFromId = {}, startEl, startId, lookup = {}, isPositioned = [], toggleNext;

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

        function arrowHead() {
            var coords =
                    "0,0 " +
                    config.arrowHeadHeight
                    + ",0 "
                    + config.arrowHeadHeight / 2
                    + "," + config.arrowHeadHeight,

                ah = draw.polygon(coords).fill({
                    color: config.arrowHeadColor,
                    opacity: config.arrowHeadOpacity
                });
            ah.cx(config.arrowHeadHeight / 2);
            ah.cy(config.arrowHeadHeight / 2);
            return ah;
        }

        function arrowLine() {
            var group = draw.group(),
                ah = arrowHead()
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

        function lineLabel(t) {
            var text, labelGroup = draw.group(),
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
            labelGroup.style('cursor', 'pointer');
            return labelGroup;
        }

        function decision(options) {
            var shape, text,
                group = draw.group(),
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

            shape.clone();

            text = group.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine().attr('text-anchor', 'middle');
                });
            });
            text.fill(config.decisionTextColour).font({size: config.decisionFontSize});

            text.clipWith(shape);

            text.cx(shape.cx() + text.bbox().width + text.bbox().x);
            text.cy(shape.cy());
            return group;
        }

        function finish(options) {
            var text,
                group = draw.group(),
                content = draw.group();

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
                group = draw.group()
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
                group.attr({"cursor": "pointer"});
                group.click(function () {
                    var firstShape = SVG.get(shapes[0].id);
                    if (firstShape.opacity() === 0) {
                        firstShape.animate().opacity(1);
                        shapes[0].conngroup.animate().opacity(1);
                    } else {
                        firstShape.animate().opacity(0);
                        shapes[0].conngroup.animate().opacity(0);
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
                if (this.opacity() === 0) {
                    this.opacity(1);
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
                chartGroup.add(shape);
                element.id = shape.attr('id');
                element.svgid = shape;
                itemIds[element.label] = element.id;
                indexFromId[element.id] = index;
                if (interactive === false) {
                    shape.opacity(1);
                } else {
                    shape.opacity(0);
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
                    //console.log(index);
                    eb = element.svgisBelow;
                    ce.move(eb.x(), eb.y() + eb.bbox().height);
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
            var nxt, shapelookup, invlookup;
            if (choice === 'yes') {
                console.log('one');
                nxt = e.svgyesid;
                shapelookup = e.yes;
                invlookup = e.no;
                e.svgnoid.animate().opacity(0);

                shapes.forEach(function (sh, index) {
                    if (sh.svgprevid.opacity() === 0  && index !== 0) {
                        sh.svgid.opacity(0);
                        sh.conngroup.opacity(0);
                    }
                });

                shapes[lookup[invlookup]].conngroup.opacity(0);

            } else {
                console.log('two');
                nxt = e.svgnoid;
                shapelookup = e.no;
                invlookup = e.yes;
                e.svgyesid.opacity(0);
            }

            if (nxt.opacity() === 0) {
                console.log('three');
                shapes[lookup[invlookup]].conngroup.opacity(0);
                shapes.forEach(function (sh, index) {
                    if (sh.svgprevid.opacity() === 0  && index !== 0) {
                        sh.svgid.opacity(0);
                        sh.conngroup.opacity(0);
                    }
                });
                shapes[lookup[shapelookup]].conngroup.animate().opacity(1);
                nxt.animate().opacity(1);

            } else {
                console.log('four');
                nxt.opacity(0);
                shapes[lookup[shapelookup]].conngroup.opacity(0);
                shapes.forEach(function (sh, index) {
                    if (sh.svgprevid.opacity() === 0  && index !== 0) {
                        sh.svgid.opacity(0);
                        sh.conngroup.opacity(0);
                    }
                });
            }
        };

        function nodePoints(element) {
            var ce = element.svgid, te, targetShape, arrowhead, label,
                group = draw.group();
            if (interactive === true) {
                group.opacity(0);
            }

            if (element.yes && element.yesid !== undefined && element.orient.yes === 'b') {
                te = element.svgyesid;
                element.yesOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];
                label = lineLabel('Yes');
                group.add(label);
                arrowhead = arrowHead();
                group.add(arrowhead);
                label.move(element.yesOutPos[0], element.yesOutPos[1]);
                label.on('click', function () {
                    toggleNext(element, 'yes');
                });

                targetShape = shapes[lookup[element.yes]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                if (targetShape.inNodePos === undefined) {
                    if (targetShape.inNode === 't') {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x() - arrowhead.width(), te.cy()];
                    }
                    arrowhead.move(targetShape.inNodePos[0] - config.arrowHeadHeight / 2, targetShape.inNodePos[1] - config.arrowHeadHeight);
                    isPositioned.push(element.yesid);
                }
            }

            if (element.no && element.noid !== undefined && element.orient.no === 'b') {
                element.noOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];
                label = lineLabel('No');
                group.add(label);
                arrowhead = arrowHead();
                group.add(arrowhead);
                label.move(element.noOutPos[0], element.noOutPos[1]);
                label.on('click', function () {toggleNext(element, 'no'); });

                targetShape = shapes[lookup[element.no]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                te = element.svgnoid;

                if (targetShape.inNodePos === undefined) {
                    targetShape.inNodePos = [te.cx(), te.y()];
                    arrowhead.move(targetShape.inNodePos[0] - config.arrowHeadHeight / 2, targetShape.inNodePos[1] - config.arrowHeadHeight);
                    isPositioned.push(element.yesid);
                }
            }

            if (element.yes && element.yesid !== undefined && element.orient.yes === 'r') {
                te = element.svgyesid;
                element.yesOutPos = [ce.x() + ce.get(0).width(), ce.cy()];
                label = lineLabel('Yes');
                group.add(label);
                arrowhead = arrowHead();
                group.add(arrowhead);
                label.move(element.yesOutPos[0] + 20, element.yesOutPos[1] - 20);
                label.on('click', function () {toggleNext(element, 'yes'); });
                targetShape = shapes[lookup[element.yes]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                if (targetShape.inNodePos === undefined) {
                    if (targetShape.inNode === 't') {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                    arrowhead.move(targetShape.inNodePos[0] - config.arrowHeadHeight / 2, targetShape.inNodePos[1] - config.arrowHeadHeight);
                    isPositioned.push(element.yesid);
                }
            }

            if (element.no && element.noid !== undefined && element.orient.no === 'r') {
                te = element.svgnoid;
                element.noOutPos = [ce.cx() + ce.get(0).cx(), ce.cy()];
                label = lineLabel('No');
                group.add(label);
                arrowhead = arrowHead();
                group.add(arrowhead);
                label.move(element.noOutPos[0] + 20, element.noOutPos[1] - 20);
                label.on('click', function () {toggleNext(element, 'no'); });

                targetShape = shapes[lookup[element.no]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                if (targetShape.inNodePos === undefined) {
                    if (targetShape.inNode === 't') {
                        targetShape.inNodePos = [te.cx(), te.y()];
                        arrowhead.move(targetShape.inNodePos[0] - config.arrowHeadHeight / 2, targetShape.inNodePos[1] - config.arrowHeadHeight);
                    }
                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
                        arrowhead.move(targetShape.inNodePos[0] - config.arrowHeadHeight, targetShape.inNodePos[1] - (config.arrowHeadHeight / 2));
                        arrowhead.rotate(270);
                    }
                    isPositioned.push(element.noid);
                }
            }

            if (element.next && element.orient.next === 'b') {
                element.nextOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];
                targetShape = shapes[lookup[element.next]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                arrowhead = arrowHead();
                group.add(arrowhead);

                if (targetShape.inNodePos === undefined && targetShape.yesOutPos === undefined) {
                    if (targetShape.inNode === 't') {
                        te = element.svgnextid;
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        te = element.svgnoid;
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                    arrowhead.move(targetShape.inNodePos[0] - config.arrowHeadHeight / 2, targetShape.inNodePos[1] - config.arrowHeadHeight);
                    isPositioned.push(element.nextid);
                }
            }

            if (element.next && element.orient.next === 'r') {

                element.nextOutPos = [ce.x() + ce.get(0).width(), ce.y() + ce.get(0).cy()];
                targetShape = shapes[lookup[element.next]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';
                arrowhead = arrowHead();
                group.add(arrowhead);
                te = element.svgnextid;

                if (targetShape.inNodePos === undefined && targetShape.yesOutPos === undefined) {
                    if (targetShape.inNode === 't') {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                    arrowhead.move(targetShape.inNodePos[0] - config.arrowHeadHeight / 2, targetShape.inNodePos[1] - config.arrowHeadHeight);
                    isPositioned.push(element.nextid);
                }
            }
            element.conngroup = group;
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

        function adjustConnectors(element) {
            var p1,
                p4,
                conn;

            if (element.yesid) {
                p1 = element.yesOutPos;
                p4 = shapes[lookup[element.yes]].inNodePos;
                conn = draw.polyline(angleLine(p1, p4, element)).stroke({ width: 1}).fill('none').back();
                element.conngroup.add(conn);
            }

            if (element.noid) {
                p1 = element.noOutPos;
                p4 = shapes[lookup[element.no]].inNodePos;
                conn = draw.polyline(
                    angleLine(p1, p4, element)
                ).stroke({ width: 1}).fill('none').back();
                element.conngroup.add(conn);
            }

            if (element.nextid) {
                p1 = element.nextOutPos;
                p4 = shapes[lookup[element.next]].inNodePos;

                if (p4 === undefined) {
                    p4 = shapes[lookup[element.next]].yesOutPos;
                }
                conn = draw.polyline(
                    angleLine(p1, p4, element)
                ).stroke({ width: 1}).fill('none').back();
                element.conngroup.add(conn);
            }
        }

        layoutShapes = function (s) {
            shapes = s;
            console.log(shapes);
            config = init();
            startEl = start(shapes);
            chartGroup.x(config.leftMargin);
            chartGroup.add(startEl);

            config.showButtons = true;
            if (config.showButtons === true) {
                chartGroup.add(buttonBar());
                startEl.move(0, config.btnBarHeight + 20);
            }

            shapes.forEach(makeShapes);
            shapes.forEach(yesNoIds);

            // Generate a lookup that provides Array IDs from SVG ids
            generateLookups(shapes);

            // Add the ids of previous (referring) elements to the array
            shapes.forEach(referringIds);

            // Lay out the shapes
            shapes.forEach(positionShapes);

            shapes.forEach(nodePoints);

            shapes.forEach(adjustConnectors);
        };


        /*
        function drawGrid(draw) {
            var startPoint = 0,
                numCols = Math.round(draw.width() / config.gridCol),
                colHeight = draw.height(),
                pageWidth = draw.width(),
                numRows = Math.round(colHeight / config.rowHeight),
                startRow = 0,
                j;

            for (i = 0; i < numCols + 1; i += 1) {
                draw.line(startPoint, 0, startPoint, colHeight).stroke({
                    width: 0.15
                });
                startPoint += config.gridCol;
            }

            for (j = 0; j < numRows + 1; j += 1) {
                draw.line(0, startRow, pageWidth, startRow).stroke({
                    width: 0.15
                });
                startRow += config.rowHeight;
            }
        }
        */

        return {
            config: setParams,
            unhide: unhide,
            hide: hide,
            draw: setRoot,
            shapes: layoutShapes
        };

    }());
//drawGrid(draw);
//unhide();
