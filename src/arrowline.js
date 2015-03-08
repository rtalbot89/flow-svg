        function arrowLine() {
            var group = draw.group(),
                ah = arrowHead(group)
                    .move(
                        -(config.arrowHeadHeight / 2),
                        config.connectorLength - config.arrowHeadHeight
                    ),
                line = draw
                    .line(0, 0, 0, config.connectorLength - config.arrowHeadHeight)
                    .attr({
                        'stroke-width':  config.connectorStrokeWidth,
                        'stroke': config.connectorStrokeColour
                    });
            group.add(line).add(ah);

            return group;
        }