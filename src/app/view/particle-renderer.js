class ParticleRenderer {

	constructor(element, padding = 5, factor = 1, xMaxInit = 20, yMaxInit = 20) {
		this.element = element;
		this.canvas = document.getElementById(element);
		this.ctx = this.canvas.getContext('2d');

		this.padding = padding;
		this.xMax = xMaxInit * factor;
		this.yMax = yMaxInit * factor;
		this.factor = factor;

		this.resizeOnNextRender = false;

		//Resize the canvas to improve the quality of the render on retina devices
		this._resizeCanvas();

		//Scale canvas to always show the full user path
		this._scaleCanvas();
	}

	/**
	 * Render a particle set
	 * @param  {ParticleSet} particleSet
	 * @return {ParticleRenderer}
	 */
	render(particleSet) {

		this.clearCanvas();

		if (this.resizeOnNextRender) {
			this._increaseCanvas();
			this.resizeOnNextRender = false;
		}

		const best = particleSet.bestParticle();

		particleSet.particles().forEach((p) => {

			if (p === best) {
				return;
			}

			const resize = this._plotUserTrace(p.user, '#A8A8A8', 0.05);

			if (resize) {
				this.resizeOnNextRender = true;
			}
		});

		//Plot any landmark init filters
		particleSet.landmarkInitSet.particleSetMap.forEach((landmarkPf) => {
			landmarkPf.particles.forEach((p) => {
				this._plotObject(p, '#5FE653');
			});
		});

		//Plot the best user trace and the landmarks
		this._plotUserTrace(best.user, '#24780D', 0.1);
		best.landmarks.forEach((landmark) => {
			this._plotObject(landmark, '#B52B2B');
		});

		return this;
	}

	/**
	 * Clear the canvas
	 * @return {ParticleRenderer}
	 */
	clearCanvas() {

		//Save transformation matrix
		this.ctx.save();

		//Reset the transform to clear the whole canvas
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		//Restore transformation
		this.ctx.restore();

		return this;
	}

	/**
	 * Plot a user object on the canvas
	 * @param  {User} user
	 * @param  {String} color
	 * @param  {float} Range of the sensor
	 * @return {Boolean} True if the canvas has to resize
	 */
	_plotUserTrace(user, color = '#A8A8A8', lineWidth = 0.1) {

		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = lineWidth;
		this.ctx.fillStyle = '#960E0E';
		this.ctx.strokeStyle = color;

		this.ctx.beginPath();

		let resize = false;

		//@todo Find optimisation to only plot parts that have not yet
		//been plotted. We cannot use currentValues() as some particles
		//may have died out while their paths are still present in other particles.
		user.trace.values().forEach(({x, y, theta}, i) => {

			const tX = this._tx(x);
			const tY = this._ty(y);

			if (i === 0) {
				this.ctx.moveTo(tX, tY);
			}
			else {
				this.ctx.lineTo(tX, tY);
			}

			if (this._isOutOfBounds(x, y)) {
				resize = true;
			}
		});

		this.ctx.stroke();
		this.ctx.closePath();

		return resize;
	}

	/**
	 * Checks whether a x,y coordinate is out of bounds
	 * @param  {Number}  x
	 * @param  {Number}  y
	 * @return {Boolean}
	 */
	_isOutOfBounds(x, y) {

		const tX = this._tx(x);
		const tY = this._ty(y);

		return tX < this.padding || tY < this.padding ||
			tX > (this.xMax - this.padding) || tY > (this.yMax - this.padding);
	}

	/**
	 * Resize the canvas for retina devices
	 * @return {void}
	 */
	_resizeCanvas() {

		const cs = window.getComputedStyle(this.canvas);
		const width = parseInt(cs.getPropertyValue('width'), 10);
		const height = parseInt(cs.getPropertyValue('height'), 10);

		//Calcuate a factor for the resolution
		//Use 1.99 scale on retina devices
		const resolutionFactor = window.devicePixelRatio && window.devicePixelRatio === 2 ? 1.99 : 1;

		//Make the canvas smaller with css
		this.canvas.width = width * resolutionFactor;
		this.canvas.height = height * resolutionFactor;
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
	}

	/**
	 * Scale the canvas to zoom in
	 * @return {void}
	 */
	_scaleCanvas() {

		const width = this.canvas.width;
		const height = this.canvas.height;

		//Calculate maximal possible scalefactor
		const scaleXMax = width / this.xMax;
		const scaleYMax = height / this.yMax;

		const scaleFactor = Math.min(scaleXMax, scaleYMax);

		//Recalculate the xMax and yMax as the screen is not square
		this.yMax = this.yMax * (scaleYMax / scaleFactor);
		this.xMax = this.xMax * (scaleXMax / scaleFactor);

		//Scale the canvas to translate coordinates to pixels
		this.ctx.scale(scaleFactor, scaleFactor);
	}

	_increaseCanvas() {
		const resizeFactor = 0.8;

		this.xMax = this.xMax * (1 / resizeFactor);
		this.yMax = this.yMax * (1 / resizeFactor);

		this.ctx.scale(resizeFactor, resizeFactor);
	}

	/**
	 * Translate x
	 * @param  {Number} x
	 * @return {Number}
	 */
	_tx(x) {
		return (x * this.factor) + (this.xMax / 2);
	}

	/**
	 * Translate y
	 * @param  {Number} y
	 * @return {Number}
	 */
	_ty(y) {
		return this.yMax - ((y * this.factor) + (this.yMax / 2));
	}

	/**
	 * Plot a object
	 * @param {Object} objects A objects with at least an x,y value
	 * @param {string} fillStyle
	 */
	_plotObject(object, fillStyle = '#000000', size = 0.35) {
		this.ctx.fillStyle = fillStyle;

		//Compensate for landmark size
		var x = this._tx(object.x) - (0.35 * size);
		var y = this._ty(object.y) - (0.35 * size);

		this.ctx.fillRect(x, y, size, size);

		if(object.name !== undefined) {
			this.ctx.font = "1px serif";
			this.ctx.fillStyle = "#000000";
			this.ctx.fillText(object.name, x, y);
		}
	}

}

export default ParticleRenderer;