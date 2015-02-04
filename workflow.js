/*global SVG, jQuery, $,  console*/
var SVGFlow = (function () {
        "use strict";
        var draw, lowerConnector, shapeFuncs, i, config, userOpts = {}, arrowSet, shapes, interactive = true, chartGroup, layoutShapes, itemIds = {}, indexFromId = {}, startEl, startId, lookup = {}, isPositioned = [];

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
                    connectorLength: userOpts.connectorLength || 60,
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
            return labelGroup;
        }

        function arrowConnector(options, txt) {
            var text,
                arrowGroup = arrowLine(options),
                labelGroup = draw.group(),
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

            text = labelGroup.text(txt).attr({
                fill: config.arrowTextColour,
                'text-anchor': 'middle',
                'font-size' : config.arrowFontSize
            });
            text.cy(label.cy());

            arrowGroup.add(labelGroup);

            if (txt === 'Yes') {
                if (options.orient !== undefined && options.orient.yes === 'r') {
                    arrowGroup.rotate(270);
                    labelGroup.rotate(90);
                }
            }

            if (txt === 'No') {
                if (options.orient.no === 'r') {
                    arrowGroup.rotate(270);
                    labelGroup.rotate(90);
                }

                if (options.orient.no === 'l') {
                    arrowGroup.rotate(90);
                    labelGroup.rotate(-90);
                }
            }
            arrowGroup.attr({"class" : "fc-arrow"});
            if (interactive === true) {
                arrowGroup.attr({"cursor": "pointer"});
            }
            arrowSet.add(arrowGroup);
            return arrowGroup;
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
                    } else {
                        firstShape.animate().opacity(1);
                        shapes.forEach(function (s) {
                            SVG.get(s.id).animate().opacity(0);
                        });
                    }
                });
            }

            return group;
        }

        function setRoot(el) {
            draw = el;
            arrowSet = draw.set();
            chartGroup = draw.group();
            if (userOpts.interactive === false) {
                draw.each(function () {
                    if (this.opacity() === 0) {
                        layoutShapes(shapes);
                        this.opacity(1);
                    }
                }, true);
            }
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
            // There might be a SOC issue with this
            if (element.type && (typeof shapeFuncs[element.type] === 'function')) {
                var shape = shapeFuncs[element.type](element);
                chartGroup.add(shape);
                element.id = shape.attr('id');
                itemIds[element.label] = element.id;
                indexFromId[element.id] = index;
                //console.log(interactive);
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
            }
            if (element.no) {
                element.noid = itemIds[element.no];
            }
            if (element.next) {
                element.nextid = itemIds[element.next];
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
                    if (element.orient.yes === 'b') {
                        shapes[next].isBelow = element.id;
                    }

                    if (element.orient.yes === 'r') {
                        shapes[next].isRightOf = element.id;
                    }
                }
            }
            if (element.no) {
                next = lookup[element.no];
                if (shapes[next]) {
                    shapes[next].previd = element.id;
                    if (element.orient.no === 'b') {
                        shapes[next].isBelow = element.id;
                    }

                    if (element.orient.no === 'r') {
                        shapes[next].isRightOf = element.id;
                    }
                }
            }
            if (element.next) {
                next = lookup[element.next];
                if (shapes[next]) {
                    shapes[next].previd = element.id;
                    if (element.orient.next === 'b') {
                        shapes[next].isBelow = element.id;
                    }

                    if (element.orient.next === 'r') {
                        shapes[next].isRightOf = element.id;
                    }
                }
            }
        }

        function positionShapes(element, index) {
            var ce = SVG.get(element.id), rightMargin, eb;

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
                    console.log(index);
                    eb = SVG.get(element.isBelow);
                    ce.move(eb.x(), eb.y() + eb.bbox().height);
                } else {
                    eb = SVG.get(element.isBelow);
                    ce.move(eb.x(), eb.y() + eb.bbox().height + config.connectorLength);
                }
            }

            if (element.isRightOf) {
                rightMargin = element.moveRight !== undefined ? element.moveRight : config.connectorLength;
                eb = SVG.get(element.isRightOf);
                ce.move(eb.x() + eb.bbox().width + rightMargin, eb.y());
            }
        }

        function nodePoints(element) {
            var ce = SVG.get(element.id), te, targetShape;

            if (element.yes && element.yesid !== undefined && element.orient.yes === 'b') {
                element.yesOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];

                targetShape = shapes[lookup[element.yes]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                if (targetShape.inNodePos === undefined) {
                    if (targetShape.inNode === 't') {
                        te = SVG.get(element.yesid);
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        te = SVG.get(element.yesid);
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                    isPositioned.push(element.yesid);
                }
            }

            if (element.no && element.noid !== undefined && element.orient.no === 'b') {
                element.noOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];

                targetShape = shapes[lookup[element.no]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                if (targetShape.inNodePos === undefined) {
                    if (targetShape.inNode === 't') {
                        te = SVG.get(element.noid);
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        te = SVG.get(element.noid);
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                    isPositioned.push(element.yesid);
                }
            }

            if (element.yes && element.yesid !== undefined && element.orient.yes === 'r') {
                te = SVG.get(element.yesid);

                element.yesOutPos = [ce.x() + ce.get(0).width(), ce.cy()];
                targetShape = shapes[lookup[element.yes]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                if (targetShape.inNodePos === undefined) {
                    if (targetShape.inNode === 't') {
                        te = SVG.get(element.yesid);
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        te = SVG.get(element.yesid);
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                    isPositioned.push(element.yesid);
                }
            }

            if (element.no && element.noid !== undefined && element.orient.no === 'r') {
                te = SVG.get(element.noid);
                element.noOutPos = [ce.cx() + ce.get(0).cx(), ce.cy()];

                targetShape = shapes[lookup[element.no]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                if (targetShape.inNodePos === undefined) {
                    if (targetShape.inNode === 't') {
                        te = SVG.get(element.noid);
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        te = SVG.get(element.noid);
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                    isPositioned.push(element.noid);
                }
            }

            if (element.next && element.orient.next === 'b') {
                element.nextOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];
                targetShape = shapes[lookup[element.next]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                if (targetShape.inNodePos === undefined && targetShape.yesOutPos === undefined) {
                    if (targetShape.inNode === 't') {
                        te = SVG.get(element.nextid);
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        te = SVG.get(element.noid);
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                    isPositioned.push(element.nextid);
                }
            }

            if (element.next && element.orient.next === 'r') {

                element.nextOutPos = [ce.x() + ce.get(0).width(), ce.y() + ce.get(0).cy()];
                targetShape = shapes[lookup[element.next]];
                targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                if (targetShape.inNodePos === undefined && targetShape.yesOutPos === undefined) {
                    if (targetShape.inNode === 't') {
                        te = SVG.get(element.nextid);
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        te = SVG.get(element.nextid);
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                    isPositioned.push(element.nextid);
                }
            }
        }

        function arrowEvents() {
            var tracker = [], toHide = [];
            arrowSet.each(function () {
                this.click(function () {
                    var txt = this.get(2).get(1).content,
                        parentId = this.parent.attr('id'),
                        parentIndex = indexFromId[parentId],
                        parentOptions = shapes[parentIndex],
                        n,
                        y;

                    if (txt === 'Yes') {
                        tracker.push(parentOptions.yesid);
                        n = tracker.indexOf(parentOptions.noid);
                        if (n > -1) {
                            tracker.splice(n, 1);
                            toHide.push(parentOptions.noid);
                        }
                        y = toHide.indexOf(parentOptions.yesid);
                        if (y > -1) {
                            toHide.splice(y, 1);
                        }
                    }

                    if (txt === 'No') {
                        tracker.push(parentOptions.noid);
                        n = tracker.indexOf(parentOptions.yesid);
                        if (n > -1) {
                            tracker.splice(n, 1);
                            toHide.push(parentOptions.yesid);
                        }
                        y = toHide.indexOf(parentOptions.noid);
                        if (y > -1) {
                            toHide.splice(y, 1);
                        }
                    }

                    tracker.forEach(function (element) {
                        shapes[indexFromId[element]].visible = true;
                        if (shapes[indexFromId[element]].nextid) {
                            var nextid = shapes[indexFromId[element]].nextid;
                            shapes[indexFromId[nextid]].visible = true;
                        }

                    });
                    toHide.forEach(function (element) {
                        shapes[indexFromId[element]].visible = false;
                    });
                    shapes.forEach(function (element) {
                        if (element.previd && shapes[indexFromId[element.previd]] !== undefined && shapes[indexFromId[element.previd]].visible === false) {
                            element.visible = false;
                        }
                    });
                    shapes.forEach(function (element) {
                        if (element.visible === false) {
                            SVG.get(element.id).animate().opacity(0);
                        }
                        if (element.visible === true) {
                            SVG.get(element.id).animate().opacity(1);
                        }
                    });
                });
            });
        }

        function angleLine(start, end, element) {
            var e = SVG.get(element.id), p1, p2, p3, p4, p5;
                // See if it's at the bottom
            if (start[1] === e.y() + e.get(0).height()) {
                console.log('bottom');
                p1 = start;
                p2 = [start[0], start[1] + 20 ];

                if (end[1] > start[1]) {
                    p2 = [start[0], end[1] - 20];
                    p3 = [end[0], end[1] - 20];
                }

                if (end[0] < start[0]) {
                    p3 = [end[0], end[1] - 20];
                }

                if (end[1] <= start[1]) {
                    p3 = [end[0], end[1] + 20];
                }
                return [p1, p2, p3, end];
            }

            // see if out is on the right and in is at the top
            if ((start[0] < end[0]) && (start[1] > end[1])) {
                console.log('start is to the left and below end');
                p1 = start;
                p2 = [start[0] + 20, start[1]];
                p3 = [start[0] + 20, end[1] - 20];
                p4 = [end[0], end[1] - 20];
                return [p1, p2, p3, p4, end];
            }

            // see if it starts on the right and finishes on the left below
            if ((start[0] > end[0]) && (start[1] < end[1])) {
                p1 = start;
                p2 = [start[0] + 20, start[1]];
                p3 = [start[0] + 20, end[1] - (config.shapeHeight / 2) - 20];
                p4 = [end[0] - 20, end[1] - (config.shapeHeight / 2) - 20];
                p5 = [end[0] - 20, end[1]];

                return [p1, p2, p3, p4, p5, end];
            }

            return [start, end];
        }

        function adjustConnectors(element) {
            var p1,
                p4,
                lineColour;

            if (element.yesid) {
                p1 = element.yesOutPos;
                p4 = shapes[lookup[element.yes]].inNodePos;
                lineColour = 'green';
                draw.polyline(angleLine(p1, p4, element)).stroke({ width: 1, colour: lineColour }).fill('none');
            }

            if (element.noid) {
                p1 = element.noOutPos;
                p4 = shapes[lookup[element.no]].inNodePos;
                lineColour = 'red';
                draw.polyline(
                    angleLine(p1, p4, element)
                ).stroke({ width: 1, colour: lineColour }).fill('none');
            }

            if (element.nextid) {
                p1 = element.nextOutPos;
                p4 = shapes[lookup[element.next]].inNodePos;
                lineColour = 'blue';
                if (p4 === undefined) {
                    p4 = shapes[lookup[element.next]].yesOutPos;
                }
                draw.polyline(
                    angleLine(p1, p4, element)
                ).stroke({ width: 1, colour: lineColour }).fill('none');
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

            // Generate a lookup that gives Array IDs from SVG ids
            // lookup = {};
            generateLookups(shapes);

            // Add the ids of previous (referring) elements to the array
            shapes.forEach(referringIds);
            // Layout the shapes
            //console.log(shapes);
            shapes.forEach(positionShapes);

            shapes.forEach(nodePoints);

            shapes.forEach(adjustConnectors);

            // The show/hide function. Only apply if we are in interactive mode
            if (interactive === true) {
                arrowEvents();
            }
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
