/*global SVG, jQuery, $,  console*/
var SVGFlow = (function () {
        "use strict";
        var draw, lowerConnector, shapeFuncs, lookup, intY, intX, i, config, userOpts = {}, arrowSet, shapes, interactive = true, chartGroup, layoutShapes, itemIds = {}, indexFromId = {}, startEl, startId;

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
            shapeBbox = shape.bbox();

            if (options.yes) {
                /*
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
                */
            }

            if (options.no) {
                
                /*
                arrowNo = arrowConnector(options, 'No');
                group.add(arrowNo);
                arrowNo.cy(config.decisionHeight / 2);
                arrowNo.x(shapeBbox.width + (config.connectorLength / 2));
                if (options.orient.no === 'r') {

                    if (options.noline && interactive !== true) {
                        arrowNo.get(0).attr('y2', options.noline);
                        arrowNo.get(1).y(options.noline - config.arrowHeadHeight);
                    }
                    if (options.noline && interactive === true) {
                        arrowNo.get(0).attr('y2', config.connectorLength);
                        arrowNo.get(1).y(config.connectorLength - config.arrowHeadHeight);
                    }
                }
                if (options.orient.no === 'b') {
                    arrowNo.x(shapeBbox.width / 2);
                    arrowNo.y(shapeBbox.height);
                }
                */
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

            // This is buggy but best that can be done for now
            text.cy(rect.bbox().cy);
            text.move(config.finishLeftMargin);
            text.font({size: config.processFontSize});

            // Add a bottom arrow that can be removed later
            //shapeBbox = rect.bbox();
            //arrowYes = arrowConnector(options, 'Yes');
            //group.add(arrowYes);
            //arrowYes.x(shapeBbox.width / 2);
            //arrowYes.y(shapeBbox.height);
            // Remove the label
            //arrowYes.get(2).remove();
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
        
        // Check that something has not already been positioned
        var positionLogger = [];

        function positionShapes(element, index) {
            console.log(index);
            var ce = SVG.get(element.id), te, cHeight, tHeight, diff;
            // Check if orient is set. If not, set to defaults
            if (!element.orient) {
                element.orient = {yes: 'b', no: 'r', next: 'b'};
            }
            if (index === 0) {
              //  console.log(index);
               SVG.get(element.id).y(startEl.bbox().height + startEl.bbox().y);
                element.previd = startId;
                //return false;
            }
            
            if (positionLogger.indexOf(element.id) > -1) {
                console.log('already laid out');
                return;
            }
            
            positionLogger.push(element.id);
            
            var rightMargin = element.noline !== undefined ? element.noline : config.connectorLength;

            

            if (element.yes && element.yesid !== undefined && element.orient.yes === 'b') {
                SVG.get(element.yesid).move(ce.x(), ce.y() + ce.bbox().height + config.connectorLength);
            }

            if (element.no && element.noid !== undefined && element.orient.no === 'b') {
                SVG.get(element.noid).move(ce.x() , ce.y() + ce.bbox().height + config.connectorLength);
            }

            if (element.yes && element.yesid !== undefined && element.orient.yes === 'r') {
                te = SVG.get(element.yesid);
                cHeight = ce.first().height();
                tHeight = te.first().height();
                diff = (cHeight / 2) - (tHeight / 2);
                te.move(ce.x() + ce.bbox().width + rightMargin, ce.y() + diff);
            }

            if (element.no && element.noid !== undefined && element.orient.no === 'r') {
                te = SVG.get(element.noid);
                cHeight = ce.first().height();
                tHeight = te.first().height();
                diff = (cHeight / 2) - (tHeight / 2);
                te.move(ce.x() + ce.bbox().width + rightMargin, ce.y() + diff);
            }

            if (element.next && element.orient.next === 'b' && element.nextid !== element.previd) {
                  SVG.get(element.nextid).move(ce.x(), ce.y() + ce.bbox().height + rightMargin);
            }
            
            if (element.next && element.orient.next === 'r'  && element.nextid !== element.previd) {
                  SVG.get(element.nextid).move(ce.x() + ce.get(0).width() + rightMargin, ce.y());
            }
            
            if (index === 0) {
               // SVG.get(element.id).y(startEl.bbox().height + startEl.bbox().y);
               // element.previd = startId;
            }
        }

        /* Process shapes have a next line which needs adding after
        because the line is outside the groups */
        function processConnectors(element) {
            if (element.next) {
                var el = SVG.get(element.id),
                    target = SVG.get(element.previd),
                    coords = [],
                    startX,
                    startY,
                    endX,
                    endY,
                    startPoint,
                    endPoint,
                    ah;

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

                    draw.polyline(coords).fill('none').attr({
                        width: config.arrowStroke,
                        stroke: config.arrowLineColour
                    });
                    ah = arrowHead();

                    ah.x(endX - config.arrowHeadHeight);
                    ah.y(endY - (config.arrowHeadHeight / 2));
                    ah.rotate(90);
                } // end loop back
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
 
        function adjustConnectors (element, index, array) {
            var currentElement = SVG.get(element.id);
         
            if (element.yesid && element.orient.yes === 'b') {
                var yesElement = SVG.get(element.yesid);
               
                var line = draw.line(
                    currentElement.cx(), 
                    currentElement.y() + currentElement.get(0).height(), 
                    currentElement.cx(), 
                    yesElement.y()
                ).stroke({ width: 1 });
            }
            
            if (element.noid && element.orient.no === 'b') {
                var noElement = SVG.get(element.noid);
               
                var line = draw.line(
                    currentElement.cx(), 
                    currentElement.y() + currentElement.get(0).height(), 
                    currentElement.cx(), 
                    noElement.y()
                ).stroke({ width: 1 });
            }
            
            
            if (element.yesid && element.orient.yes === 'r') {
                var yesElement = SVG.get(element.yesid);
                var line = draw.line(
                    currentElement.get(0).width() + currentElement.x(), 
                    currentElement.y() + (currentElement.get(0).height() / 2),
                    yesElement.x(), 
                    yesElement.y() + (yesElement.get(0).height() / 2)
                ).stroke({ width: 1 });
            }
               
            if (element.noid && element.orient.no === 'r') {
                var noElement = SVG.get(element.noid);
                var line = draw.line(
                    currentElement.get(0).width() + currentElement.x(), 
                    currentElement.y() + (currentElement.get(0).height() / 2),
                    noElement.x(), 
                    noElement.y() + (noElement.get(0).height() / 2)
                ).stroke({ width: 1 });
            }
            
            if (element.nextid && element.orient.next === 'b') {
                var nextElement = SVG.get(element.nextid);
                
                var yLevel;
                
                if (currentElement.y() < nextElement.y()) {
                  yLevel = nextElement.y();
                }
                if (currentElement.y() >= nextElement.y()) {
                  yLevel = nextElement.y() + nextElement.get(0).height();
                }
                
                var line = draw.line(
                    (currentElement.get(0).width() / 2) + currentElement.x(), 
                    currentElement.y() + currentElement.get(0).height(), 
                  
                    nextElement.x() + (nextElement.get(0).width() / 2), 
                  yLevel
                ).stroke({ width: 1 });
            }
            
            if (element.nextid && element.orient.next === 'r') {
                var nextElement = SVG.get(element.nextid);
                
                var line = draw.line(
                    currentElement.get(0).width() + currentElement.x(), 
                    currentElement.y() + (currentElement.get(0).height() / 2), 
                  
                  nextElement.x(), 
                    nextElement.y() + (nextElement.get(0).height() / 2)
                ).stroke({ width: 1 });
            }
           
            //console.log(element);
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

            //shapes.forEach(processConnectors);
            
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
