class Slider {
    constructor(options) {
        this.options = options
        // calculating number of steps in a circle
        this.steps = Math.floor((this.options.max - this.options.min) / this.options.step);
        this.currentStep = this.options.step;
        this.stepLength = 0;
        this.circleRadius = 0;
        this.circleLength = 0;
    }

    init() {
        this.draw();
        // setting the initial step
        this.setStep();
    }

    draw() {
        let strokeWidth = 22;
        let strokeWidthHolder = 1.8;
        // actual circle radius, since the options one doesnt not factor in radius
        this.circleRadius = this.options.radius - strokeWidth / 2;
        // length of the circle based on the actual radius
        this.circleLength = 2 * Math.PI * this.circleRadius;
        this.stepLength = this.circleLength / this.steps;

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute('class', 'slider');
        this.svg.setAttribute('height', this.options.radius * 2);
        this.svg.setAttribute('width', this.options.radius * 2);
        this.svg.setAttribute('viewBox', `0 0 ${this.options.radius * 2} ${this.options.radius * 2}`);

        this.valueBackdrop = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.valueBackdrop.setAttribute('class', 'value_backdrop');
        this.valueBackdrop.setAttribute('d',
            `M${this.options.radius},${strokeWidth / 2} a${this.circleRadius},${this.circleRadius} 0 1,1 -1,0`);
        this.valueBackdrop.setAttribute('stroke-width', strokeWidth)
        this.svg.appendChild(this.valueBackdrop);

        this.valueProgress = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.valueProgress.setAttribute('class', 'value_progress');
        this.valueProgress.setAttribute('d',
            `M${this.options.radius},${strokeWidth / 2} a${this.circleRadius},${this.circleRadius} 0 1,1 -1,0`);
        this.valueProgress.setAttribute('stroke', this.options.color);
        this.valueProgress.setAttribute('stroke-width', strokeWidth);
        this.valueProgress.setAttribute('stroke-dasharray', this.circleLength);
        this.svg.appendChild(this.valueProgress);

        this.valueHolder = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        this.valueHolder.setAttribute('class', 'value_holder');
        this.valueHolder.setAttribute('r', strokeWidth / 2 - strokeWidthHolder / 2);
        this.valueHolder.setAttribute('stroke-width', strokeWidthHolder);
        this.svg.appendChild(this.valueHolder);

        this.options.container.appendChild(this.svg);

        this.svg.addEventListener("mousedown", this.onMouseDown, false);
    }

    setStep() {
        this.valueProgress.setAttribute('stroke-dashoffset', this.stepLength * (this.steps - this.currentStep));
        // getPointAtLength returns the point at a given distance along the path
        this.valueHolder.setAttribute('transform',
            `translate(${this.valueBackdrop.getPointAtLength(this.stepLength * this.currentStep).x},${this.valueBackdrop.getPointAtLength(this.stepLength * this.currentStep).y})`);
    }

    onMouseMove(e) {
        console.log(e)
        e.preventDefault();

        
    }

    onMouseDown(e) {
        console.log(e)
        e.preventDefault();

        this.onMouseMove(e);
        document.body.addEventListener("mousemove", this.onMouseMove, false);
        document.body.addEventListener("mouseup", this.onMouseUp, false);
    }

    onMouseUp(e) {
        console.log(e)
        e.preventDefault();

        document.body.removeEventListener("mousemove", this.onMouseMove, false)
        document.body.removeEventListener("mouseup", this.onMouseUp, false);
    }
}

slider = new Slider({
    container: document.getElementById('container'),
    color: 'red',
    min: 0,
    max: 150,
    step: 4,
    radius: 200
});
slider.init();
