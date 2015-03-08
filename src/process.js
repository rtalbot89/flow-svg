        function process(options) {
            var group = chartGroup.group()
                    .attr({
                        "class": "process-group"
                    }),
                rect = group
                    .rect(config.processWidth, config.processHeight)
                    .attr({
                        fill: config.processFill,
                        stroke: config.processStrokeColour,
                        "class": "fc-process"
                    }),
                content = group.group();

            content.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine();
                });
            })
                    .font({size: config.processFontSize});

            // Dealing with links
            if (options.links) {
                options.links.forEach(function (l) {
                    var url = draw.link(l.url),
                        txt = draw.text(l.text),
                        tbox;
                    url.add(txt);
                    if (l.target) {
                        url.target(l.target);
                    }
                    txt.fill(config.processLinkColour).font({size: config.processFontSize});
                    tbox = content.bbox();
                    txt.dmove(0, tbox.height + 5);
                    content.add(url);
                });
            }

            content.move(config.finishLeftMargin, ((rect.height() - content.bbox().height) / 2) - 5);
            return group;
        }