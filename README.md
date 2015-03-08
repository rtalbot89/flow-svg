# flowSVG
Create simple interactive and static flow charts using JavaScript and SVG. 

[See an example](http://rtalbot89.github.io/flow-svg/). The code for this is in example/.

flowSVG depends on [svg.js](http://svgjs.com/). Optionally, for smooth scrolling to off-screen elements it uses jQuery and 
the [jquery.scrollTo plugin](https://github.com/flesler/jquery.scrollTo)

## Usage
### Setup
Link to the dependencies in the head of the page.

```html
<!-- jQuery only required for smooth scrolling -->
<script src="jquery-2.1.3.min.js"></script>
<script src="jquery.scrollTo.min.js"></script>
<script src="svg.js"></script>
<script src="flowsvg.min.js"></script>
```
### Quick start
Start by attaching an SVG element to a div.

```html
<div id="drawing" style="margin-left:10px"></div>
```
```javascript
flowSVG.draw(SVG('drawing').size(900, 1100));
```
Pass an array of shape objects.

```javascript
flowSVG.shapes([
  {
  label: 'knowPolicy',
  type: 'decision',
  text: [
  'Do you know the ',
  'Open Access policy',
  'of the journal?'
  ],
  yes: 'hasOAPolicy',
  no: 'checkPolicy'
  }, 
  {
  label: 'hasOAPolicy',
  type: 'decision',
  text: [
  'Does it have Open',
  'Access paid option or is it an',
  'Open Access journal?'
  ],
  yes: 'CCOffered',
  no: 'canWrap'
  }
  ...etc.
]);
```
The first shape in the array must be the starting shape of the chart. After that, the order is irrelevant.
Each shape object has the following required properties
```javascript
 {
  // The label is how the shape is identified
  label: 'knowPolicy',
  // type may be decision, finish, or process
  type: 'decision',
  /* 
  text is an array of lines. SVG text doesn't
  wrap, so you have to manually adjust line length
  */
  text: [
  'Do you know the ',
  'Open Access policy',
  'of the journal?'
  ],
  /* 
  Where to go from here. 'yes' and 'no' apply to
  decisions. 'next' can be used with processes.
  */
  yes: 'hasOAPolicy',
  no: 'checkPolicy'
  }, 

```



