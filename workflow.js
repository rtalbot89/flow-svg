var console = console || {};
var jQuery = jQuery || {};
var SVG = SVG || {};

function scrollTo(id) {
    "use strict";
	jQuery('#' + id).scrollintoview();
}
var Flow = function (conf) {
        "use strict";

	    var draw = conf.root, config, flowStart, rect, lowerConnector, startEl, shapeFuncs, showHide;

	    function init() {
		    return {
			    baseUnit: 80,
			    gridCol: 80,
				rowHeight: 20,
				leftMargin: 140,
				connectorLength: 60,
				arrowHeadHeight: 20,
				decisionWidth: 240,
				decisionHeight: 120,
				finishWidth: 240,
				finishHeight: 100,
				processWidth: 240,
				processHeight: 100
		    };
	    }

	    config = init();
		function arrowLine() {
		    var coords, arrowHead,
	            group = draw.group(),
	            line = draw
		        .line(0, 0, 0, config.connectorLength - config.arrowHeadHeight)
		        .stroke({
			        width: 1
		        });
	        group.add(line);

	        coords = "0,0 " + config.arrowHeadHeight + ",0 " + config.arrowHeadHeight / 2 + "," + config.arrowHeadHeight;

	        arrowHead = draw.polygon(coords).fill({
		        color: 'rgb(51, 51, 51)',
		        opacity: 1.0
	        });

	        group.add(arrowHead);
	        arrowHead.move(-(config.arrowHeadHeight / 2), config.connectorLength - config.arrowHeadHeight);

	        return group;
        }
	    flowStart = function () {
		    var text, shapeBox,
		        group = draw.group().attr({
			        "cursor": "pointer",
			        "class": "fc-start"
		        });
		    rect = draw.rect(config.decisionWidth, config.rowHeight * 2)
			    .fill('blue').opacity(0.3).radius(20);

		    lowerConnector = arrowLine();
		    text = draw.text("Start").move(100, 12);
		    group.add(rect);
		    group.add(text);
		    shapeBox = rect.bbox();
		    lowerConnector.move(shapeBox.cx, shapeBox.height);
		    group.add(lowerConnector);
		    group.move(config.leftMargin, 0);
		    return group;
	    };

	    startEl = flowStart();
		function arrowConnector(obj, txt) {
		    var text,
			    arrowGroup = arrowLine(),
			    labelGroup = draw.group(),
			    label = draw
			        .rect(30, 20).radius(5)
			        .stroke({
				        width: 0.1
			        })
			        .attr({
				        opacity: 1,
				        fill: 'yellow'
			        });

		    labelGroup.add(label);
		    label.move(-15, 10);

		    text = draw.text(txt);
		    labelGroup.add(text);
		    text.move(-10, 15);

		    arrowGroup.add(labelGroup);

		    if (txt === 'Yes') {
			    if (obj.orient.yes === 'r') {
				    arrowGroup.rotate(270);
				    labelGroup.rotate(90);
				//arrowGroup.move(260, 35);
			    }

			    if (obj.orient.yes === 'l') {
				    arrowGroup.rotate(90);
				    labelGroup.rotate(-90);
				//arrowGroup.move(-24, 35);
			    }
		    }

		    if (txt === 'No') {
			    if (obj.orient.no === 'r') {
				    arrowGroup.rotate(270);
				    labelGroup.rotate(90);
				//arrowGroup.move(264, 35);
			    }

			    if (obj.orient.no === 'l') {
				    arrowGroup.rotate(90);
				    labelGroup.rotate(-90);
				//arrowGroup.move(-24, 35);
			    }
		    }


		    return arrowGroup;

	    }
	    function decision(obj) {
		    var shape, text, shapeBbox, arrowYes, arrowNo,
			    group = draw.group(),
		        coords = "0," + config.decisionHeight / 2
		        + " " + config.decisionWidth / 2 + ",0 "
		        + config.decisionWidth + "," + config.decisionHeight / 2
		        + " " + config.decisionWidth / 2 + "," + config.decisionHeight;

		    shape = draw.polygon(coords)
			    .attr({
				    fill: 'red',
				    opacity: 0.3,
				    "class": 'rhombus'
			    });
		    group.add(shape);

		    text = draw.text(obj.text !== '' ? obj.text : 'Add the decision here');
		    text.cx(config.decisionWidth / 2);
		    text.cy(config.decisionHeight / 2);
		    group.add(text);
		    shapeBbox = shape.bbox();

		    if (obj.yes) {
			    arrowYes = arrowConnector(obj, 'Yes');
			    group.add(arrowYes);
			    if (obj.orient.yes === 'r') {
				    arrowYes.cy(config.decisionHeight / 2);
				    arrowYes.x(shapeBbox.width + (config.connectorLength / 2));
			    }
			    if (obj.orient.yes === 'b') {
				    arrowYes.x(shapeBbox.width / 2);
				    arrowYes.y(shapeBbox.height);
			    }
		    }

		    if (obj.no) {
			    arrowNo = arrowConnector(obj, 'No');
			    group.add(arrowNo);
			    if (obj.orient.no === 'r') {
				    arrowNo.cy(config.decisionHeight / 2);
				    arrowNo.x(shapeBbox.width + (config.connectorLength / 2));
			    }
			    if (obj.orient.no === 'b') {
				    arrowNo.x(shapeBbox.width / 2);
				    arrowNo.y(shapeBbox.height);
			    }
		    }

		    return group;
	    }
		function finish(conf) {
		    var rect, text,
		        group = draw.group();
		    group.attr({
			    "class": "finish-group"
		    });
		    rect = draw
			    .rect(config.finishWidth, config.finishHeight)
			    .attr({
				    fill: 'green',
				    "class": "fc-finish",
				    'opacity': 0.3
			    }).radius(20);

		    text = draw
			    .text(conf.text !== '' ? conf.text : 'Add the finish here');

		    text.move(20, 20);

		    group
			    .add(rect)
			    .add(text);
		    return group;
	    }
		// Find the element pointing to this one
	    function referringElement(shapes, el) {
		    console.log(shapes);
		    var filteredEls = conf.shapes.filter(function (d) {
			    if ((d.yes === el) || (d.no === el)) {
				    return d;
			    }
		    });
		    return filteredEls;
	    }
	    function process(conf) {
		    var text, rect, arrow, referrer, target, thisPosition, referredFrom,
		        group = draw.group();
		    group.attr({
			    "class": "process-group"
		    });
		    rect = draw
			    .rect(config.processWidth, config.processHeight)
			    .attr({
				    fill: 'white',
				    stroke: 'grey',
				    "class": "fc-process",
				    'opacity': 1.0
			    });
			group.add(rect);

			text = draw.text(conf.text !== '' ? conf.text : 'Add the process here');
			group.add(text);
		    text.move(20, 20);
		// processes have a return line
		    arrow = arrowLine();
		    group.add(arrow);
		    referrer = referringElement(conf.shapes, conf.label)[0];
		    console.log(referrer.id);
		    if (referrer.no === conf.label) {
			    target = referrer.orient.yes;
			    thisPosition = referrer.orient.no;
		    }
		    if (referrer.yes === conf.label) {
			    target = referrer.orient.no;
			    thisPosition = referrer.orient.yes;
		    }
		    console.log(target);
		// If target is b assume that we are aiming for a point below the referring element
		// where are we?
		    console.log(thisPosition);
		    referredFrom = SVG.get(referrer.id);
		// This is going to be the most common case
		    if (target === 'b' && thisPosition === 'r') {
			    arrow.rotate(90);
			    arrow.y(referredFrom.y());
		    }
		    group
		        .add(rect)
		        .add(text)
		        .add(arrow);
		    return group;
	    }
	    shapeFuncs = {
	        decision : decision,
	        finish: finish,
	        process: process
	    };

	    conf.shapes.forEach(function (element, index) {
	        var shape = shapeFuncs[element.type](element);
		    if (index === 0) {
		        shape.move(config.leftMargin, startEl.bbox().height);
		    }
		    element.id = shape.attr('id');
	    });

	    function getSvgId(shapes, el) {
		    var filteredEls = shapes.filter(function (d) {
			    if (d.label === el) {
				    return d;
			    }
		    });
		    return filteredEls;
	    }
	//console.log(getSvgId(conf.shapes, 'decTwo'));
	// This is where things get moved into position
	    conf.shapes.forEach(function (el) {
		    var yesElement, noElement,
		        element = SVG.get(getSvgId(conf.shapes, el.label)[0].id),
		        elBox = element.bbox();
		    if (el.yes) {
			    yesElement = SVG.get(getSvgId(conf.shapes, el.yes)[0].id);

			    if (el.orient.yes === 'b') {
				    yesElement.move(element.x(), element.y() + elBox.height);
			    }

			    if (el.orient.yes === 'r') {
				    yesElement.x(element.x() + elBox.width);
				    yesElement.cy((element.first().bbox().height / 2) + element.y());
			    }
		    }

		    if (el.no) {
			    noElement = SVG.get(getSvgId(conf.shapes, el.no)[0].id);

			    if (el.orient.no === 'b') {
				    noElement.move(element.x(), elBox.height + element.y());
			    }

			    if (el.orient.no === 'r') {
				    noElement.x(element.x() + elBox.width);
				    noElement.cy((element.first().bbox().height / 2) + element.y());
			    }
		    }
	    }
	        );

	    function unhide(draw) {
		    draw.each(function () {
			    if (this.opacity(0)) {
				    this.opacity(1);
			    }
		    });
	    }
	    showHide = function showHide(element, next) {
		    var i, id, finishSet;
		    if (element.visible === false) {
			    if (element.stepType === "decision") {
				    element.visible = true;
			    }
			    element.group.animate().opacity(1).after(function () {});

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
	    };
	    function drawGrid(draw) {
		    var startPoint = 0,
			    numCols = Math.round(draw.width() / config.gridCol),
			    colHeight = draw.height(),
			    pageWidth = draw.width(),
			    numRows = Math.round(colHeight / config.rowHeight),
			    startRow = 0,
			    i,
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
		config: config,
		
		    flowStart: flowStart,
		    finish: finish,
		    decision: decision,
		    drawGrid: drawGrid,
		    unhide: unhide
	    };

    };
//drawGrid(draw);
//unhide();
