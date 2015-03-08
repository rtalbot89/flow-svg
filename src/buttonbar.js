        function buttonBar() {
            var staticBtn, lastActiveColor, lastStaticColor,
                btnGroup = draw.group()
                .attr({
                    "cursor": "pointer"
                }),

                btnBarWidth = (config.startWidth - 5) / 2,
                activeBtn = btnGroup
                .rect(btnBarWidth, config.btnBarHeight)
                .fill(config.startFill)
                .radius(config.btnBarRadius);

            btnGroup.text('Interactive').attr(
                {'fill' : config.startTextColour,
                    'font-size': config.btnBarFontSize,
                    'pointer-events': 'none'
                    }
            )
                .cy(config.btnBarHeight / 2)
                .cx(btnBarWidth / 2);

            staticBtn = btnGroup
                .rect(btnBarWidth, config.btnBarHeight)
                .fill(config.startFill)
                .radius(config.btnBarRadius).move(btnBarWidth + 5, 0);

            btnGroup.text('Static').attr(
                {
                    'fill' : config.startTextColour,
                    'font-size':  config.btnBarFontSize,
                    'pointer-events': 'none'
                }
            )
                .cy(config.btnBarHeight / 2)
                .cx((btnBarWidth * 1.5) + 5);

            if (interactive === true) {
                activeBtn.fill(config.btnBarSelectedColour);
            }

            if (interactive === false) {
                staticBtn.fill(config.btnBarSelectedColour);
            }

            lastActiveColor = activeBtn.attr('fill');
            lastStaticColor = staticBtn.attr('fill');

            activeBtn.on('mouseover', function () {
                activeBtn.fill({color: config.btnBarHoverColour});
            })
                .on('mouseout', function () {
                    activeBtn.fill({color: lastActiveColor});
                })
                .on('click', function () {
                    interactive = true;
                    activeBtn.fill(config.btnBarSelectedColour);
                    staticBtn.fill(config.startFill);
                    hide();
                })
                 .on('mousedown', function () {
                    activeBtn.fill(config.btnBarSelectedColour);
                });

            staticBtn.on('mouseover', function () {
                staticBtn.fill({color: config.btnBarHoverColour});
            })
                .on('mouseout', function () {
                    staticBtn.fill({color: lastStaticColor});
                })
                .on('click', function () {
                    interactive = false;
                    staticBtn.fill(config.btnBarSelectedColour);
                    activeBtn.fill(config.startFill);
                    unhide();
                })
                  .on('mousedown', function () {
                    staticBtn.fill(config.btnBarSelectedColour);
                });

            return btnGroup;
        }