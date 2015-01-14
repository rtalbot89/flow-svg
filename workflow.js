var console = console || {};
var jQuery = jQuery || {};
function init() {
	"use strict";
	var exports = {};
	exports.baseUnit = 80;
	exports.gridCol = 80;
  //exports.gridCol = 20;
	exports.rowHeight = 20;
	exports.leftMargin = 140;
	return exports;
}

var config = init();
var shapeStack = {}; // keep track of instances
var marginTop = 20;
var totalHeight = 110; // distance from top
var endHeight = 300; //just a fudge to fit in extra bits
var SVG = SVG || {};
var draw = SVG('drawing').size(960, 1600);
//var arrowHead = draw.defs().polygon('0,0 10,0 5,10').fill({ color: 'rgb(51, 51, 51)', opacity: 1.0 });
var arrowHead;
var lastNode;
var stackIndex = 0;
var shapeSet = draw.set();
var actionSet = []; // track visible actions
var decisionSet = [];
var lastDecision = null;

function unhide() {
	"use strict";
	draw.each(function () {
	    if (this.opacity(0)) {
	        this.opacity(1);
	    }
	});
}

function flowStart() {
	"use strict";
	var exports = {};
	exports.lowerGroup = draw.group().attr({
		"cursor" : "pointer",
		"class"  : "fc-start"
	});
	exports.lowerResponse = draw.rect(240, config.rowHeight * 2)
		.fill('blue').opacity(0.3).radius(20)
		.move(config.leftMargin - 100, 0);

	exports.lowerConnector = draw
		.line(160, 40, 160, 80)
		.stroke({
			width: 1
		});
	arrowHead = draw.polygon('0,0 10,0 5,10').fill({ color: 'rgb(51, 51, 51)', opacity: 1.0 });
	exports.text = draw.text("Start").move(145, 12);
	exports.lowerGroup.add(exports.lowerResponse);
	exports.lowerGroup.add(exports.text);
	exports.lowerGroup.add(exports.lowerConnector);
	exports.lowerGroup.add(arrowHead.move(155, 70));
	shapeSet.add(exports.lowerGroup);
	return exports;
}

var requiredHeight = function requiredHeight(element, callback) {
	"use strict";
    if (element.visible === false) {
        draw.height(draw.height() + element.group.bbox().height);
        callback(element);
    }
    if (element.visible === true) {
        draw.height(Math.max((draw.height() - element.group.bbox().height), 80));
        callback(element);
    }
};

