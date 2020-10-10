class Slider {
    constructor(options) {
        this.options = options
        // calculating number of steps in a circle
        this.steps = Math.floor((this.options.max - this.options.min) / this.options.step);
        this.currentStep = 0;
        this.stepLength = 0;
        this.circleRadius = 0;
        this.circleLength = 0;

        this.init();
    }

    init() {
        this.drawSlider();
        this.createLabel();
        // setting the initial step
        this.setStep();
    }

    drawSlider() {
        let strokeWidth = 22;
        let strokeWidthHolder = 1.5;
        let dashWidth = 1.4;

        // actual circle radius, since the options one doesnt not factor in stroke
        this.circleRadius = this.options.radius - strokeWidth / 2;
        // circumference of the circle based on the actual radius
        this.circleLength = 2 * Math.PI * this.circleRadius;
        this.stepLength = this.circleLength / this.steps;

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute('class', 'slider');
        this.svg.setAttribute('height', this.options.radius * 2);
        this.svg.setAttribute('width', this.options.radius * 2);
        this.svg.setAttribute('viewBox', `0 0 ${this.options.radius * 2} ${this.options.radius * 2}`);
        this.svg.style.pointerEvents = 'none';
        this.options.container.appendChild(this.svg);

        this.pathBackdrop = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.pathBackdrop.setAttribute('class', 'path_backdrop');
        this.pathBackdrop.setAttribute('d',
            `M${this.options.radius},${strokeWidth / 2} a${this.circleRadius},${this.circleRadius} 0 1,1 -1,0`);
        this.pathBackdrop.setAttribute('stroke-width', strokeWidth);
        // pointer event will be trigger when over a stroke of backdrop object
        this.pathBackdrop.style.pointerEvents = 'stroke';
        this.svg.appendChild(this.pathBackdrop);

        this.pathProgress = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.pathProgress.setAttribute('class', 'path_progress');
        this.pathProgress.setAttribute('d',
            `M${this.options.radius},${strokeWidth / 2} a${this.circleRadius},${this.circleRadius} 0 1,1 -1,0`);
        this.pathProgress.setAttribute('stroke', this.options.color);
        this.pathProgress.setAttribute('stroke-width', strokeWidth);
        this.pathProgress.setAttribute('stroke-dasharray', this.circleLength);
        this.svg.appendChild(this.pathProgress);

        this.pathDash = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.pathDash.setAttribute('class', 'path_dash');
        this.pathDash.setAttribute('d',
            `M${this.options.radius},${strokeWidth / 2} a${this.circleRadius},${this.circleRadius} 0 1,1 -1,0`);
        this.pathDash.setAttribute('stroke-width', strokeWidth);
        this.pathDash.setAttribute('stroke-dasharray', `${this.stepLength - dashWidth} ${dashWidth}`);
        this.pathDash.setAttribute('stroke-dashoffset', -dashWidth / 2);
        this.svg.appendChild(this.pathDash);

        this.valueHolder = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        this.valueHolder.setAttribute('class', 'value_holder');
        this.valueHolder.setAttribute('r', strokeWidth / 2 - strokeWidthHolder / 2);
        this.valueHolder.setAttribute('stroke-width', strokeWidthHolder);
        this.valueHolder.style.pointerEvents = 'visiblePainted';
        this.svg.appendChild(this.valueHolder);

        this.svg.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.svg.addEventListener("touchstart", this.onTouchStart.bind(this), false);

        // adding gradient to holder
        let objLinearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');

        let intGradientId = 'gradient' + Math.floor(Math.random() * 10000);
        objLinearGradient.setAttribute('id', intGradientId);
        objLinearGradient.setAttribute('x1', 1);
        objLinearGradient.setAttribute('y1', 1);
        objLinearGradient.setAttribute('x2', 0);
        objLinearGradient.setAttribute('y2', 0);
        this.svg.appendChild(objLinearGradient);

        let objGradientStartAt = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        objGradientStartAt.setAttribute('offset', '0%');
        objGradientStartAt.setAttribute('stop-color', 'white');
        objLinearGradient.appendChild(objGradientStartAt);

        let objGradientEndAt = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        objGradientEndAt.setAttribute('offset', '100%');
        objGradientEndAt.setAttribute('stop-color', '#EAEAEA');
        objLinearGradient.appendChild(objGradientEndAt);

        this.valueHolder.setAttribute('fill', `url(#${intGradientId})`);
    }

    createLabel() {
        let labels = document.getElementById('labels');
        let label = document.createElement("div");
        label.setAttribute('class', 'label');
        labels.appendChild(label);

        let value = document.createElement("div");
        value.setAttribute('class', 'value');
        value.innerHTML = "$";
        label.appendChild(value);

        let colorBox = document.createElement("div");
        colorBox.setAttribute('class', 'color_box')
        colorBox.style.backgroundColor = this.options.color;
        label.appendChild(colorBox);

        let labelText = document.createElement("div");
        labelText.setAttribute('class', 'label_text');
        labelText.innerHTML = this.options.label;
        label.appendChild(labelText);

        this.valueSpan = document.createElement("span");
        value.appendChild(this.valueSpan);
    }

    setStep() {
        this.pathProgress.setAttribute('stroke-dashoffset', this.stepLength * (this.steps - this.currentStep));

        this.valueSpan.innerHTML = this.options.min + this.currentStep * this.options.step;

        // if this is the last step, we want to set the position of the holder at the starting point (decimal points)
        if (this.currentStep === this.steps) {
            this.valueHolder.setAttribute('transform',
                `translate(${this.pathDash.getPointAtLength(0).x},${this.pathDash.getPointAtLength(0).y})`);
        } else {
            // getPointAtLength returns the point at a given distance along the path
            this.valueHolder.setAttribute('transform',
                `translate(${this.pathDash.getPointAtLength(this.stepLength * this.currentStep).x},${this.pathDash.getPointAtLength(this.stepLength * this.currentStep).y})`);
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
        if (e.type === 'touchstart' || e.type === 'touchend' || e.type === 'touchmove') {
            coords.x = e.touches[0].clientX;
            coords.y = e.touches[0].clientY;
        } else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove') {
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
        e.preventDefault();
        // we want the pointer event to trigger anywhere on svg
        this.svg.style.pointerEvents = 'visiblePainted';

        // using a pointer to grab the exact listener upon removal
        this.boundMove = this.onMove.bind(this);
        document.body.addEventListener("mousemove", this.boundMove, false);
        this.boundMouseUp = this.onMouseUp.bind(this);
        document.body.addEventListener("mouseup", this.boundMouseUp, false);

        // in case the pointer doesnt move, we want to trigger it manually
        this.onMove(e);
    }

    onMouseUp(e) {
        e.preventDefault();
        // after mouse is up, we once again only want to trigger pointer on stroke of backdrop
        this.svg.style.pointerEvents = 'none';

        document.body.removeEventListener('mousemove', this.boundMove)
        document.body.removeEventListener('mouseup', this.boundMouseUp)
    }

    onTouchStart(e) {
        e.preventDefault();
        this.svg.style.pointerEvents = 'visiblePainted';

        // using a pointer to grab the exact listener upon removal
        this.boundMove = this.onMove.bind(this);
        document.body.addEventListener("touchmove", this.boundMove, { passive: false });
        this.boundTouchEnd = this.onTouchEnd.bind(this);
        document.body.addEventListener("touchend", this.boundTouchEnd, false);

        this.onMove(e);
    }

    onTouchEnd(e) {
        e.preventDefault();
        this.svg.style.pointerEvents = 'none';

        document.body.removeEventListener('touchmove', this.boundMove)
        document.body.removeEventListener('touchend', this.boundTouchEnd)
    }
}

let sliders = [
    {
        container: document.getElementById('sliders'),
        color: '#796087',
        min: 150,
        max: 312,
        step: 2,
        radius: 200,
        label: 'Transportation'
    }, {
        container: document.getElementById('sliders'),
        color: '#5896cb',
        min: 0,
        max: 1300,
        step: 10,
        radius: 165,
        label: 'Food'
    }, {
        container: document.getElementById('sliders'),
        color: '#62b64c',
        min: 0,
        max: 595,
        step: 35,
        radius: 130,
        label: 'Insurance'
    }, {
        container: document.getElementById('sliders'),
        color: '#f09553',
        min: 20,
        max: 100,
        step: 2,
        radius: 95,
        label: 'Entertainment'
    }, {
        container: document.getElementById('sliders'),
        color: '#f26268',
        min: 0,
        max: 2000,
        step: 50,
        radius: 60,
        label: 'Health care'
    }
];

sliders.forEach(options => {
    new Slider(options);
});

