        function staticAddConnectors(element) {
            var startln, endln;

            if (element.yesid) {
                startln = element.yesOutPos;
                endln = shapes[lookup[element.yes]].inNodePos;
                element.conngroup.polyline(angleLine(startln, endln, element, element.yesid)).stroke({ width:  config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }

            if (element.noid) {
                startln = element.noOutPos;
                endln = shapes[lookup[element.no]].inNodePos;
                element.conngroup.polyline(angleLine(startln, endln, element, element.noid)).stroke({ width:  config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }

            if (element.nextid) {
                startln = element.nextOutPos;
                endln = shapes[lookup[element.next]].inNodePos;

                if (endln === undefined) {
                    endln = shapes[lookup[element.next]].yesOutPos;
                }
                element.conngroup.polyline(angleLine(startln, endln, element, element.nextid)).stroke({ width:  config.connectorStrokeWidth, color: config.connectorStrokeColour}).fill('none');
            }
        }