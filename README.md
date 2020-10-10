# Circular-slider
## Demo
[https://rokkim.github.io/circular-slider/](https://rokkim.github.io/circular-slider/)

## Specification
### Notes
- when creating new instance of the slider, pass in the options object
- multiple sliders can be rendered in the same container (see image below)
- each slider should have his own max/min limit and step value
- value number (on the left in the image) should change in real time based on the slider’s position
- make sure touch events on one slider don’t affect others (even if finger goes out of touched slider range)
- slider value should change when you drag the handle or if you tap the spot on a slider
- the solution should work on mobile devices
- without the use of any external JS libraries
- use GitHub to source your code (make sure you commit early and often)

### Options
- container
- color
- max/min value 
- step
- radius


## Usage
When initializing slider, the options object has to be specified.
```javascript
new Slider({
    container: document.getElementById('sliders'),
    color: '#796087',
    min: 150,
    max: 312,
    step: 2,
    radius: 200,
    label: 'Transportation'
});
```
