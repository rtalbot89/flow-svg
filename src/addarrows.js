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