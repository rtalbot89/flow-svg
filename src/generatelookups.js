        function generateLookups(s) {
            shapes = s;
            for (i = 0; i < shapes.length; i += 1) {
                lookup[shapes[i].label] = i;
            }
        }