function scrollTo(id) {
	"use strict";
    jQuery('#' + id).scrollintoview();
}
var showHide = function showHide(element, next) {
	"use strict";
    var i, id;
    if (element.visible === false) {
        if (element.stepType === "flowDecision") {
            element.visible = true;
        }
        element.group.animate().opacity(1).after(function () { });

        if ((element.stepType !== undefined) && (element.stepType === "flowAction")) {
            for (i = 0; i < actionSet.length; i += 1) {
                if (actionSet[i].visible === true) {
                    actionSet[i].group.animate().opacity(0);
                    actionSet[i].visible = false;
                }
            }
            element.visible = true;
            actionSet.push(element);
        }
        if ((element.last !== undefined) && (element.last.action !== undefined) && (element.last.action.visible === true)) {
            element.last.action.group.animate().opacity(0);
            element.last.action.visible = false;
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
        if ((element.action !== undefined) && (element.action.visible === true)) {
            element.action.group.animate().opacity(0);
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
function flowDecision(last, action, otherAction) {
	"use strict";
	var exports = {},
		heightNow,
		bu  = new SVG.Number(config.baseUnit);

	exports.last = last;
	exports.action = action;
	exports.otherAction = otherAction;
	exports.stepType = "flowDecision";
	exports.dmd = draw
		.polygon('0,60 120,0 240,60 120,120')
		.attr({
			fill : 'red',
            opacity : 0.3,
            "class" : 'rhombus'
		})
		.move(-100,  -bu.minus(50));

	exports.rightConnector = draw
		.line(100,  config.rowHeight * 1.5, 170, config.rowHeight * 1.5)
		.stroke({
			width : 1
		});

	exports.lowerConnector = draw
		.line(0, 90, 0, 140)
		.stroke({
			width : 1
		});

	exports.rightResponse = draw
		.rect(config.baseUnit / 2, config.rowHeight).radius(5)
		.stroke({
			width : 0.1
		})
		.attr({
			opacity : 1,
            fill : 'yellow'
		})
		.move(120,  config.rowHeight);

	exports.lowerResponse = draw
		.rect(config.baseUnit / 2, config.rowHeight).radius(5)
		.stroke({
			width : 0.1
		})
		.attr({
			opacity : 1,
            fill : 'yellow'
		})
		.move(-(config.baseUnit / 4), 110);

	exports.lowerText = draw
		.text('Yes')
		.move(-11, 113);

	exports.rightText = draw
		.text('No')
		.move(132,  23);

	exports.dmdText = draw
		.text('Add the question here')
		.move(-30, -4);

	exports.text = function (text) {
		exports.dmdText.text(text);
	};
	arrowHead = draw.polygon('0,0 10,0 5,10').fill({ color: 'rgb(51, 51, 51)', opacity: 1.0 });
	exports.lowerGroup = draw.group()
	    .attr({
			"cursor" : "pointer",
			"class"  : "fc-response"
		})
		.add(exports.lowerConnector)
		.add(exports.lowerResponse)
		.add(exports.lowerText)
		.add(arrowHead.move(-5, 140));

	arrowHead = draw.polygon('0,0 10,0 5,10').fill({ color: 'rgb(51, 51, 51)', opacity: 1.0 });
    exports.rightGroup = draw.group()
		.attr({
			"cursor" : "pointer",
			"class"  : "fc-response"
		})
		.add(exports.rightConnector)
		.add(exports.rightResponse)
		.add(exports.rightText)
		.add(arrowHead.rotate(270).move(-25, 170));

    exports.lowerGroup.move(20, 0);
    exports.rightGroup.move(40, 0);
	exports.group = draw.group()
		.add(exports.dmd)
		.add(exports.dmdText)
		.add(exports.lowerGroup)
		.add(exports.rightGroup);

	exports.group.attr({
		"class" : "fc-decision"
	});
	shapeSet.add(exports.group);

	if (shapeStack[stackIndex] !== undefined) {
		heightNow = shapeStack[stackIndex].height;
		totalHeight += heightNow;
	}
	exports.group.move(config.leftMargin, totalHeight);
	stackIndex += 1;
	shapeStack[stackIndex] = exports.group.bbox();

	if (exports.last !== undefined) {
        exports.last.next = exports;
	    exports.last.lowerGroup.click(function () {
	        showHide(exports);
	    });
	}

	if (exports.action !== undefined) {
		exports.action.group.move(config.leftMargin + 185, totalHeight - 10);
		exports.rightGroup.click(function () {
			showHide(exports.action, exports.next);
		});
	}

  ///extra action
	if (exports.otherAction !== undefined) {
		exports.lowerGroup.click(function () {
			showHide(exports.otherAction);
		});
	}

	exports.visible = false;
	exports.group.opacity(0);
	decisionSet.push(exports);
	return exports;
}

function flowAction(conf) {
	"use strict";
	var exports = {};
	exports.conf = conf || {};
	exports.group = draw.group();
	exports.group.attr({"class" : "action-group"});
	exports.stepType = "flowAction";
    var h = config.rowHeight * 4;
	exports.height = function (h) {
	        return h;
	};
    
	exports.rect = draw
		.rect(240, exports.conf.height || h)
		.attr({
			fill : 'green',
			"class" : "fc-action",
            'opacity' : 0.3
		}).radius(10)
		.move(35, 0);

	exports.text = draw
		.text('Add the action here');

	exports.group
		.add(exports.rect)
		.add(exports.text);

  // add the end button
	exports.endLine = draw.line(80, 20, 90,	20).stroke({
		width : 1
	});
	exports.endBox = draw
		.rect(240, config.rowHeight * 2)
		.attr({
			fill : 'blue',
			'opacity' : 0.3,
			'class' : 'fc-end'
		})
		.radius(20)
		.move(100, 0);
	exports.endText = draw
		.text('Finish').move(203, 12);

	arrowHead = draw.polygon('0,0 10,0 5,10').fill({ color: 'rgb(51, 51, 51)', opacity: 1.0 });
	exports.endGroup = draw.group()
		.add(exports.endLine)
		.add(arrowHead.rotate(270).move(-15, 90))
		.add(exports.endBox)
		.add(exports.endText)
		.move(195, 20);
    exports.endGroup.attr({"class" : "fc-finish"});
	exports.group.add(exports.endGroup);
	shapeSet.add(exports.group);
    exports.visible = false;
	exports.group.opacity(0);
	decisionSet.push(exports);
	return exports;
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
			width : 0.15
		});
		startPoint += config.gridCol;
	}

	for (j = 0; j < numRows + 1; j += 1) {
		draw.line(0, startRow, pageWidth, startRow).stroke({
			width : 0.15
		});
		startRow += config.rowHeight;
	}
}

///////////////////// start flow chart ////////////////////////////////////////////////////////////
var startbtn = flowStart();

var actionOne = flowAction();
actionOne.text.text('University of Warwick OA Policy \napplies - deposit to WRAP.').move(45, 25);

var decOne = flowDecision(startbtn, actionOne);
decOne.text(
	function (add) {
		"use strict";
		add.tspan('Is your research/are you').dy(40).dx(-15);
		add.tspan('funded?').dy(20).dx(-90);
	}
);

var actionTwo = flowAction();
actionTwo.text.text('Contact the Library...').move(45, 25);

var decTwo = flowDecision(decOne, actionTwo);
decTwo.text(
	function (add) {
		"use strict";
		add.tspan('Do you know if').dy(20).dx(10);
		add.tspan('your funder expects your work').newLine().dx(-30);
		add.tspan('to be published open').newLine().dx(-6);
		add.tspan('access?').newLine().dx(28);
	}
);

var funderNo = flowAction();
funderNo.text.text('University of Warwick OA Policy \napplies.').move(45, 25);

var funderExpect = flowDecision(decTwo, funderNo);
funderExpect.text(
	function (add) {
		"use strict";
		add.tspan('Does your').dy(20).dx(22);
		add.tspan('funder expect your work to be').newLine().dx(-28);
		add.tspan('published open access?').newLine().dx(-14);
		//add.tspan('access?').newLine().dx(13);

	}
);

var contactLibrary = flowAction();
contactLibrary.text.text('Contact the Library on \nopenaccessfund@warwick.ac.uk.').move(45, 25);

var journalComply = flowDecision(funderExpect, contactLibrary);
journalComply.text(
	function (add) {
		"use strict";
		add.tspan('Does the').dy(20).dx(25);
		add.tspan('journal I want to publish in').newLine().dx(-20);
		add.tspan('comply with my funder\'s ').newLine().dx(-14);
		add.tspan('policy?').newLine().dx(32);
	}
);

var depositToWrap = flowAction();
depositToWrap.text.text('Deposit to WRAP as per UoW OA \npolicy.').move(45, 25);

var greenAndGold = flowDecision(journalComply, depositToWrap);
greenAndGold.text(
	function (add) {
		"use strict";
		add.tspan('Compliant both Green').dy(40).dx(-13);
		add.tspan('and Gold?').newLine().dx(20);
	}
);
greenAndGold.rightText.text('Yes');
greenAndGold.lowerText.text('No');

var onlyGold = flowDecision(greenAndGold);
onlyGold.text(
	function (add) {
		"use strict";
		add.tspan('Only compliant for Gold OA?').dy(40).dx(-26);
	}
);
onlyGold.rightGroup.remove();

var contactFunding = flowAction();
contactFunding.rect.attr({ "height": 100 });
contactFunding.text.text('Contact the Library for further \ninformation on your funder\'s policy \nopenaccessfund@warwick.ac.uk.').move(45, 25);

var availableFunding = flowAction({ 
"height": 220 
});
availableFunding.group.move(5, 1340);

availableFunding.text.text([
	'The University has funds for RCUK',
	'and Wellcome Trust. Apply via the',
	'funding request form h/link.',
	'Applications will be generally be',
	'responded to within 24-48 hours. You',
	'will receive an email* from the Open',
	'Open Access Officer.',
	'*this email contains instructions for the',
	'next financial steps.'
].join('\n')).move(45, 24);

availableFunding.inline = true;

var howFunded = flowDecision(onlyGold, contactFunding, availableFunding);
howFunded.text(
	function (add) {
		"use strict";
		add.tspan('Are you RCUK or Wellcome').dy(40).dx(-25);
		add.tspan('Trust funded?').dy(20).dx(-114);
	}
);

//drawGrid(draw);
//unhide();