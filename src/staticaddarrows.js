        function staticAddArrows(element) {
            var group = element.conngroup, arrowhead, nxt;

            if (element.yes && element.yesid !== undefined) {
                arrowhead = arrowHead(group);
                nxt = shapes[lookup[element.yes]];

                if (element.orient.yes === 'b') {
                    arrowhead.move(nxt.inNodePos[0] - (config.arrowHeadHeight / 2), nxt.inNodePos[1] - config.arrowHeadHeight);
                    if (nxt.inNode === 'l') {
                        arrowhead.rotate(270);
                    }
                }

                if (element.orient.yes === 'r') {
                    arrowhead.move(nxt.inNodePos[0] - (config.arrowHeadHeight / 2), nxt.inNodePos[1] - config.arrowHeadHeight);
                    if (nxt.inNode === 'l') {
                        arrowhead.move(nxt.inNodePos[0] - config.arrowHeadHeight, nxt.inNodePos[1] - (config.arrowHeadHeight / 2));
                        arrowhead.rotate(270);
                    }
                }
            }

            if (element.no && element.noid !== undefined) {
                arrowhead = arrowHead(group);
                nxt = shapes[lookup[element.no]];

                if (element.orient.no === 'b') {
                    arrowhead.move(nxt.inNodePos[0] - (config.arrowHeadHeight / 2), nxt.inNodePos[1] - config.arrowHeadHeight);
                }

                if (element.orient.no === 'r') {
                    arrowhead.move(nxt.inNodePos[0] - config.arrowHeadHeight, nxt.inNodePos[1] - (config.arrowHeadHeight / 2));
                    arrowhead.rotate(270);
                }
            }

            if (element.next && element.nextid !== undefined) {
                arrowhead = arrowHead(group);
                nxt = shapes[lookup[element.next]];

                if (element.orient.next === 'b') {
                    arrowhead.move(nxt.inNodePos[0] - (config.arrowHeadHeight / 2), nxt.inNodePos[1] - config.arrowHeadHeight);
                    if (nxt.inNode === 'l') {
                        arrowhead.rotate(270);
                    }
                }

                if (element.orient.next === 'r') {
                    arrowhead.move(nxt.inNodePos[0] - config.arrowHeadHeight, nxt.inNodePos[1] - (config.arrowHeadHeight / 2));
                    arrowhead.rotate(270);
                }
            }
        }