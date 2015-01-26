/*global SVG, jQuery, $,  console*/
var SVGFlow = (function () {
        "use strict";
        var draw, lowerConnector, shapeFuncs, lookup, intY, intX, i, config, userOpts = {}, arrowSet, shapes, interactive = true;

        function setParams(u) {
            userOpts = u;
            interactive = userOpts.interactive !== undefined ? userOpts.interactive : true;
            console.log(interactive);
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
                    shapeWidth: userOpts.shapeWidth || userOpts.w || w,
                    shapeHeight: userOpts.shapeHeight || userOpts.h || h,
                    baseUnit: userOpts.baseUnit || 80,
                    gridCol: userOpts.gridCol || 80,
                    rowHeight: userOpts.rowHeight || 20,
                    leftMargin: userOpts.leftMargin || 10,
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
                };
            return defaults;
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

            //labelGroup.add(label);

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
            //labelGroup.add(text);
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
            arrowGroup.attr({"cursor": "pointer", "class" : "fc-arrow"});
            arrowSet.add(arrowGroup);
            return arrowGroup;
        }

        function decision(options) {
            var shape, text, shapeBbox, arrowYes, arrowNo,
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
            //group.add(shape);
            shape.clone();

            text = group.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine().attr('text-anchor', 'middle');
                });
            });
            text.fill(config.decisionTextColour).font({size: config.decisionFontSize});
            //group.add(text);
            text.clipWith(shape);

            text.cx(shape.cx() + text.bbox().width + text.bbox().x);
            text.cy(shape.cy());
            shapeBbox = shape.bbox();

            if (options.yes) {
                arrowYes = arrowConnector(options, 'Yes');
                group.add(arrowYes);
                if (options.orient.yes === 'r') {
                    arrowYes.cy(config.decisionHeight / 2);
                    arrowYes.x(shapeBbox.width + (config.connectorLength / 2));
                }
                if (options.orient.yes === 'b') {
                    arrowYes.x(shapeBbox.width / 2);
                    arrowYes.y(shapeBbox.height);
                }
            }

            if (options.no) {
                arrowNo = arrowConnector(options, 'No');
                group.add(arrowNo);
                arrowNo.cy(config.decisionHeight / 2);
                arrowNo.x(shapeBbox.width + (config.connectorLength / 2));
                if (options.orient.no === 'r') {
                    if (options.noline) {
                        arrowNo.get(0).attr('y2', options.noline);
                        arrowNo.get(1).y(options.noline - config.arrowHeadHeight);
                    }
                }
                if (options.orient.no === 'b') {
                    arrowNo.x(shapeBbox.width / 2);
                    arrowNo.y(shapeBbox.height);
                }
            }
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
            //group.add(rect);
            group.add(content);
            //content.add(text);
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
            var text, shapeBbox, arrowYes,
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

            //text.y(0);
            //group.add(rect);
            //rect.clone();
            //group.add(text);
            //text.clipWith(rect);

              // This is buggy but best that can be done for now
            text.cy(rect.bbox().cy);
            text.move(config.finishLeftMargin);
            text.font({size: config.processFontSize});

            // Add a bottom arrow that can be removed later
            shapeBbox = rect.bbox();
            arrowYes = arrowConnector(options, 'Yes');
            group.add(arrowYes);
            arrowYes.x(shapeBbox.width / 2);
            arrowYes.y(shapeBbox.height);
            // Remove the label
            arrowYes.get(2).remove();

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

            lowerConnector = arrowLine();
            text = group.text(function (add) { add.tspan(config.startText).newLine().attr({
                'text-anchor': 'middle',
                'font-size': config.startFontSize,
                'fill' : config.startTextColour
            }); });
            //group.add(rect);
            //group.add(text);
            shapeBox = rect.bbox();
            lowerConnector.move(shapeBox.cx, shapeBox.height);
            text.move(shapeBox.cx);
            text.cy(shapeBox.cy);
            group.add(lowerConnector);
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
            return group;
        }

        function setRoot(el) {
            draw = el;
            arrowSet = draw.set();
        }

        function unhide() {
            draw.each(function () {
                if (this.opacity() === 0) {
                    this.opacity(1);
                }
            }, true);
            interactive = false;
        }

  // This where the real work of generating and laying out shapes is done
  // add the actual id
  // capture the IDs. Like to not do this if I can figure out how
        function layoutShapes(s) {
            shapes = s;
            config = init();
            var chartGroup = draw.group(),
                startEl = start(shapes),
                itemIds = {},
                indexFromId = {};

            chartGroup.x(config.leftMargin);
            chartGroup.add(startEl);

            console.log(interactive + 'layoutShapes');

            shapes.forEach(function (element, index) {
                if (element.type && (typeof shapeFuncs[element.type] === 'function')) {
                    var shape = shapeFuncs[element.type](element);
                    chartGroup.add(shape);
                    element.id = shape.attr('id');
                    itemIds[element.label] = element.id;
                    indexFromId[element.id] = index;
                    shape.opacity(0);
                } else {
                    console.log(element.type + ' is not a valid shape.');
                    return false;
                }
            });

  // Add the ids for yes and no elements
            shapes.forEach(function (element) {
                if (element.yes) {
                    element.yesid = itemIds[element.yes];
                }
                if (element.no) {
                    element.noid = itemIds[element.no];
                }
                if (element.next) {
                    element.nextid = itemIds[element.next];
                }
            });

  // Generate a lookup that gives Array IDs from SVG ids
            lookup = {};
            for (i = 0; i < shapes.length; i += 1) {
                lookup[shapes[i].label] = i;
            }

  // Add the ids of previous (referring) elements to the array
            shapes.forEach(function (element) {
                var next;
                if (element.yes) {
                    next = lookup[element.yes];
                    if (shapes[next]) {
                        shapes[next].previd = element.id;
                    }
                }
                if (element.no) {
                    next = lookup[element.no];
                    if (shapes[next]) {
                        shapes[next].previd = element.id;
                    }
                }
                if (element.next) {
                    next = lookup[element.next];
                    if (shapes[next]) {
                        shapes[next].previd = element.id;
                    }
                }

            });

            // Layout the shapes
            shapes.forEach(function (element, index) {
                var ce = SVG.get(element.id), te, cHeight, tHeight, diff;
                if (index === 0) {
                    SVG.get(element.id).y(startEl.bbox().height);
                }

                // Check if orient is set. If not, set to defaults
                if (!element.orient) {
                    element.orient = {yes: 'b', no: 'r'};
                }

                if (element.yes && element.yesid !== undefined && element.orient.yes === 'b') {
                    SVG.get(element.yesid).move(ce.x(), ce.y() + ce.bbox().height);
                }

                if (element.no && element.noid !== undefined && element.orient.no === 'b') {
                    SVG.get(element.noid).move(ce.x(), ce.y() + ce.bbox().height);
                }

                if (element.yes && element.yesid !== undefined && element.orient.yes === 'r') {
                    te = SVG.get(element.yesid);
                    cHeight = ce.first().height();
                    tHeight = te.first().height();
                    diff = (cHeight / 2) - (tHeight / 2);
                    te.move(ce.x() + ce.bbox().width, ce.y() + diff);
                }

                if (element.no && element.noid !== undefined && element.orient.no === 'r') {
                    te = SVG.get(element.noid);
                    cHeight = ce.first().height();
                    tHeight = te.first().height();
                    diff = (cHeight / 2) - (tHeight / 2);
                    te.move(ce.x() + ce.bbox().width, ce.y() + diff);
                }

                if (element.next) {
                    // Make sure it's not already laid out
                    // Assume it's at the bottom for now
                    if (element.nextid !== element.previd) {
                        SVG.get(element.nextid).move(ce.x(), ce.y() + ce.bbox().height);
                    }
                }

            });

  // Process shapes have a next line which needs adding after
  // because the line is outside the groups
            shapes.forEach(function (element) {
                if (element.next) {
                    var el = SVG.get(element.id),
                        target = SVG.get(element.previd),
                        coords = [],
                        startX,
                        startY,
                        endX,
                        endY,
                        startPoint,
                        endPoint;

                       // It's a loop back to the yes option of the referring element
                    if (target !== undefined && element.nextid === element.previd) {
                            // Remove the arrow
                        el.get(2).remove();
                        startX = el.rbox().x + (el.rbox().width / 2);
                        startY = el.y() + el.rbox().height;

                        endX = target.get(2).rbox().x + target.get(2).rbox().width + config.arrowHeadHeight;
                        endY = target.get(2).rbox().y + ((config.connectorLength - config.arrowHeadHeight) / 2);
                        startPoint = [startX, startY];
                        coords.push(startPoint);
                        if (endY > startY) {
                            intY = startY + (endY - startY);
                            intX = startX;
                            coords.push([intX, intY]);
                        }

                        endPoint = [endX, endY];
                        coords.push(endPoint);
                        /*

                        draw.polyline(coords).fill('none').attr({
                            width: config.arrowStroke,
                            stroke: config.arrowLineColour
                        });
                        ah = arrowHead();

                        ah.x(endX - config.arrowHeadHeight);
                        ah.y(endY - (config.arrowHeadHeight / 2));
                        ah.rotate(90);
                        */
                    } // end loop back
                }
            });

            // The show/hide function
            arrowSet.each(function () {
                this.click(function () {
                    var txt = this.get(2).get(1).content,
                        parentId = this.parent.attr('id'),
                        parentIndex = indexFromId[parentId],
                        parentOptions = shapes[parentIndex],
                        el,
                        tid;

                    if (txt === 'Yes') {
                        tid = '#' + parentOptions.previd;
                        $.scrollTo(tid, 1500);
                        el = SVG.get(parentOptions.yesid);
                        if (el.opacity() === 0) {
                            el.animate().opacity(1)
                                .after(function () {
                                    SVG.get(parentOptions.noid).animate().opacity(0)
                                        .after(function () {
                                            shapes.forEach(function (element) {
                                                if (SVG.get(element.id).opacity() === 0) {
                                                    if (element.yesid) {
                                                        SVG.get(element.yesid).animate(500).opacity(0);
                                                    }
                                                    if (element.noid) {
                                                        SVG.get(element.noid).animate(500).opacity(0);
                                                    }
                                                    if (element.nextid) {
                                                        console.log('tba');
                                                    }
                                                }
                                            });
                                        });
                                });
                        } else {
                            el.animate().opacity(0)
                                .after(
                                    function () {
                                        shapes.forEach(function (element) {
                                            if (SVG.get(element.id).opacity() === 0) {
                                                if (element.yesid) {
                                                    SVG.get(element.yesid).animate(500).opacity(0);
                                                }
                                                if (element.noid) {
                                                    SVG.get(element.noid).animate(500).opacity(0);
                                                }
                                                if (element.nextid) {
                                                    console.log('tba');
                                                }
                                            }
                                        });
                                    }
                                );
                        }
                    }

                    if (txt === 'No') {
                        el = SVG.get(parentOptions.noid);
                        if (el.opacity() === 0) {
                            el.animate().opacity(1)
                                .after(function () {
                                    SVG.get(parentOptions.yesid).animate().opacity(0)
                                        .after(function () {
                                            shapes.forEach(function (element) {
                                                if (SVG.get(element.id).opacity() === 0) {
                                                    if (element.yesid) {
                                                        SVG.get(element.yesid).animate(500).opacity(0);
                                                    }
                                                    if (element.noid) {
                                                        SVG.get(element.noid).animate(500).opacity(0);
                                                    }
                                                    if (element.nextid) {
                                                        console.log('tba');
                                                    }
                                                }
                                            });
                                        });
                                });
                        } else {
                            el.animate().opacity(0)
                                .after(
                                    function () {
                                        shapes.forEach(function (element) {
                                            if (SVG.get(element.id).opacity() === 0) {
                                                if (element.yesid) {
                                                    SVG.get(element.yesid).animate(500).opacity(0);
                                                }
                                                if (element.noid) {
                                                    SVG.get(element.noid).animate(500).opacity(0);
                                                }
                                                if (element.nextid) {
                                                    console.log('tba');
                                                }
                                            }
                                        });
                                    }
                                );
                        }
                    }
                });
            });
            if (interactive === false) {
                unhide();
            }
        }

        function hide() {
            draw.clear();
            setRoot(draw);
            interactive = true;
            layoutShapes(shapes);
        }

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
