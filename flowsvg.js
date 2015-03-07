/*global SVG, console, window, document, jQuery*/

var flowSVG = (function () {
        "use strict";
        var draw, lowerConnector, shapeFuncs, i, config, userOpts = {}, shapes, interactive = true, chartGroup, layoutShapes, itemIds = {}, indexFromId = {}, startEl, startId, lookup = {}, isPositioned = [], toggleNext, clicked = [], showButtons = true, scrollto = true;

        function setParams(u) {
            userOpts = u;
            interactive = userOpts.interactive !== undefined ? userOpts.interactive : true;
            showButtons = userOpts.showButtons !== undefined ? userOpts.showButtons : true;
            scrollto = userOpts.scrollto !== undefined ? userOpts.scrollto : true;
        }

        function init() {
          // Set defaults
            var w = userOpts.w || 180,
                h = userOpts.h || 140,
                arrowColour = userOpts.arrowColour || 'grey',
                shapeStrokeColour = 'rgb(66, 66, 66)',
                lightText = '#fff',
                darkText = 'rgb(51, 51, 51)',
                defaultFontSize = userOpts.defaultFontSize || 12,
                defaults = {
                    showButtons: userOpts.showButtons || true,
                    minOpacity: userOpts.minOpacity || 0,
                    maxOpacity: userOpts.maxOpacity || 1,
                    btnBarHeight: userOpts.btnBarHeight || 40,
                    btnBarSelectedColour: userOpts.btnBarSelectedColour || 'black',
                    btnBarHoverColour: userOpts.btnBarHoverColour || 'dimgrey',
                    btnBarFontSize: userOpts.btnBarFontSize || defaultFontSize,
                    btnBarRadius: userOpts.btnBarRadius || 10,
                    shapeWidth: userOpts.shapeWidth  || w,
                    shapeHeight: userOpts.shapeHeight  || h,
                    connectorLength: userOpts.connectorLength || 80,
                    startWidth: userOpts.startWidth  || w,
                    startHeight: userOpts.startHeight || 40,
                    startCornerRadius: userOpts.startCornerRadius || 20,
                    startFill:  userOpts.startFill || arrowColour,
                    startStrokeWidth: userOpts.startStrokeWidth || 0.1,
                    startStrokeColour: userOpts.startStrokeColour || 'rgb(66, 66, 66)',
                    startTextColour: userOpts.startTextColour || lightText,
                    startText: userOpts.startText || 'Start',
                    startFontSize: userOpts.startFontSize || defaultFontSize,
                    decisionWidth: userOpts.decisionWidth || userOpts.w || w,
                    decisionHeight: userOpts.decisionHeight || userOpts.h || h,
                    decisionFill: userOpts.decisionFill || '#8b3572',
                    decisionTextColour: userOpts.decisionTextColour || lightText,
                    decisionFontSize: userOpts.decisionFontSize || defaultFontSize,
                    finishTextColour: userOpts.finishTextColour ||  lightText,
                    finishWidth: userOpts.finishWidth  || w,
                    finishHeight: userOpts.finishHeight  || h,
                    finishLeftMargin: userOpts.finishLeftMargin || 20,
                    finishFill: userOpts.finishFill || '#0F6C7E',
                    finishFontSize: userOpts.finishFontSize  || defaultFontSize,
                    finishLinkColour: userOpts.finishLinkColour || 'yellow',
                    processWidth: userOpts.processWidth  || w,
                    processHeight: userOpts.processHeight  || h,
                    processLeftMargin: userOpts.processLeftMargin || 20,
                    processFill: userOpts.processFill || '#fff',
                    processStrokeColour: userOpts.processStrokeColour || shapeStrokeColour,
                    processStrokeWidth: userOpts.processStrokeWidth || 0.1,
                    processTextColour: userOpts.processTextColour || darkText,
                    processFontSize: userOpts.processFontSize  || defaultFontSize,
                    processLinkColour: userOpts.processLinkColour || 'darkblue',
                    labelWidth: userOpts.labelWidth || 30,
                    labelHeight: userOpts.labelHeight || 20,
                    labelRadius: userOpts.labelRadius || 5,
                    labelStroke: userOpts.labelStroke || 0.1,
                    labelFill: userOpts.labelFill || arrowColour,
                    labelOpacity: userOpts.labelOpacity || 1.0,
                    labelFontSize: userOpts.labelFontSize ||  defaultFontSize,
                    labelTextColour: userOpts.labelTextColour ||  lightText,
                    arrowHeadHeight: userOpts.arrowHeadHeight || 20,
                    arrowHeadColor: userOpts.arrowHeadColor || arrowColour,
                    arrowHeadOpacity: userOpts.arrowHeadOpacity || 1.0,
                    connectorStrokeWidth: userOpts.connectorStrokeWidth || 1.5,
                    connectorStrokeColour: userOpts.connectorStrokeColour || arrowColour,
                    tipStrokeColour: userOpts.tipStrokeColour || shapeStrokeColour,
                    tipStrokeWidth: userOpts.tipStrokeWidth || 0.1,
                    tipFill: userOpts.tipFill || '#fff',
                    tipFontSize: userOpts.tipFontSize || defaultFontSize,
                    tipMarginTop: userOpts.tipMarginTop || 10,
                    tipMarginLeft: userOpts.tipMarginLeft || 10
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
                        'stroke-width':  config.connectorStrokeWidth,
                        'stroke': config.connectorStrokeColour
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
                fill: config.labelTextColour,
                'text-anchor': 'middle',
                'font-size' : config.labelFontSize
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
            var tip, tg, tiptxt, group = chartGroup.group()
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

                tip = group.text(options.tip.title)
                    .fill(config.finishLinkColour)
                    .font({size: config.finishFontSize})
                    .attr('cursor', 'pointer');

                tip.move(config.finishLeftMargin, rect.height() - 25);

                tip.on('mouseover', function () {
                    tg = group.group();
                    tiptxt = group.text(function (add) {
                        options.tip.text.forEach(function (l) {
                            add.tspan(l).newLine();
                        });
                    })
                        .font({size: config.tipFontSize}).move(config.tipMarginLeft, config.tipMarginTop);

                    var rct = tg.rect(config.shapeWidth - (config.finishLeftMargin), tiptxt.bbox().height + (config.tipMarginTop * 2))
                        .attr({
                            fill: config.tipFill,
                            stroke: config.tipStrokeColour,
                            "class": "fc-tip"
                        });

                    tg.add(tiptxt);
                    tg.x(config.finishLeftMargin / 2);
                    tg.y(this.getAttribute('y') - rct.height());
                })
                    .on('mouseout', function () {
                        tg.remove();
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
                        firstShape.attr('visibility', 'visible');

                    } else {

                        firstShape.animate().opacity(config.minOpacity);
                        firstShape.attr('visibility', 'hidden');
                        shapes[0].show = false;

                        for (k = 0; k < clicked.length; k += 1) {
                            shapes[lookup[clicked[k]]].svgid.animate().opacity(config.minOpacity);
                            shapes[lookup[clicked[k]]].show = false;
                            shapes[lookup[clicked[k]]].attr('visibility', 'hidden');
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
            var staticBtn, lastActiveColor, lastStaticColor,
                btnGroup = draw.group()
                .attr({
                    "cursor": "pointer"
                }),

                btnBarWidth = (config.startWidth - 5) / 2,
                activeBtn = btnGroup
                .rect(btnBarWidth, config.btnBarHeight)
                .fill(config.startFill)
                .radius(config.btnBarRadius);

            btnGroup.text('Interactive').attr(
                {'fill' : config.startTextColour,
                    'font-size': config.btnBarFontSize,
                    'pointer-events': 'none'
                    }
            )
                .cy(config.btnBarHeight / 2)
                .cx(btnBarWidth / 2);

            staticBtn = btnGroup
                .rect(btnBarWidth, config.btnBarHeight)
                .fill(config.startFill)
                .radius(config.btnBarRadius).move(btnBarWidth + 5, 0);

            btnGroup.text('Static').attr(
                {
                    'fill' : config.startTextColour,
                    'font-size':  config.btnBarFontSize,
                    'pointer-events': 'none'
                }
            )
                .cy(config.btnBarHeight / 2)
                .cx((btnBarWidth * 1.5) + 5);

            if (interactive === true) {
                activeBtn.fill(config.btnBarSelectedColour);
            }

            if (interactive === false) {
                staticBtn.fill(config.btnBarSelectedColour);
            }

            lastActiveColor = activeBtn.attr('fill');
            lastStaticColor = staticBtn.attr('fill');

            activeBtn.on('mouseover', function () {
                activeBtn.fill({color: config.btnBarHoverColour});
            })
                .on('mouseout', function () {
                    activeBtn.fill({color: lastActiveColor});
                })
                .on('click', function () {
                    interactive = true;
                    activeBtn.fill(config.btnBarSelectedColour);
                    staticBtn.fill(config.startFill);
                    hide();
                })
                 .on('mousedown', function () {
                    activeBtn.fill(config.btnBarSelectedColour);
                });

            staticBtn.on('mouseover', function () {
                staticBtn.fill({color: config.btnBarHoverColour});
            })
                .on('mouseout', function () {
                    staticBtn.fill({color: lastStaticColor});
                })
                .on('click', function () {
                    interactive = false;
                    staticBtn.fill(config.btnBarSelectedColour);
                    activeBtn.fill(config.startFill);
                    unhide();
                })
                  .on('mousedown', function () {
                    staticBtn.fill(config.btnBarSelectedColour);
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
                    shape.attr('visibility', 'hidden');
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

        function hideShapes(index) {
            var j, sp;
            for (j = index; j < clicked.length; j += 1) {
                sp = shapes[lookup[clicked[j]]];
                sp.show = false;
                sp.svgid.animate().opacity(config.minOpacity);
                sp.svgid.attr('visibility', 'hidden');
            }
            clicked.splice(index, clicked.length);
        }

        toggleNext = function (e, choice) {
            var nextlabel, clckindex, scrollid, h, rootId, root, rec, recBox, point, ctm, elementY;

            if (choice === 'yes') {
                /* This toggles the visibility if this is the second click
                    on the button, i.e. it was already visible */
                if (shapes[lookup[e.yes]].show === true && shapes[lookup[e.no]].show === false) {
                    clckindex = clicked.indexOf(e.yes);
                    hideShapes(clckindex);
                    scrollid = e.id;
                    return;
                }

                clckindex = clicked.indexOf(e.no);
                 // if clckindex is more than -1 this element was clicked before
                if (clckindex > -1) {
                    hideShapes(clckindex);
                }
                if (clicked.indexOf(e.yes) === -1) {
                    clicked.push(e.yes);
                }

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
                scrollid = e.yesid;
                e.svgyesid.attr('visibility', 'visible');
                shapes[lookup[e.yes]].show = true;
                shapes[lookup[e.no]].svgid.animate().opacity(config.minOpacity);
                shapes[lookup[e.no]].svgid.attr('visibility', 'hidden');
                shapes[lookup[e.no]].show = false;

                if (shapes[lookup[e.yes]].next !== undefined) {
                    nextlabel = shapes[lookup[e.yes]].next;
                    clicked.push(nextlabel);
                    shapes[lookup[nextlabel]].svgid.animate().opacity(config.maxOpacity);
                    shapes[lookup[nextlabel]].svgid.attr('visibility', 'visible');
                    shapes[lookup[nextlabel]].show = true;
                    scrollid =  shapes[lookup[nextlabel]].id;
                }
            }

            if (choice === 'no') {
                if (shapes[lookup[e.no]].show === true) {
                    clckindex = clicked.indexOf(e.no);
                    hideShapes(clckindex);
                    scrollid = e.id;
                    return;
                }

                clckindex = clicked.indexOf(e.yes);
              // if clckindex is more than -1 this element was clicked before
                if (clckindex > -1) {
                    hideShapes(clckindex);
                }

                if (clicked.indexOf(e.no) === -1) {
                    clicked.push(e.no);
                }

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
                scrollid = e.noid;
                e.svgnoid.attr('visibility', 'visible');
                shapes[lookup[e.no]].show = true;

                if (shapes[lookup[e.no]].next !== undefined) {
                    nextlabel = shapes[lookup[e.no]].next;
                    clicked.push(nextlabel);
                    shapes[lookup[nextlabel]].show = true;
                    shapes[lookup[nextlabel]].svgid.animate().opacity(config.maxOpacity);
                    shapes[lookup[nextlabel]].svgid.attr('visibility', 'visible');
                    scrollid =  shapes[lookup[nextlabel]].id;
                }
            }

            // scroll to functionality
            if (scrollto === true) {
                h = window.innerHeight;
                rootId = draw.attr('id');
                root = document.getElementById(rootId);
                rec = document.getElementById(scrollid);
                recBox = SVG.get(scrollid).bbox();
                point = root.createSVGPoint();
                ctm = rec.getCTM();
                elementY = point.matrixTransform(ctm).y + recBox.height + root.parentNode.offsetTop + 20;

                if (elementY > h) {
                    if (window.jQuery && window.jQuery.scrollTo) {
                        jQuery.scrollTo(elementY - h, 1000);
                    } else {
                        window.scrollTo(0,  elementY - h);
                    }
                }
            }
        };

        function staticNodePoints(element) {
            var ce = element.svgid, te, targetShape,
                group = chartGroup.group();

            if (element.yes && element.yesid !== undefined) {
                te = element.svgyesid;
                targetShape = shapes[lookup[element.yes]];

                if (targetShape.inNode === 't') {
                    targetShape.inNodePos = [te.cx(), te.y()];
                }

                if (element.orient.yes === 'b') {
                    element.yesOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x() - config.arrowHeadHeight, te.cy()];
                    }
                }

                if (element.orient.yes === 'r') {
                    element.yesOutPos = [ce.x() + ce.get(0).width(), ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
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
                    targetShape.inNodePos = [te.cx(), te.y()];
                }

                if (element.orient.no === 'r') {
                    element.noOutPos = [ce.cx() + ce.get(0).cx(), ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                    if (targetShape.inNode === 't') {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                }
                isPositioned.push(element.noid);
            }

            if (element.next) {
                targetShape = shapes[lookup[element.next]];
                if (element.orient.next === 'b') {
                    element.nextOutPos = [ce.cx(), ce.cy() + ce.get(0).cy()];

                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                    if (targetShape.inNode === 't') {
                        te = element.svgnextid;
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        te = element.svgnoid;
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                }
                if (element.orient.next === 'r') {
                    element.nextOutPos = [ce.x() + ce.get(0).width(), ce.y() + ce.get(0).cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';
                    te = element.svgnextid;

                    if (targetShape.inNode === 't') {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                }
                isPositioned.push(element.nextid);
            }
            group.back();
            element.conngroup = group;
        }

        function nodePoints(element) {
            var ce = element.svgshape, te, targetShape;

            if (element.yes && element.yesid !== undefined) {
                te = shapes[lookup[element.yes]].svgshape;
                targetShape = shapes[lookup[element.yes]];

                if (targetShape.inNode === 't') {
                    targetShape.inNodePos = [te.cx(), te.y()];
                }

                if (element.orient.yes === 'b') {
                    element.yesOutPos = [ce.cx(), ce.y() + ce.bbox().height];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x() - config.arrowHeadHeight, te.cy()];
                    }
                }

                if (element.orient.yes === 'r') {
                    element.yesOutPos = [ce.x() + ce.width(), ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
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
                    targetShape.inNodePos = [te.cx(), te.y()];
                }

                if (element.orient.no === 'r') {
                    element.noOutPos = [ce.x() + ce.bbox().width, ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                    if (targetShape.inNode === 't') {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                }
                isPositioned.push(element.noid);
            }

            if (element.next) {
                targetShape = shapes[lookup[element.next]];
                if (element.orient.next === 'b') {
                    element.nextOutPos = [ce.cx(), ce.bbox().height + ce.y()];

                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                    if (targetShape.inNode === 't') {
                        te = shapes[lookup[element.next]].svgshape;
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        te = element.svgnoid;
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                }
                if (element.orient.next === 'r') {
                    element.nextOutPos = [ce.x() + ce.bbox().width, ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';
                    te = shapes[lookup[element.next]].svgshape;

                    if (targetShape.inNode === 't') {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
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
                label.on('click', function () {
                    toggleNext(element, 'yes');
                });
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
                label.on('click', function () {
                    toggleNext(element, 'no');
                });

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

            var e = element.svgshape, p1, p2, p3, p4, p5, spacer = config.arrowHeadHeight * 2, endPos;

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
                endPos = [end[0],  end[1] - config.arrowHeadHeight];
                return [p1, p2, p3, endPos ];
            }

            // see if out is on the right and in is at the top
            if ((start[0] < end[0]) && (start[1] > end[1])) {
                p1 = start;
                p2 = [start[0] + spacer, start[1]];
                p3 = [start[0] + spacer, end[1] - spacer];
                p4 = [end[0], end[1] - spacer];
                endPos = [end[0],  end[1] - config.arrowHeadHeight];
                return [p1, p2, p3, p4, endPos];
            }

            // see if it finishes on the left and below
            if ((start[0] > end[0]) && (start[1] < end[1])) {
                p1 = start;
                p2 = [start[0] + spacer, start[1]];
                p3 = [start[0] + spacer, end[1] - (config.shapeHeight / 2) - spacer];
                p4 = [end[0] - spacer, end[1] - (config.shapeHeight / 2) - spacer];
                p5 = [end[0] - spacer, end[1]];
                endPos = [end[0],  end[1] - config.arrowHeadHeight];
                return [p1, p2, p3, p4, p5, endPos];
            }

            // see if it finishes on the right and below
            if ((start[0] < end[0]) && (start[1] < end[1])) {
                p1 = start;
                p2 = [start[0], start[1] + spacer];
                p3 = [end[0], start[1] + spacer];
                endPos = [end[0],  end[1] - config.arrowHeadHeight];
                return [p1, p2, p3, endPos];

            }

            if (start[1] < end[1]) {
                endPos = [end[0],  end[1] - config.arrowHeadHeight];
            } else if (start[0] < end[0]) {
                endPos = [end[0]  - config.arrowHeadHeight,  end[1]];
            }
            return [start, endPos];
        }

        function addConnectors(element) {
            var startln, endln;

            if (element.yesid) {
                startln = element.yesOutPos;

                if (element.orient.yes === 'b') {
                    endln = [startln[0], startln[1] + config.connectorLength ];
                }

                if (element.orient.yes === 'r') {
                    endln = [startln[0] + config.connectorLength, startln[1]];
                }
                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width: config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }

            if (element.noid) {
                startln = element.noOutPos;

                if (element.orient.no === 'b') {
                    endln = [startln[0], startln[1] + config.connectorLength ];
                }

                if (element.orient.no === 'r') {
                    endln = [startln[0] + config.connectorLength, startln[1] ];
                }
                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width:  config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }

            if (element.nextid) {
                startln = element.nextOutPos;

                if (element.orient.next === 'b') {
                    endln = [startln[0], startln[1] + config.connectorLength ];
                }

                if (element.orient.next === 'r') {
                    endln = [startln[0] + config.connectorLength, startln[1] ];
                }

                if (endln === undefined) {
                    endln = shapes[lookup[element.next]].yesOutPos;
                }
                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width:  config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }
        }

        function staticAddConnectors(element) {
            var startln, endln;

            if (element.yesid) {
                startln = element.yesOutPos;
                endln = shapes[lookup[element.yes]].inNodePos;
                element.conngroup.polyline(angleLine(startln, endln, element)).stroke({ width:  config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }

            if (element.noid) {
                startln = element.noOutPos;
                endln = shapes[lookup[element.no]].inNodePos;
                element.conngroup.polyline(angleLine(startln, endln, element)).stroke({ width:  config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }

            if (element.nextid) {
                startln = element.nextOutPos;
                endln = shapes[lookup[element.next]].inNodePos;

                if (endln === undefined) {
                    endln = shapes[lookup[element.next]].yesOutPos;
                }
                element.conngroup.polyline(angleLine(startln, endln, element)).stroke({ width:  config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }
        }

        layoutShapes = function (s) {
            shapes = s;
            var btnBar;
            config = init();
            if (showButtons === true) {
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
            draw: setRoot,
            shapes: layoutShapes
        };
    }());