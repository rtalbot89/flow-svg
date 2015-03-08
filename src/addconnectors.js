        function addConnectors(element) {
            var startln, endln;

            if (element.yesid) {
                startln = element.yesOutPos;

                if (element.orient.yes === 'b') {
                    endln = [startln[0], startln[1] + config.connectorLength ];
                }

                if (element.orient.yes === 'r') {
                    endln = [startln[0] + config.connectorLength, startln[1]];
                }
                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width: config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }

            if (element.noid) {
                startln = element.noOutPos;

                if (element.orient.no === 'b') {
                    endln = [startln[0], startln[1] + config.connectorLength ];
                }

                if (element.orient.no === 'r') {
                    endln = [startln[0] + config.connectorLength, startln[1] ];
                }
                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width:  config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }

            if (element.nextid) {
                startln = element.nextOutPos;

                if (element.orient.next === 'b') {
                    endln = [startln[0], startln[1] + config.connectorLength ];
                }

                if (element.orient.next === 'r') {
                    endln = [startln[0] + config.connectorLength, startln[1] ];
                }

                if (endln === undefined) {
                    endln = shapes[lookup[element.next]].yesOutPos;
                }
                element.svgid.polyline(angleLine(startln, endln, element)).stroke({ width:  config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }
        }