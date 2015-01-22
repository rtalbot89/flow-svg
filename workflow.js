/*global SVG, jQuery, console*/
//var console = console || {};
//var jQuery = jQuery || {};
//var SVG = SVG || {};

/*
function scrollTo(id) {
    "use strict";
    jQuery('#' + id).scrollintoview();
}
*/

var myRevealingModule = (function () {
    "use strict";
    var privateVar = "Ben Cherry",
        publicVar  = "Hey there!";

    function privateFunction() {
        console.log("Name:" + privateVar);
    }

    function publicSetName(strName) {
        privateVar = strName;
    }

    function publicGetName() {
        privateFunction();
    }


        // Reveal public pointers to
        // private functions and properties

    return {
        setName: publicSetName,
        greeting: publicVar,
        getName: publicGetName
    };
}());

var SVGFlow = (function () {
        "use strict";
        var draw, chartGroup, shapes, startEl, lowerConnector, shapeFuncs, itemIds, lookup, intY, intX, ah, i, config, params;

        function fConfig(cnf) {
            config = cnf;
            return config;
        }

        function init(params) {
            var defaults = {
                baseUnit: 80,
                gridCol: 80,
                rowHeight: 20,
                leftMargin: 10,
                connectorLength: 60,
                arrowHeadHeight: 20,
                startWidth: 180,
                startHeight: 40,
                startCornerRadius: 20,
                startFill: '#d6d6d6',
                startStrokeWidth: 0.1,
                startStrokeColour: 'rgb(66, 66, 66)',
                startText: 'Start',
                startFontSize: 12,
                decisionWidth: 180,
                decisionFill: '#8b3572',
                decisionTextColour: '#fff',
                decisionFontSize: 12,
                finishTextColour: '#fff',
                decisionHeight: 140,
                finishWidth: 180,
                finishHeight: 140,
                finishLeftMargin: 20,
                finishFill: '#0F6C7E',
                finishFontSize: 12,
                processWidth: 180,
                processHeight: 140,
                processLeftMargin: 20,
                processFill: '#fff',
                processStrokeColour: 'rgb(66, 66, 66)',
                processStrokeWidth: 0.1,
                processTextColour: 'black',
                processFontSize: 12,
                labelWidth: 30,
                labelHeight: 20,
                labelRadius: 5,
                labelStroke: 0.1,
                labelFill: 'grey',
                labelOpacity: 1.0,
                labelFontSize: 12,
                arrowStroke: 1.0,
                arrowHeadColor: 'rgb(51, 51, 51)',
                arrowTextColour: '#fff',
                arrowFontSize: 12,
                arrowHeadOpacity: 1.0
            },
                property;
            if (params) {
                for (property in params) {
                    if (params.hasOwnProperty(property)) {
                        defaults[property] = params[property];
                    }
                }
                return defaults;
            }
            return defaults;
        }

        function setParams(p) {
            params = p;
            config = init(params);
        }

        function arrowHead() {
            var coords =
                    "0,0 " +
                    config.arrowHeadHeight
                    + ",0 "
                    + config.arrowHeadHeight / 2
                    + "," + config.arrowHeadHeight;

            ah = draw.polygon(coords).fill({
                color: config.arrowHeadColor,
                opacity: config.arrowHeadOpacity
            });
            return ah;
        }

        function arrowLine() {
            var group = draw.group(),
                line = draw
                    .line(0, 0, 0, config.connectorLength - config.arrowHeadHeight)
                    .stroke({
                        width: config.arrowStroke
                    });
            group.add(line);
            ah = arrowHead();
            group.add(ah);
            ah.move(
                -(config.arrowHeadHeight / 2),
                config.connectorLength - config.arrowHeadHeight
            );
            return group;
        }

        function arrowConnector(options, txt) {
            var text,
                arrowGroup = arrowLine(options),
                labelGroup = draw.group(),
                label = draw
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

            labelGroup.add(label);

            label.move(
                -(config.labelWidth / 2),
                config.labelHeight / 2
            );

            text = draw.text(txt).attr({
                fill: config.arrowTextColour,
                'text-anchor': 'middle',
                'font-size' : config.arrowFontSize
            });
            text.cy(label.cy());
            labelGroup.add(text);
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

            shape = draw.polygon(coords)
                .attr({
                    fill: config.decisionFill,
                    "class": 'fc-rhombus'
                });
            group.attr('class', 'fc-decision');
            group.add(shape);
            shape.clone();

            text = draw.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine().attr('text-anchor', 'middle');
                });
            });
            text.fill(config.decisionTextColour).font({size: config.decisionFontSize});
            group.add(text);
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
            var rect, text,
                group = draw.group();
            group.attr({
                "class": "finish-group"
            });
            rect = draw
                .rect(config.finishWidth, config.finishHeight)
                .attr({
                    fill: config.finishFill,
                    "class": "fc-finish",
                }).radius(20);

            text = draw.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine();
                });
            });
            text.fill(config.finishTextColour).font({size: config.finishFontSize});
            group.add(rect);
            rect.clone();
            group.add(text);
            text.clipWith(rect);
            text.x(config.finishLeftMargin);
            text.cy(rect.bbox().cy);
            return group;
        }
  // The process shape that has an outlet, but no choice
        function process(options) {
            var text, rect, shapeBbox, arrowYes,
                group = draw.group();
            group.attr({
                "class": "process-group"
            });
            rect = draw
                .rect(config.processWidth, config.processHeight)
                .attr({
                    fill: config.processFill,
                    stroke: config.processStrokeColour,
                    "class": "fc-process"
                });
            group.add(rect);

            rect.clone();
            text = draw.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine();
                });
            });

            group.add(text);
            text.clipWith(rect);
            text.height(rect.height());
            text.cy(rect.bbox().cy);
            text.move(config.processLeftMargin);
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

        function flowStart() {
            var text, shapeBox, rect,
                group = draw.group().attr({
                    "cursor": "pointer",
                    "class": "fc-start"
                });
            rect = draw.rect(config.startWidth, config.startHeight)
                .attr({
                    fill: config.startFill,
                    'stroke-width' : config.startStrokeWidth,
                    stroke: config.startStrokeWidth
                })
                .radius(config.startCornerRadius);

            lowerConnector = arrowLine();
            text = draw.text(function (add) { add.tspan(config.startText).newLine().attr({
                'text-anchor': 'middle',
                'font-size': config.startFontSize
            }); });
            group.add(rect);
            group.add(text);
            shapeBox = rect.bbox();
            lowerConnector.move(shapeBox.cx, shapeBox.height);
            text.move(shapeBox.cx);
            text.cy(shapeBox.cy);
            group.add(lowerConnector);
            return group;
        }

        function setRoot(el) {
            draw = el;
            config = init();
            chartGroup = draw.group();
            chartGroup.x(config.leftMargin);
            startEl = flowStart();
            chartGroup.add(startEl);
        }

  // This where the real work of generating and laying out shapes is done
  // add the actual id
  // capture the IDs. Like to not do this if I can figure out how
        function layoutShapes() {
            itemIds = {};
            shapes.forEach(function (element) {
                if (element.type === undefined) {
                    console.log(element.type);
                }
                if (element.type && (typeof shapeFuncs[element.type] !== 'function')) {
                    console.log(element.type);
                }
                var shape = shapeFuncs[element.type](element);
                chartGroup.add(shape);
                element.id = shape.attr('id');
                itemIds[element.label] = element.id;
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

          // check if orient is set. Otherwise default to yes b and no r
                if (element.yes) {
                    if ((element.orient === undefined && element.yesid !== undefined) || (element.orient !== undefined && element.orient.yes !== undefined && element.orient.yes === 'b')) {
                        SVG.get(element.yesid).move(ce.x(), ce.y() + ce.bbox().height);
                    }
                }

                if (element.no) {
                    if (element.orient !== undefined && element.noid !== undefined && element.orient.no !== undefined && element.orient.no === 'b') {
                        SVG.get(element.noid).move(ce.x(), ce.y() + ce.bbox().height);
                    }
                }

                if (element.yes) {
                    if (element.orient !== undefined && element.yesid !== undefined && element.orient.yes !== undefined && element.orient.yes === 'r') {
                        te = SVG.get(element.yesid);
                        cHeight = ce.first().height();
                        tHeight = te.first().height();
                        diff = (cHeight / 2) - (tHeight / 2);
                        te.move(ce.x() + ce.bbox().width, ce.y() + diff);
                    }
                }

                if (element.no) {
                    if ((element.orient === undefined && element.noid !== undefined) || (element.orient !== undefined && element.noid !== undefined && element.orient.no !== undefined && element.orient.no === 'r')) {
                        te = SVG.get(element.noid);
                        cHeight = ce.first().height();
                        tHeight = te.first().height();
                        diff = (cHeight / 2) - (tHeight / 2);
                        te.move(ce.x() + ce.bbox().width, ce.y() + diff);
                    }
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

                        draw.polyline(coords).fill('none').stroke({
                            width: 1
                        });
                        ah = arrowHead();

                        ah.x(endX - config.arrowHeadHeight);
                        ah.y(endY - (config.arrowHeadHeight / 2));
                        ah.rotate(90);
                    } // end loop back
                }
            });
        }

        function setShapes(s) {
            shapes = s;
            layoutShapes();
        }

        function unhide(draw) {
            draw.each(function () {
                if (this.opacity(0)) {
                    this.opacity(1);
                }
            });
        }
        /*
        function showHide(element, next, finishSet) {
            var id;
            if (element.visible === false) {
                if (element.stepType === "decision") {
                    element.visible = true;
                }

                if ((element.stepType !== undefined) && (element.stepType === "finish")) {
                    for (i = 0; i < finishSet.length; i += 1) {
                        if (finishSet[i].visible === true) {
                          //finishSet[i].group.animate().opacity(0); //off for dev
                            finishSet[i].visible = false;
                        }
                    }
                    element.visible = true;
                    finishSet.push(element);
                }
                if ((element.last !== undefined) && (element.last.finish !== undefined) && (element.last.finish.visible === true)) {
                    element.last.finish.group.animate().opacity(0);
                    element.last.finish.visible = false;
                }

                if ((element.inline !== undefined) && (element.inline === true)) {
                    element.group.animate().opacity(1);
                }

                if ((next !== undefined) && (next.visible === true)) {
                    showHide(next);
                }

                id = element.group.attr('id');
                scrollTo(id);
                return;
            }

            if (element.visible === true) {
                element.group.animate().opacity(0);
                if ((element.finish !== undefined) && (element.finish.visible === true)) {
                    element.finish.group.animate().opacity(0);
                }
                if ((element.next !== undefined) && (element.next.visible === true)) {
                    showHide(element.next);
                }
                if ((element.otherAction !== undefined) && (element.otherAction.visible === true)) {
                    element.otherAction.group.animate().opacity(0);
                    element.otherAction.visible = false;
                }
                element.visible = false;
                if ((element.last !== undefined) && (element.last.last !== undefined)) {
                    if (element.last.last.group !== undefined) {
                        id = element.last.last.group.attr('id');
                        scrollTo(id);
                    } else {
                        id = element.last.group.attr('id');
                        scrollTo(id);
                    }
                }
            } // end true
        }
*/
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

        return {
            config: setParams,
            flowStart: flowStart,
            finish: finish,
            decision: decision,
            drawGrid: drawGrid,
            unhide: unhide,
            draw: setRoot,
            cfg: fConfig,
            shapes: setShapes
        };

    }());
//drawGrid(draw);
//unhide();
