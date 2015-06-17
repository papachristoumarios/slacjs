/*
global module
*/

/**
 * General config for SLACjs
 * @type {Object}
 */
module.exports = {

	environment: 'development',

	exportData: true,

	/**
	 * Device orientation, set to false to unlock
	 * @see https://github.com/gbenvenuti/cordova-plugin-screen-orientation
	 */
	deviceOrientation: {
		android: 'portrait',
		ios: 'landscape'
	},

	particles: {
		N: 50,

		user: {
			defaultPose: {
				x: 0,
				y: 0,
				theta: 0
			},
			sdStep: 0.2,
			sdHeading: 0.1
		},

		init: {
			N: 500,
			sd: 1,
			randomN: 0,
			effectiveParticleThreshold: 250,
			maxVariance: 4
		}
	},

	pedometer: {
		stepSize: 0.5
	},

	landmarkConfig: {
		n: 2,
		txPower: -64,
		noise: 4,
		range: 20
	},

	sensor: {
		motion: {
			frequency: 100
		},
		rssi: {
			kalman: {
				R: 0.008,
				Q: 4
			},
			minMeasurements: 10
		}
	},

	ble: {
		frequency: 100,
		devicePrefix: 'LowBeacon'
	}
};