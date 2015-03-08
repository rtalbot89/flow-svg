        function referringIds(element) {
            var next;

            if (!element.orient) {
                element.orient = {yes: 'b', no: 'r', next: 'b'};
            }

            if (element.yes) {
                next = lookup[element.yes];
                if (shapes[next]) {
                    shapes[next].previd = element.id;
                    shapes[next].prev = element.label;
                    shapes[next].svgprevid = SVG.get(element.id);

                    if (element.orient.yes === 'b') {
                        shapes[next].isBelow = element.id;
                        shapes[next].svgisBelow = SVG.get(element.id);
                    }

                    if (element.orient.yes === 'r') {
                        shapes[next].isRightOf = element.id;
                        shapes[next].svgisRightOf = SVG.get(element.id);
                    }
                }
            }
            if (element.no) {
                next = lookup[element.no];
                if (shapes[next]) {
                    shapes[next].previd = element.id;
                    shapes[next].prev = element.label;
                    shapes[next].svgprevid = SVG.get(element.id);

                    if (element.orient.no === 'b') {
                        shapes[next].isBelow = element.id;
                        shapes[next].svgisBelow = SVG.get(element.id);
                    }

                    if (element.orient.no === 'r') {
                        shapes[next].isRightOf = element.id;
                        shapes[next].svgisRightOf = SVG.get(element.id);
                    }
                }
            }
            if (element.next) {
                next = lookup[element.next];
                if (shapes[next]) {
                    shapes[next].previd = element.id;
                    shapes[next].prev = element.label;
                    shapes[next].svgprevid = SVG.get(element.id);

                    if (element.orient.next === 'b') {
                        shapes[next].isBelow = element.id;
                        shapes[next].svgisBelow = SVG.get(element.id);
                    }

                    if (element.orient.next === 'r') {
                        shapes[next].isRightOf = element.id;
                        shapes[next].svgisRightOf = SVG.get(element.id);
                    }
                }
            }
        }