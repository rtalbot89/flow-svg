/*global SVG, jQuery, $,  console*/
var SVGFlow = (function () {
        "use strict";
        var draw, lowerConnector, shapeFuncs, lookup, i, config, userOpts = {}, arrowSet, shapes, interactive = true, chartGroup, layoutShapes, itemIds = {}, indexFromId = {}, startEl, startId;

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
        }

        var isPositioned = [];
        function positionShapes(element, index) {
            //console.log(index);
            var ce = SVG.get(element.id), te, cHeight, tHeight, diff, rightMargin;
            // Check if orient is set. If not, set to defaults
            
            if (!element.orient) {
                element.orient = {yes: 'b', no: 'r', next: 'b'};
            }
            
            if (!element.yesIn) {
              element.yesIn = 't';
            }
            
            if (!element.noIn) {
              element.noIn = 'l';
            }
            if (index === 0) {
                SVG.get(element.id).y(startEl.bbox().height + startEl.bbox().y);
                element.previd = startId;
            }

            rightMargin = element.extendNo !== undefined ? element.extendNo : config.connectorLength;

            if (element.yes && element.yesid !== undefined && element.orient.yes === 'b') {
              SVG.get(element.yesid).move(ce.x(), ce.y() + ce.bbox().height + config.connectorLength);
              element.yesOut = [ce.cx() + ce.x(), ce.y() + ce.get(0).height()];
              
              if (isPositioned.indexOf(element.yesid) === -1) {
                if (element.yesid.yesIn === 't') {
                  te = SVG.get(element.yesid);
                  element.yesid.yesIn = [te.x() + te.cx(), te.y()];
                }
                if (element.yesid.yesIn === 'l') {
                  te = SVG.get(element.yesid);
                  element.yesid.yesIn = [te.x(), te.y() + te.cy()];
                }
                isPositioned.push(element.yesid);
              }
            }

            if (element.no && element.noid !== undefined && element.orient.no === 'b') {
                SVG.get(element.noid).move(ce.x(), ce.y() + ce.bbox().height + config.connectorLength);
                element.noOut = [ce.cx() + ce.x(), ce.y() + ce.get(0).height()];
                
                if (isPositioned.indexOf(element.noid) === -1) {
                  if (element.noid.noIn === 't') {
                    te = SVG.get(element.noid);
                    element.noid.noIn = [te.x() + te.cx(), te.y()];
                  }
                  if (element.noid.noIn === 'l') {
                    te = SVG.get(element.noid);
                    element.noid.noIn = [te.x(), te.y() + te.cy()];
                  }
                   isPositioned.push(element.yesid);
                }
            }

            if (element.yes && element.yesid !== undefined && element.orient.yes === 'r') {
                te = SVG.get(element.yesid);
                cHeight = ce.first().height();
                tHeight = te.first().height();
                diff = (cHeight / 2) - (tHeight / 2);
                te.move(ce.x() + ce.bbox().width + rightMargin, ce.y() + diff);
                element.yesOut = [ce.x() + ce.get(0).width(), ce.y() + ce.cy()];
                
                if (isPositioned.indexOf(element.yesid) === -1) {
                  
                  if (element.yesid.yesIn === 't') {
                    te = SVG.get(element.yesid);
                    element.yesid.yesIn = [te.x() + te.cx(), te.y()];
                  }
                  if (element.yesid.yesIn === 'l') {
                    te = SVG.get(element.yesid);
                    element.yesid.yesIn = [te.x(), te.y() + te.cy()];
                  }
                  isPositioned.push(element.yesid);
                }
            }

            if (element.no && element.noid !== undefined && element.orient.no === 'r') {
                te = SVG.get(element.noid);
                cHeight = ce.first().height();
                tHeight = te.first().height();
                diff = (cHeight / 2) - (tHeight / 2);
                te.move(ce.x() + ce.bbox().width + rightMargin, ce.y() + diff);
                element.noOut = [ce.x() + ce.get(0).width(), ce.y() + ce.cy()];
                
              if (isPositioned.indexOf(element.noid) === -1) {
                if (element.noid.noIn === 't') {
                  te = SVG.get(element.noid);
                  element.noid.noIn = [te.x() + te.cx(), te.y()];
                }
                if (element.noid.noIn === 'l') {
                  te = SVG.get(element.noid);
                  element.noid.noIn = [te.x(), te.y() + te.cy()];
                }
                isPositioned.push(element.noid);
              }
            }

            if (element.next && element.orient.next === 'b' && element.nextid !== element.previd) {
                SVG.get(element.nextid).move(ce.x(), ce.y() + ce.bbox().height + rightMargin);
            }

            if (element.next && element.orient.next === 'r'  && element.nextid !== element.previd) {
                SVG.get(element.nextid).move(ce.x() + ce.get(0).width() + rightMargin, ce.y());
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

        // If there are indirect connections between any shapes look for them here
        function adjustConnectors(element) {
            var currentElement = SVG.get(element.id),
                currentY = currentElement.x(),
                targetElement,
                ah,
                lbl,
                currentRightMid,
                p1,
                p2,
                p3,
                p4,
                p5,
                yLevel;

            if (element.yesid && element.orient.yes === 'b') {
                targetElement = SVG.get(element.yesid);
                var currentBottomMid = [currentElement.get(0).cx() + currentElement.x(), (currentElement.y() + currentElement.get(0).height())];
                
                //p1 = currentBottomMid;
                p1 = element.yesOut;
                p2 = [currentElement.get(0).cx() + currentElement.x(), targetElement.y() - (config.arrowHeadHeight + 10)];
                p3 = [targetElement.get(0).cx() + targetElement.x(), targetElement.y() - (config.arrowHeadHeight + 10)];
                p4 = [targetElement.get(0).cx() + targetElement.x(), targetElement.y()];
                //p4 = targetElement.yesIn;
                draw.polyline(
                    [
                      p1, 
                      //p2, 
                      //p3, 
                      p4
                    ]
                ).stroke({ width: 1 }).fill('none');
                ah = arrowHead();
                ah.move(targetElement.cx() - (config.arrowHeadHeight / 2),  targetElement.y() - config.arrowHeadHeight);

                lbl = lineLabel('Yes');
                lbl.move(currentElement.cx(),  currentElement.get(0).height() + currentElement.y());
                
                
            }

            if (element.noid && element.orient.no === 'b') {
                targetElement = SVG.get(element.noid);
                
                var currentBottomMid = [currentElement.get(0).cx() + currentElement.x(), (currentElement.y() + currentElement.get(0).height())];
                
                p1 = currentBottomMid;
                p2 = [currentElement.get(0).cx() + currentElement.x(), targetElement.y() - (config.arrowHeadHeight + 10)];
                p3 = [targetElement.get(0).cx() + targetElement.x(), targetElement.y() - (config.arrowHeadHeight + 10)];
                p4 = [targetElement.get(0).cx() + targetElement.x(), targetElement.y()];
                
                draw.polyline(
                    [
                        p1, p2, p3, p4
                    ]
                ).stroke({ width: 1 }).fill('none');
                ah = arrowHead();
                ah.move(targetElement.cx() - (config.arrowHeadHeight / 2),  targetElement.y() - config.arrowHeadHeight);

                lbl = lineLabel('No');
                lbl.move(currentElement.cx(),  currentElement.get(0).height() + currentElement.y());
            }

            if (element.yesid && element.orient.yes === 'r') {
                targetElement = SVG.get(element.yesid);
                currentRightMid =  [(currentElement.get(0).width() + currentElement.x()), (currentElement.y() + (currentElement.get(0).height() / 2))];

                p1 = currentRightMid;

               // if (currentY < targetElement.y()) {
                    p2 = [currentElement.get(0).width() + currentElement.x() + 10, (currentElement.y() + (currentElement.get(0).height() / 2))];
                    p3 = [currentElement.get(0).width() + currentElement.x() + 10, targetElement.y() -  (config.arrowHeadHeight + 10)];
                    p4 = [targetElement.x() + (targetElement.get(0).width() / 2), targetElement.y() + targetElement.get(0).cy()];
                    //p5 = [targetElement.x() + (targetElement.get(0).width() / 2), targetElement.y()];
               // }

                draw.polyline(
                    [
                        p1, p2, p3, p4
                    ]
                ).stroke({ width: 1 }).fill('none');
            }

            if (element.noid && element.orient.no === 'r') {
                targetElement = SVG.get(element.noid);
                currentRightMid =  [(currentElement.get(0).width() + currentElement.x()), (currentElement.y() + (currentElement.get(0).height() / 2))];

                p1 = currentRightMid;
                p2 = [currentElement.get(0).width() + currentElement.x() + 10, (currentElement.y() + (currentElement.get(0).height() / 2))];
                p3 = [currentElement.get(0).width() + currentElement.x() + 10, targetElement.y()  + targetElement.get(0).cy()];
                p4 = [targetElement.x(), targetElement.y() + targetElement.get(0).cy()];
                draw.polyline(
                    [
                      p1, 
                      p2, 
                      p3, 
                      p4
                    ]
                ).stroke({ width: 1 }).fill('none');
                /*
                draw.line(
                    currentElement.get(0).width() + currentElement.x(),
                    currentElement.y() + (currentElement.get(0).height() / 2),
                    targetElement.x(),
                    targetElement.y() + (targetElement.get(0).height() / 2)
                ).stroke({ width: 1 });
                */
                /*
                ah = arrowHead();
              
                ah.move(targetElement.x() - config.arrowHeadHeight, targetElement.y() + (targetElement.get(0).height() / 2) - config.arrowHeadHeight / 2);
                ah.rotate(270);
                lbl = lineLabel('No');
                lbl.move(currentElement.x() + currentElement.get(0).width() + 20, currentElement.y() + (currentElement.get(0).height() / 2) - 20);
                */
            }

            if (element.nextid && element.orient.next === 'b') {
                targetElement = SVG.get(element.nextid);

                if (currentElement.y() < targetElement.y()) {
                    yLevel = targetElement.y();
                }
                if (currentElement.y() >= targetElement.y()) {
                    yLevel = targetElement.y() + targetElement.get(0).height() + config.arrowHeadHeight + 10;
                }

                p1 = [(currentElement.get(0).width() / 2) + currentElement.x(), currentElement.y() + currentElement.get(0).height()];
                p2 =  [(currentElement.get(0).width() / 2) + currentElement.x(), currentElement.y() + currentElement.get(0).height() + config.arrowHeadHeight + 10];
                p3 = [(targetElement.get(0).width() / 2 + targetElement.x()), yLevel];
                draw.polyline([p1, p2, p3]).stroke({ width: 1 }).fill('none');
            }

            if (element.nextid && element.orient.next === 'r') {
                targetElement = SVG.get(element.nextid);

                draw.line(
                    currentElement.get(0).width() + currentElement.x(),
                    currentElement.y() + (currentElement.get(0).height() / 2),
                    targetElement.x(),
                    targetElement.y() + (targetElement.get(0).height() / 2)
                ).stroke({ width: 1 });
            }
        }

        layoutShapes = function (s) {
            shapes = s;
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
            lookup = {};
            for (i = 0; i < shapes.length; i += 1) {
                lookup[shapes[i].label] = i;
            }

            // Add the ids of previous (referring) elements to the array
            shapes.forEach(referringIds);
            // Layout the shapes
            shapes.forEach(positionShapes);

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
