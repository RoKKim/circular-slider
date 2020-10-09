class Slider {
    constructor(options) {
        this.options = options
        // calculating number of steps in a circle
        this.steps = Math.floor((this.options.max - this.options.min) / this.options.step);
        this.currentStep = 0;
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
        // circumference of the circle based on the actual radius
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

        this.svg.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    }

    setStep() {
        this.valueProgress.setAttribute('stroke-dashoffset', this.stepLength * (this.steps - this.currentStep));
        // if this is the last step, we want to set the position of the holder at the starting point (decimal points)
        if (this.currentStep === this.steps) {
            this.valueHolder.setAttribute('transform',
                `translate(${this.valueBackdrop.getPointAtLength(0).x},${this.valueBackdrop.getPointAtLength(0).y})`);
        } else {
            // getPointAtLength returns the point at a given distance along the path
            this.valueHolder.setAttribute('transform',
                `translate(${this.valueBackdrop.getPointAtLength(this.stepLength * this.currentStep).x},${this.valueBackdrop.getPointAtLength(this.stepLength * this.currentStep).y})`);
        }
    }

    onMouseMove(e) {
        e.preventDefault();

        let svgRect = this.svg.getBoundingClientRect();
        // clientX, clientY tell us the current position of the mouse, we need relative position to the center of svg
        let coords = {
            x: e.clientX - (Math.floor(svgRect.left) + this.options.radius),
            y: (Math.floor(svgRect.top) + this.options.radius) - e.clientY
        };
        // range (-180, 180)
        let angle = Math.atan2(coords.x, coords.y) * 180 / Math.PI;
        // range (0, 360)
        if (angle < 0) {
            angle += 360;
        }
        let currentLength = (angle / 360) * this.circleLength;

        // to ease resetting the value, we allow some buffer at step 0
        if (this.circleLength - this.stepLength / 20 < currentLength || currentLength < this.stepLength / 20) {
            this.currentStep = 0;
        } else {
            this.currentStep = Math.floor(currentLength / this.stepLength) + 1;
        }

        window.requestAnimationFrame(this.setStep.bind(this));
    }

    onMouseDown(e) {
        e.preventDefault()
        this.svg.setAttribute('style', 'pointer-events: auto;');

        // using a pointer to grab the exact listener upon removal
        this.boundMouseMove = this.onMouseMove.bind(this);
        document.body.addEventListener("mousemove", this.boundMouseMove, false);
        this.boundMouseUp = this.onMouseUp.bind(this);
        document.body.addEventListener("mouseup", this.boundMouseUp, false);
    }

    onMouseUp(e) {
        e.preventDefault();

        document.body.removeEventListener('mousemove', this.boundMouseMove)
        document.body.removeEventListener('mouseup', this.boundMouseUp)
    }
}

slider = new Slider({
    container: document.getElementById('container'),
    color: 'red',
    min: 0,
    max: 162,
    step: 30,
    radius: 200
});
slider.init();
