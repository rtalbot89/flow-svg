'use strict';
/*globals SVG*/

describe("Config", function () {
 // var flow;
  beforeEach(function() {
   //flow =  flowSVG.draw(SVG('drawing').size(900, 1100));
  });
  
  it("should have a config object", function() {
   var flow =  flowSVG.draw(SVG('drawing').size(900, 1100));
      flowSVG.config({
        interactive: true,
        showButtons: true,
        connectorLength: 60,
        scrollto: true
    });
      expect(flow.config.interactive).toEqual(true);
  });
});