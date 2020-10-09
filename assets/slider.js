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
        this.drawSlider();
        this.createLabel();
        // setting the initial step
        this.setStep();
    }

    drawSlider() {
        let strokeWidth = 22;
        let strokeWidthHolder = 1.8;
        let dashWidth = 1.4;

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
        // pointer event will be only triggered on the stroke of svg
        this.svg.style.pointerEvents = 'stroke';
        this.options.container.appendChild(this.svg);

        this.valueProgress = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.valueProgress.setAttribute('class', 'value_progress');
        this.valueProgress.setAttribute('d',
            `M${this.options.radius},${strokeWidth / 2} a${this.circleRadius},${this.circleRadius} 0 1,1 -1,0`);
        this.valueProgress.setAttribute('stroke', this.options.color);
        this.valueProgress.setAttribute('stroke-width', strokeWidth);
        this.valueProgress.setAttribute('stroke-dasharray', this.circleLength);
        this.svg.appendChild(this.valueProgress);

        this.valueBackdrop = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.valueBackdrop.setAttribute('class', 'value_backdrop');
        this.valueBackdrop.setAttribute('d',
            `M${this.options.radius},${strokeWidth / 2} a${this.circleRadius},${this.circleRadius} 0 1,1 -1,0`);
        this.valueBackdrop.setAttribute('stroke-width', strokeWidth);
        this.valueBackdrop.setAttribute('stroke-dasharray', `${this.stepLength - dashWidth} ${dashWidth}`);
        this.valueBackdrop.setAttribute('stroke-dashoffset', -dashWidth / 2);
        this.svg.appendChild(this.valueBackdrop);

        /*this.valueProgressDash = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.valueProgressDash.setAttribute('class', 'value_progress_dash');
        this.valueProgressDash.setAttribute('d',
            `M${this.options.radius},${strokeWidth / 2} a${this.circleRadius},${this.circleRadius} 0 1,1 -1,0`);
        this.valueProgressDash.setAttribute('stroke-width', strokeWidth);
        this.valueProgressDash.setAttribute('stroke-dasharray', `${dashWidth} ${this.stepLength - dashWidth}`);
        this.valueProgressDash.setAttribute('stroke-dashoffset', dashWidth / 2);
        this.svg.appendChild(this.valueProgressDash);*/

        this.valueHolder = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        this.valueHolder.setAttribute('class', 'value_holder');
        this.valueHolder.setAttribute('r', strokeWidth / 2 - strokeWidthHolder / 2);
        this.valueHolder.setAttribute('stroke-width', strokeWidthHolder);
        this.svg.appendChild(this.valueHolder);

        this.svg.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.svg.addEventListener("touchstart", this.onTouchStart.bind(this), false);
    }

    createLabel() {
        let labels = document.getElementById('labels');
        let label = document.createElement("div");
        label.setAttribute('class', 'label');
        labels.appendChild(label);

        this.value = document.createElement("div");
        this.value.setAttribute('class', 'value');
        this.value.innerHTML = "$";
        label.appendChild(this.value);

        this.valueSpan = document.createElement("span");
        this.value.appendChild(this.valueSpan);

        this.colorBox = document.createElement("div");
        this.colorBox.setAttribute('class', 'color_box')
        this.colorBox.style.backgroundColor = this.options.color;
        label.appendChild(this.colorBox);

        this.labelText = document.createElement("div");
        this.labelText.setAttribute('class', 'label_text');
        this.labelText.innerHTML = this.options.label;
        label.appendChild(this.labelText);
    }

    setStep() {
        this.valueProgress.setAttribute('stroke-dashoffset', this.stepLength * (this.steps - this.currentStep));

        this.valueSpan.innerHTML = this.options.min + this.currentStep * this.options.step;

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

    onMove(e) {
        e.preventDefault();

        let svgRect = this.svg.getBoundingClientRect();

        let coords = {
            x: 0,
            y: 0
        };
        // instead of the current position of the pointer we need relative position to the center of svg
        if (e.type === 'touchmove') {
            coords.x = e.touches[0].clientX;
            coords.y = e.touches[0].clientY;
        } else if (e.type === 'mousemove') {
            coords.x = e.clientX;
            coords.y = e.clientY;
        }

        // range (-180, 180)
        let angle = Math.atan2(coords.x - (Math.floor(svgRect.left) + this.options.radius),
            (Math.floor(svgRect.top) + this.options.radius) - coords.y) * 180 / Math.PI;
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
        console.log("onMouseDown")
        e.preventDefault()

        // using a pointer to grab the exact listener upon removal
        this.boundMove = this.onMove.bind(this);
        document.body.addEventListener("mousemove", this.boundMove, false);
        this.boundMouseUp = this.onMouseUp.bind(this);
        document.body.addEventListener("mouseup", this.boundMouseUp, false);
    }

    onMouseUp(e) {
        console.log("onMouseUp")
        e.preventDefault();

        document.body.removeEventListener('mousemove', this.boundMove)
        document.body.removeEventListener('mouseup', this.boundMouseUp)
    }

    onTouchStart(e) {
        e.preventDefault()

        // using a pointer to grab the exact listener upon removal
        this.boundMove = this.onMove.bind(this);
        document.body.addEventListener("touchmove", this.boundMove, { passive: false });
        this.boundTouchEnd = this.onTouchEnd.bind(this);
        document.body.addEventListener("touchend", this.boundTouchEnd, false);
    }

    onTouchEnd(e) {
        e.preventDefault();

        document.body.removeEventListener('touchmove', this.boundMove)
        document.body.removeEventListener('touchend', this.boundTouchEnd)
    }
}

slider1 = new Slider({
    container: document.getElementById('sliders'),
    color: 'red',
    min: 0,
    max: 162,
    step: 2,
    radius: 200,
    label: 'Transportation'
});
slider1.init();

slider2 = new Slider({
    container: document.getElementById('sliders'),
    color: 'blue',
    min: 0,
    max: 1300,
    step: 10,
    radius: 165,
    label: 'Food'
});
slider2.init();

slider3 = new Slider({
    container: document.getElementById('sliders'),
    color: 'yellow',
    min: 0,
    max: 600,
    step: 20,
    radius: 130,
    label: 'Insurance'
});
slider3.init();
