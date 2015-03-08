        function makeShapes(element, index) {
            if (element.type && (typeof shapeFuncs[element.type] === 'function')) {
                var shape = shapeFuncs[element.type](element);

                element.id = shape.attr('id');
                element.svgid = shape;
                element.svgshape = shape.get(0);
                itemIds[element.label] = element.id;
                indexFromId[element.id] = index;
                if (interactive === false) {
                    element.show = true;
                    shape.opacity(config.maxOpacity);
                } else {
                    element.show = false;
                    shape.attr('visibility', 'hidden');
                    shape.opacity(config.minOpacity);
                }
            } else {
                console.log(element.type + ' is not a valid shape.');
                return false;
            }
        }