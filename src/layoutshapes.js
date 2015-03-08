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