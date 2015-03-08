        function yesNoIds(element) {
            if (element.yes) {
                element.yesid = itemIds[element.yes];
                element.svgyesid = SVG.get(itemIds[element.yes]);
            }
            if (element.no) {
                element.noid = itemIds[element.no];
                element.svgnoid = SVG.get(itemIds[element.no]);
            }
            if (element.next) {
                element.nextid = itemIds[element.next];
                element.svgnextid = SVG.get(itemIds[element.next]);
            }
        }