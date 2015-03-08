        function lineLabel(t, g) {
            var text, labelGroup = g.group(),
                label = labelGroup
                .rect(
                    config.labelWidth,
                    config.labelHeight
                ).radius(config.labelRadius)
                .stroke({
                    width: config.labelStroke
                })
                .attr({
                    opacity: config.labelOpacity,
                    fill: config.labelFill
                });

            label.move(
                -(config.labelWidth / 2),
                config.labelHeight / 2
            );

            text = labelGroup.text(t).attr({
                fill: config.labelTextColour,
                'text-anchor': 'middle',
                'font-size' : config.labelFontSize
            });
            text.cy(label.cy());

            return labelGroup;
        }