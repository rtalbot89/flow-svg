        function arrowHead(g) {
            var coords =
                    "0,0 " +
                    config.arrowHeadHeight
                    + ",0 "
                    + config.arrowHeadHeight / 2
                    + "," + config.arrowHeadHeight,

                ag = g
                    .polygon(coords).fill({color: config.arrowHeadColor, opacity: config.arrowHeadOpacity})
                    .cx(config.arrowHeadHeight / 2)
                    .cy(config.arrowHeadHeight / 2);

            return ag;
        }