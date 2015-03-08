        function start(shapes) {
            var text, shapeBox, rect, k,
                group = draw.group().attr({
                    "class": "fc-start"
                });

            rect = group.rect(config.startWidth, config.startHeight)
                .attr({
                    fill: config.startFill,
                    'stroke-width' : config.startStrokeWidth,
                    stroke: config.startStrokeWidth
                })
                .radius(config.startCornerRadius);

            startId = group.attr('id');

            lowerConnector = arrowLine();
            text = group.text(function (add) { add.tspan(config.startText).newLine().attr({
                'text-anchor': 'middle',
                'font-size': config.startFontSize,
                'fill' : config.startTextColour
            }); });

            shapeBox = rect.bbox();
            lowerConnector.move(shapeBox.cx, shapeBox.height);
            text.move(shapeBox.cx);
            text.cy(shapeBox.cy);
            group.add(lowerConnector);

            if (interactive === true) {
                group.attr({"cursor": "pointer"});
                group.click(function () {
                    var firstShape = shapes[0].svgid;

                    if (shapes[0].show === false) {
                        shapes[0].show = true;
                        firstShape.animate().opacity(config.maxOpacity);
                        firstShape.attr('visibility', 'visible');

                    } else {

                        firstShape.animate().opacity(config.minOpacity);
                        firstShape.attr('visibility', 'hidden');
                        shapes[0].show = false;

                        for (k = 0; k < clicked.length; k += 1) {
                            shapes[lookup[clicked[k]]].svgid.animate().opacity(config.minOpacity);
                            shapes[lookup[clicked[k]]].show = false;
                            shapes[lookup[clicked[k]]].attr('visibility', 'hidden');
                        }
                        clicked.splice(0, clicked.length - 1);
                    }
                });
            }
            return group;
        }