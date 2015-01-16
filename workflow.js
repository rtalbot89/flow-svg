"use strict";
var console = console || {};
var jQuery = jQuery || {};

function scrollTo(id) {
	jQuery('#' + id).scrollintoview();
}
var Flow = (function(conf) {

	var draw = conf.root;

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
			finishHeight:100,
			processWidth: 240,
			processHeight: 100
		};
	}

	var config = init();
	
	var flowStart = function () {
		var group = draw.group().attr({
			"cursor": "pointer",
			"class": "fc-start"
		});
		var rect = draw.rect(config.decisionWidth, config.rowHeight * 2)
			.fill('blue').opacity(0.3).radius(20);

		var lowerConnector = arrowLine();
		var text = draw.text("Start").move(100, 12);
		
		group.add(rect);
		group.add(text);
		var shapeBox = rect.bbox();
		lowerConnector.move(shapeBox.cx, shapeBox.height);
		group.add(lowerConnector);
		group.move(config.leftMargin, 0);
		
		return group;
	};

	var startEl = flowStart();

	var elementRefs = [];

	for (var i = 0; i < conf.shapes.length; i++) {
		
		var shape;
		if (conf.shapes[i].type === 'decision') {
			shape = decision(conf.shapes[i]);
		}
		if (conf.shapes[i].type === 'finish') {
			shape = finish(conf.shapes[i]);
		}
		if (conf.shapes[i].type === 'process') {
			shape = process(conf.shapes[i]);
		}

		// move the first shape into position
		if (i == 0) {
			shape.move(config.leftMargin, startEl.bbox().height);
		}
		
		conf.shapes[i].id = shape.attr('id');

		elementRefs.push(conf.shapes[i]);

	}

	function getSvgId(elementRefs, el) {
		var filteredEls = elementRefs.filter(function(d) {
			if (d.label === el) {
				return d;
			}
		});
		return filteredEls;
	}
	//console.log(getSvgId(elementRefs, 'decTwo'));
	// This is where things get moved into position
	for (i = 0; i < conf.shapes.length; i++) {
		var el = conf.shapes[i];
		
		var element = SVG.get(getSvgId(elementRefs, el.label)[0].id);
		var elBox = element.bbox();
		
		if (el.yes) {
			var yesElement = SVG.get(getSvgId(elementRefs, el.yes)[0].id);

			if (el.orient.yes === 'b') {
				yesElement.move(element.x(), element.y() + elBox.height);
			}

			if (el.orient.yes === 'r') {
				yesElement.x(element.x() + elBox.width);
				yesElement.cy((element.first().bbox().height / 2) + element.y());
			}

			if (el.orient.yes === 'l') {
				// not implemented
			}
		}

		if (el.no) {
			var noElement = SVG.get(getSvgId(elementRefs, el.no)[0].id);

			if (el.orient.no === 'b') {
				noElement.move(element.x(), elBox.height + element.y());
			}

			if (el.orient.no === 'r') {
				noElement.x(element.x() + elBox.width);
				noElement.cy((element.first().bbox().height / 2) + element.y());
			}

			if (el.orient.no === 'l') {
				// not implemented
			}

		}
	}

	function unhide(draw) {
		"use strict";
		draw.each(function() {
			if (this.opacity(0)) {
				this.opacity(1);
			}
		});
	}

	

	var showHide = function showHide(element, next) {
		"use strict";
		var i, id;
		if (element.visible === false) {
			if (element.stepType === "decision") {
				element.visible = true;
			}
			element.group.animate().opacity(1).after(function() {});

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

	function decision(obj) {
		var group = draw.group();
		var coords = "0," + config.decisionHeight / 2 
		+" " + config.decisionWidth / 2 + ",0 " 
		+ config.decisionWidth +"," + config.decisionHeight / 2 
		+ " " + config.decisionWidth / 2 +"," + config.decisionHeight;
		//console.log(coords);
		var shape = draw.polygon(coords)
			.attr({
				fill: 'red',
				opacity: 0.3,
				"class": 'rhombus'
			});
		group.add(shape);

		var text = draw.text(obj.text !== '' ? obj.text : 'Add the decision here');
		text.cx(config.decisionWidth / 2);
		text.cy(config.decisionHeight / 2);
		group.add(text);
		
		var shapeBbox = shape.bbox();
		//console.log(shapeBbox);

		if (obj.yes) {
			var arrowYes = arrowConnector(obj, 'Yes');
			group.add(arrowYes);
			if(obj.orient.yes === 'r') {
				arrowYes.cy(config.decisionHeight / 2);
				arrowYes.x(shapeBbox.width + (config.connectorLength / 2));
			}
			if(obj.orient.yes === 'b') {
				arrowYes.x(shapeBbox.width / 2);
				arrowYes.y(shapeBbox.height);
			}
		}

		if (obj.no) {
			var arrowNo = arrowConnector(obj, 'No');
			group.add(arrowNo);
			
			if(obj.orient.no === 'r') {
				arrowNo.cy(config.decisionHeight / 2);
				arrowNo.x(shapeBbox.width + (config.connectorLength / 2));
			}
			if(obj.orient.no === 'b') {
				arrowNo.x(shapeBbox.width / 2);
				arrowNo.y(shapeBbox.height);
			}
		}

		return group;
	}
	
	function arrowLine() {
	var group = draw.group();
	var line = draw
		.line(0, 0, 0, config.connectorLength - config.arrowHeadHeight)
		.stroke({
			width: 1
		});
	group.add(line);

	var coords = "0,0 " + config.arrowHeadHeight + ",0 " + config.arrowHeadHeight / 2 + "," + config.arrowHeadHeight;

	var arrowHead = draw.polygon(coords).fill({
		color: 'rgb(51, 51, 51)',
		opacity: 1.0
	});

	group.add(arrowHead);
	arrowHead.move(- (config.arrowHeadHeight / 2), config.connectorLength - config.arrowHeadHeight);

	return group;
}

	function arrowConnector(obj, txt) {
		var arrowGroup = arrowLine();

		// Group the label and text so that they're easier to move about
		var labelGroup = draw.group();
		var label = draw
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

		var text = draw.text(txt);
		labelGroup.add(text);
		text.move(-10, 15);
		// Add the label and text to the arrow
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

			if (obj.orient.yes === 'b') {
				//arrowGroup.move(120, 120);
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

			if (obj.orient.no === 'b') {
				//arrowGroup.move(120, 120);
			}
		}


		return arrowGroup;

	}

	function finish(conf) {
		var group = draw.group();
		group.attr({
			"class": "finish-group"
		});
		
		var rect = draw
			.rect(config.finishWidth, config.finishHeight)
			.attr({
				fill: 'green',
				"class": "fc-finish",
				'opacity': 0.3
			}).radius(20);

		var text = draw
			.text(conf.text !== '' ? conf.text : 'Add the finish here');

		text.move(20, 20);

		group
			.add(rect)
			.add(text);
		return group;
	}
	
	// Find the element pointing to this one
	function referringElement(elementRefs, el) {
		console.log(elementRefs);
		var filteredEls = elementRefs.filter(function(d) {
			if ((d.yes === el) || (d.no === el)) {
				return d;
			}
		});
		return filteredEls;
	}
	
	function process(conf) {
		//console.log(conf);
		var group = draw.group();
		group.attr({
			"class": "process-group"
		});
		
		var rect = draw
			.rect(config.processWidth, config.processHeight)
			.attr({
				fill: 'white',
				stroke:'grey',
				"class": "fc-process",
				'opacity': 1.0
			});
			group.add(rect);

			var text = draw.text(conf.text !== '' ? conf.text : 'Add the process here');
			
			group.add(text);
			
			

		text.move(20, 20);
		
		// processes have a return line
		var arrow = arrowLine();
		group.add(arrow);
		
		var referrer = referringElement(elementRefs, conf.label)[0];
		console.log(referrer.id);
		var target;
		var thisPosition;
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
		
		var referredFrom = SVG.get(referrer.id);
		
		// This is going to be the most common case
		if (target === 'b' && thisPosition === 'r') {
			arrow.rotate(90);
			arrow.y(referredFrom.y());
		}
		
		
		
		//var targetId = getSvgId(elementRefs, conf.next);
		//var targetEl = SVG.get(getSvgId(elementRefs, conf.next)[0].id);
		//console.log(conf.next);
		// It has to point to the yes label for the next stage
		// find where the Yes line is for the target
		
		
		
		

		group
		.add(rect)
		.add(text)
		.add(arrow);
		return group;
	}

	function drawGrid(draw) {
		"use strict";
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
		flowStart: flowStart,
		finish: finish,
		decision: decision,
		drawGrid: drawGrid,
		unhide: unhide
	}

});
//drawGrid(draw);
//unhide();
