        function finish(options) {
            var tip, tg, tiptxt, group = chartGroup.group()
                .attr({
                    "class": "finish-group"
                }),
                rect = group
                .rect(config.finishWidth, config.finishHeight)
                .attr({
                    fill: config.finishFill,
                    "class": "fc-finish"
                }).radius(20),

                content = group.group();

            content.text(function (add) {
                options.text.forEach(function (l) {
                    add.tspan(l).newLine();
                });
            })
                    .fill(config.finishTextColour)
                    .font({size: config.finishFontSize});

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
                    txt.fill(config.finishLinkColour).font({size: config.finishFontSize});
                    tbox = content.bbox();
                    txt.dmove(0, tbox.height + 5);
                    content.add(url);
                });
            }
            // Dealing with tips
            if (options.tip) {

                tip = group.text(options.tip.title)
                    .fill(config.finishLinkColour)
                    .font({size: config.finishFontSize})
                    .attr('cursor', 'pointer');

                tip.move(config.finishLeftMargin, rect.height() - 25);

                tip.on('mouseover', function () {
                    tg = group.group();
                    tiptxt = group.text(function (add) {
                        options.tip.text.forEach(function (l) {
                            add.tspan(l).newLine();
                        });
                    })
                        .font({size: config.tipFontSize}).move(config.tipMarginLeft, config.tipMarginTop);

                    var rct = tg.rect(config.shapeWidth - (config.finishLeftMargin), tiptxt.bbox().height + (config.tipMarginTop * 2))
                        .attr({
                            fill: config.tipFill,
                            stroke: config.tipStrokeColour,
                            "class": "fc-tip"
                        });

                    tg.add(tiptxt);
                    tg.x(config.finishLeftMargin / 2);
                    tg.y(this.getAttribute('y') - rct.height());
                })
                    .on('mouseout', function () {
                        tg.remove();
                    });
            }
            // Not sure about the -5 fudge factor
            content.move(config.finishLeftMargin, ((rect.height() -  content.bbox().height) / 2) - 5);
            return group;
        }