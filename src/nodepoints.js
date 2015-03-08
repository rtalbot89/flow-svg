        function nodePoints(element) {
            var ce = element.svgshape, te, targetShape;

            if (element.yes && element.yesid !== undefined) {
                te = shapes[lookup[element.yes]].svgshape;
                targetShape = shapes[lookup[element.yes]];

                if (targetShape.inNode === 't') {
                    targetShape.inNodePos = [te.cx(), te.y()];
                }

                if (element.orient.yes === 'b') {
                    element.yesOutPos = [ce.cx(), ce.y() + ce.bbox().height];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x() - config.arrowHeadHeight, te.cy()];
                    }
                }

                if (element.orient.yes === 'r') {
                    element.yesOutPos = [ce.x() + ce.width(), ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                }
                isPositioned.push(element.yesid);
            }

            if (element.no && element.noid !== undefined) {
                targetShape = shapes[lookup[element.no]];
                te = shapes[lookup[element.no]].svgshape;

                if (element.orient.no === 'b') {
                    element.noOutPos = [ce.cx(), ce.y() + ce.bbox().height];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';
                    targetShape.inNodePos = [te.cx(), te.y()];
                }

                if (element.orient.no === 'r') {
                    element.noOutPos = [ce.x() + ce.bbox().width, ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';

                    if (targetShape.inNode === 't') {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                }
                isPositioned.push(element.noid);
            }

            if (element.next) {
                targetShape = shapes[lookup[element.next]];
                if (element.orient.next === 'b') {
                    element.nextOutPos = [ce.cx(), ce.bbox().height + ce.y()];

                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 't';

                    if (targetShape.inNode === 't') {
                        te = shapes[lookup[element.next]].svgshape;
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        te = element.svgnoid;
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                }
                if (element.orient.next === 'r') {
                    element.nextOutPos = [ce.x() + ce.bbox().width, ce.cy()];
                    targetShape.inNode = targetShape.inNode !== undefined ? targetShape.inNode : 'l';
                    te = shapes[lookup[element.next]].svgshape;

                    if (targetShape.inNode === 't') {
                        targetShape.inNodePos = [te.cx(), te.y()];
                    }
                    if (targetShape.inNode === 'l') {
                        targetShape.inNodePos = [te.x(), te.cy()];
                    }
                }
                isPositioned.push(element.nextid);
            }
        }
