'use strict'

// TODO: format result resistor values
// TODO: input validation

const scaleE24 = Array(1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1);
const scaleE96 = Array(1, 1.02, 1.05, 1.07, 1.1, 1.13, 1.15, 1.18, 1.21, 1.24, 1.27, 1.3, 1.33, 1.37, 1.4, 1.43, 1.47, 1.5, 1.54, 1.58, 1.62, 1.65, 1.69, 1.74, 1.78, 1.82, 1.87,1.91,1.96,2,2.05,2.1,2.15,2.21,2.26,2.32,2.37,2.43,2.49,2.55,2.61,2.67,2.74,2.8,2.87,2.94,3.01,3.09,3.16,3.24,3.32,3.4,3.48,3.57,3.65,3.74,3.83,3.92,4.02,4.12,4.22,4.32,4.42,4.53,4.64,4.75,4.87,4.99,5.11,5.23,5.36,5.49,5.62,5.76,5.9,6.04,6.19,6.34,6.49,6.65,6.81,6.98,7.15,7.32,7.5,7.68,7.87,8.06,8.25,8.45,8.66,8.87,9.09,9.31,9.53,9.76);

function update() {
	const vIn = vInInput.value * 1.0;
	const vOut = vOutInput.value * 1.0;
	const rMin = parseUnitPrefix(rMinInput.value) * 1.0;
	const rMax = parseUnitPrefix(rMaxInput.value) * 1.0;
	const errorMax = errorMaxInput.value * 1.0;

//	console.log('vIn:', vIn, vOut, rMin, rMax, errorMax);


/*	$scope.vIn = parseFloat($scope.vIn);
	if (isNaN($scope.vIn)) { 
		$scope.vInError = 'Vin must be number!'; 
		return;
	}

	$scope.vOut = parseFloat($scope.vOut);
	if (isNaN($scope.vOut)) { 
		$scope.vOutError = 'Vout must be number!'; 
		return;
	}
	
	if ($scope.vOut > $scope.vIn) { 
		$scope.vInError = $scope.vOutError = 'Vin must be bigger than Vout!'; 
		return; 
	}
	$scope.vInError = '';
	$scope.vOutError = '';
	
	// TODO: rMin
	// TODO: rMax

	$scope.errorMax = parseFloat($scope.errorMax);
	if (isNaN($scope.errorMax) || ($scope.errorMax < 0) || ($scope.errorMax > 100)) {
		$scope.errorMaxError = 'Error max must be between 0 & 100!';
		return;
	}
	$scope.errorMaxError = '';
*/

	var scale;
	switch(document.getElementById('scaleSelect').value) {
		case 'e24':
			scale = scaleE24;
			break;
		case 'e96':
			scale = scaleE96;
			break;
	}

	const baseMin = Math.round(Math.log(rMin) / Math.LN10);
	const baseMax = Math.round(Math.log(rMax) / Math.LN10);

	let resistors = new Array();
	for (var r = baseMin; r < baseMax; r++) {
		for (var j = 0; j < scale.length; j++) {
			const t = scale[j] * Math.pow(10, r);
			if ((t >= rMin) & (t <= rMax))
				resistors.push(t);
		}
	}			

	let results = Array();
	for (let r1 of resistors) {
		for (let r2 of resistors) {
			const v = vIn * (r2 / (r1 + r2)); // vout = vin * (r2 / (r1 + r2))
			const error = Math.abs(v / vOut * 100 - 100);
			if (error <= errorMax) {
				results.push({
					r1 : r1,
					r2 : r2,
					error : error,
					vout : v
				});
			}
		}
	}
	results.sort(function(a, b) { return a.error - b.error; });

	let resultsTbody = document.getElementById('results-tbody');
	while (resultsTbody.rows.length > 0)
		resultsTbody.deleteRow(0);

	for (let result of results) {
		let row = document.createElement('tr');
		resultsTbody.appendChild(row);

		let cell = document.createElement('td');
		row.appendChild(cell);
		cell.classList.add('text-end');
		cell.innerHTML = formatValue(result.r1) + '&#x2126;';

		cell = document.createElement('td');
		row.appendChild(cell);
		cell.classList.add('text-end');
		cell.innerHTML = formatValue(result.r2) + '&#x2126;';

		cell = document.createElement('td');
		row.appendChild(cell);
		cell.classList.add('text-end');
		cell.innerHTML = result.vout.toFixed(2) + 'V';

		cell = document.createElement('td');
		row.appendChild(cell);
		cell.classList.add('text-end');
		cell.innerHTML = result.error.toFixed(2) + '%';
	}
}

function formatValue(v) {
	if (v < 1000) {
		return v.toFixed(0);
	} else if (v < 1000000) {
		return (Math.round(v / 1000 * 100) / 100) + 'k';
	} else
		return (Math.round(v / 1000000 * 100) / 100) + 'M';
}

function parseUnitPrefix(value) {
	const re = new RegExp('([0-9]+)(M?)(k?)','i');
	const rer = re.exec(value);
	var result = rer[1];
	if (rer[2]) 
		result *= 1000000;
	else if (rer[3]) 
		result *= 1000;
	return result;
}

window.onload = function () {
	update();
}
