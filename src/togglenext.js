        toggleNext = function (e, choice) {
            var nextlabel, clckindex, scrollid, h, rootId, root, rec, recBox, point, ctm, elementY;

            if (choice === 'yes') {
                /* This toggles the visibility if this is the second click
                    on the button, i.e. it was already visible */
                if (shapes[lookup[e.yes]].show === true && shapes[lookup[e.no]].show === false) {
                    clckindex = clicked.indexOf(e.yes);
                    hideShapes(clckindex);
                    scrollid = e.id;
                    return;
                }

                clckindex = clicked.indexOf(e.no);
                 // if clckindex is more than -1 this element was clicked before
                if (clckindex > -1) {
                    hideShapes(clckindex);
                }
                if (clicked.indexOf(e.yes) === -1) {
                    clicked.push(e.yes);
                }

                if (e.orient.yes === 'b') {
                    e.svgyesid.move(e.svgid.x(), e.svgid.y() + e.svgid.bbox().height);

                    if (shapes[lookup[e.yes]].svgnextid !== undefined) {
                        shapes[lookup[e.yes]].svgnextid.move(e.svgyesid.x(), e.svgyesid.bbox().y + e.svgyesid.bbox().height);
                    }
                }
                if (e.orient.yes === 'r') {
                    e.svgyesid.move(e.svgid.x() + e.svgid.bbox().width, e.svgid.y());
                    if (shapes[lookup[e.yes]].svgnextid !== undefined) {
                        shapes[lookup[e.yes]].svgnextid.move(e.svgyesid.x(), e.svgyesid.bbox().y + e.svgyesid.bbox().height);
                    }
                }

                e.svgyesid.animate().opacity(config.maxOpacity);
                scrollid = e.yesid;
                e.svgyesid.attr('visibility', 'visible');
                shapes[lookup[e.yes]].show = true;
                shapes[lookup[e.no]].svgid.animate().opacity(config.minOpacity);
                shapes[lookup[e.no]].svgid.attr('visibility', 'hidden');
                shapes[lookup[e.no]].show = false;

                if (shapes[lookup[e.yes]].next !== undefined) {
                    nextlabel = shapes[lookup[e.yes]].next;
                    clicked.push(nextlabel);
                    shapes[lookup[nextlabel]].svgid.animate().opacity(config.maxOpacity);
                    shapes[lookup[nextlabel]].svgid.attr('visibility', 'visible');
                    shapes[lookup[nextlabel]].show = true;
                    scrollid =  shapes[lookup[nextlabel]].id;
                }
            }

            if (choice === 'no') {
                if (shapes[lookup[e.no]].show === true) {
                    clckindex = clicked.indexOf(e.no);
                    hideShapes(clckindex);
                    scrollid = e.id;
                    return;
                }

                clckindex = clicked.indexOf(e.yes);
              // if clckindex is more than -1 this element was clicked before
                if (clckindex > -1) {
                    hideShapes(clckindex);
                }

                if (clicked.indexOf(e.no) === -1) {
                    clicked.push(e.no);
                }

                if (e.orient.no === 'b') {
                    e.svgnoid.move(e.svgid.x(), e.svgid.y() + e.svgid.bbox().height);

                    if (shapes[lookup[e.no]].svgnextid !== undefined) {
                        shapes[lookup[e.no]].svgnextid.move(e.svgnoid.x(), e.svgnoid.bbox().y + e.svgnoid.bbox().height);
                    }
                }
                if (e.orient.no === 'r') {
                    e.svgnoid.move(e.svgid.x() + e.svgid.bbox().width, e.svgid.y());
                    if (shapes[lookup[e.no]].svgnextid !== undefined) {
                        shapes[lookup[e.no]].svgnextid.move(e.svgnoid.x(), e.svgnoid.bbox().y + e.svgnoid.bbox().height);
                    }
                }

                e.svgnoid.animate().opacity(config.maxOpacity);
                scrollid = e.noid;
                e.svgnoid.attr('visibility', 'visible');
                shapes[lookup[e.no]].show = true;

                if (shapes[lookup[e.no]].next !== undefined) {
                    nextlabel = shapes[lookup[e.no]].next;
                    clicked.push(nextlabel);
                    shapes[lookup[nextlabel]].show = true;
                    shapes[lookup[nextlabel]].svgid.animate().opacity(config.maxOpacity);
                    shapes[lookup[nextlabel]].svgid.attr('visibility', 'visible');
                    scrollid =  shapes[lookup[nextlabel]].id;
                }
            }

            // scroll to functionality
            if (scrollto === true) {
                h = window.innerHeight;
                rootId = draw.attr('id');
                root = document.getElementById(rootId);
                rec = document.getElementById(scrollid);
                recBox = SVG.get(scrollid).bbox();
                point = root.createSVGPoint();
                ctm = rec.getCTM();
                elementY = point.matrixTransform(ctm).y + recBox.height + root.parentNode.offsetTop + 20;

                if (elementY > h) {
                    if (window.jQuery && window.jQuery.scrollTo) {
                        jQuery.scrollTo(elementY - h, 1000);
                    } else {
                        window.scrollTo(0,  elementY - h);
                    }
                }
            }
        };