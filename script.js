let model;

var canvasWidth           	= 250;
var canvasHeight 			= 250;
var canvasStrokeStyle		= "#002171";
var canvasLineJoin			= "round";
var canvasLineWidth       	= 16;
var canvasBackgroundColor 	= "#e8e8e8";
var canvasId              	= "canvas";

var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

var canvasBox = document.getElementById('canvas_box');
var canvas    = document.createElement("canvas");

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
  canvas = G_vmlCanvasManager.initElement(canvas);
}

ctx = canvas.getContext("2d");


// MOUSE DOWN fun.
$("#canvas").mousedown(function(e) {
	var rect = canvas.getBoundingClientRect();
	var mouseX = e.clientX- rect.left;;
	var mouseY = e.clientY- rect.top;
	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();
});


// TOUCH START fun.
canvas.addEventListener("touchstart", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}

	var rect = canvas.getBoundingClientRect();
	var touch = e.touches[0];

	var mouseX = touch.clientX - rect.left;
	var mouseY = touch.clientY - rect.top;

	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();

}, false);


// MOUSE MOVE fun.
$("#canvas").mousemove(function(e) {
	if(drawing) {
		var rect = canvas.getBoundingClientRect();
		var mouseX = e.clientX- rect.left;;
		var mouseY = e.clientY- rect.top;
		addUserGesture(mouseX, mouseY, true);
		drawOnCanvas();
	}
});


// TOUCH MOVE fun.
canvas.addEventListener("touchmove", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	if(drawing) {
		var rect = canvas.getBoundingClientRect();
		var touch = e.touches[0];

		var mouseX = touch.clientX - rect.left;
		var mouseY = touch.clientY - rect.top;

		addUserGesture(mouseX, mouseY, true);
		drawOnCanvas();
	}
}, false);

// MOUSE UP fun.
$("#canvas").mouseup(function(e) {
	drawing = false;
});


// TOUCH END fun.
canvas.addEventListener("touchend", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	drawing = false;
}, false);


// MOUSE LEAVE fun.
$("#canvas").mouseleave(function(e) {
	drawing = false;
});


// TOUCH LEAVE fun.
canvas.addEventListener("touchleave", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	drawing = false;
}, false);


// ADD CLICK fun.
function addUserGesture(x, y, dragging) {
	clickX.push(x);
	clickY.push(y);
	clickD.push(dragging);
}


// RE DRAW fun.
function drawOnCanvas() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctx.strokeStyle = canvasStrokeStyle;
	ctx.lineJoin    = canvasLineJoin;
	ctx.lineWidth   = canvasLineWidth;

	for (var i = 0; i < clickX.length; i++) {
		ctx.beginPath();
		if(clickD[i] && i) {
			ctx.moveTo(clickX[i-1], clickY[i-1]);
		} else {
			ctx.moveTo(clickX[i]-1, clickY[i]);
		}
		ctx.lineTo(clickX[i], clickY[i]);
		ctx.closePath();
		ctx.stroke();
	}
}


// CLEAR CANVAS fun.
$("#clear-button").click(async function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	clickX = new Array();
	clickY = new Array();
	clickD = new Array();
	$(".prediction-text").empty();
	$("#result_box").addClass('d-none');
});


// loader for cnn model
async function loadModel() {
  model = undefined;
  model = await tf.loadLayersModel("models/model.json");
}

loadModel();


// preprocess the canvas
function preprocessCanvas(image) {
	let tensor = tf.browser.fromPixels(image)
		.resizeNearestNeighbor([28, 28])
		.mean(2)
		.expandDims(2)
		.expandDims()
		.toFloat();
	console.log(tensor.shape);
	return tensor.div(255.0);
}


// predict function 
$("#predict-button").click(async function () {

	var imageData = canvas.toDataURL();
	let tensor = preprocessCanvas(canvas);
	let predictions = await model.predict(tensor).data();
	let results = Array.from(predictions);
	$("#result_box").removeClass('d-none');
	displayLabel(results);
	console.log(results);
});

function displayLabel(data) {
	var max = data[0];
    var maxIndex = 0;
    for (var i = 1; i < data.length; i++) {
        if (data[i] > max) {
            maxIndex = i;
            max = data[i];
        }
    }
	$(".prediction-text").html("Liczba to: <b>"+maxIndex+"</b> z <b>"+( max*100 ).toFixed(2)+"%</b> pewności")
}

