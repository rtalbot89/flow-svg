        function hideShapes(index) {
            var j, sp;
            for (j = index; j < clicked.length; j += 1) {
                sp = shapes[lookup[clicked[j]]];
                sp.show = false;
                sp.svgid.animate().opacity(config.minOpacity);
                sp.svgid.attr('visibility', 'hidden');
            }
            clicked.splice(index, clicked.length);
        }