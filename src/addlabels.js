        function addLabels(element) {
            var group = element.svgid, label;

            if (element.yes && element.yesid !== undefined) {
                label = lineLabel('Yes', group);
                element.yesBtn = label;

                label.attr('cursor', 'pointer');
                label.on('click', function () {
                    toggleNext(element, 'yes');
                });
                if (element.orient.yes === 'b') {
                    label.move(element.yesOutPos[0], element.yesOutPos[1]);
                }

                if (element.orient.yes === 'r') {
                    label.move(element.yesOutPos[0] + 20, element.yesOutPos[1] - 20);
                }
            }

            if (element.no && element.noid !== undefined) {
                label = lineLabel('No', group);
                element.noBtn = label;
                label.attr('cursor', 'pointer');
                label.on('click', function () {
                    toggleNext(element, 'no');
                });

                if (element.orient.no === 'b') {
                    label.move(element.noOutPos[0], element.noOutPos[1]);
                }

                if (element.orient.no === 'r') {
                    label.move(element.noOutPos[0] + 20, element.noOutPos[1] - 20);
                }
            }
        }