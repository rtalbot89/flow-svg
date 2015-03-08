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