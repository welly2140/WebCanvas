const canvas = document.querySelector("canvas");
const toolBtns = document.querySelectorAll(".tool");
const sizeSlider = document.querySelector("#size-slider");
const clearCanvas = document.querySelector(".clear-canvas");
const saveImg = document.querySelector(".save-img");
const image_input= document.querySelector(".image_input");
const ctx = canvas.getContext("2d");

//全域變數宣告
let prevMouseX, prevMouseY, snapshot;
let isDrawing = false;
let selectedTool = "brush";
let brushWidth = 5;
let selectedColor = "#000";

//text宣告
var word_size = document.getElementById("word_size");
var word_type = document.getElementById("word_type");
var appear_size, appear_type;
appear_size = word_size.value;
appear_type = word_type.value;

//預設游標為筆刷
document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_pen.png'), auto";

//紀錄每一步
var cPushArray = new Array();
var cStep = -1;
var mousePressed = false;
function cPush() {
    cStep++;
    if (cStep < cPushArray.length) { cPushArray.length = cStep; }
    cPushArray.push(canvas.toDataURL());
}
function cUndo() {
    if (cStep > 0) {
        cStep--;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); }
    }
}
function cRedo() {
    if (cStep < cPushArray.length-1) {
        cStep++;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); }
    }
}

//設定初始畫布
const setCanvasBackground = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cPush();
}
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

//畫六種圖形
const drawRect = (e) => {
    ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}
const draw_full_rectangle = (e) => {
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}
const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    ctx.stroke();
}
const draw_full_circle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    ctx.fill();
}
const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    ctx.stroke();
}
const draw_full_triangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    ctx.fill();
}

let startPosition = {x: 0, y: 0};
let lineCoordinates = {x: 0, y: 0};
const getClientOffset = (event) => {
    const {pageX, pageY} = event.touches ? event.touches[0] : event;
    const x = pageX - canvas.offsetLeft;
    const y = pageY - canvas.offsetTop;
    return {x,y} 
}
const drawline = (e) => {
    ctx.beginPath();
    ctx.moveTo(startPosition.x, startPosition.y);
    ctx.lineTo(lineCoordinates.x, lineCoordinates.y);
    ctx.stroke();
}
const mouseDownListener = (event) => {
    startPosition = getClientOffset(event);
    isDrawStart = true;
 }
canvas.addEventListener('mousedown', mouseDownListener);

//偵測開始畫圖
const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

//輸入text
var font = appear_size + ' ' + appear_type;
function text(){
    var hasInput = false;
    canvas.onclick = function(e) {
        if (hasInput) return;
        if(selectedTool === "text"){
            addInput(e.clientX, e.clientY);
        }
    }
    function addInput(x, y) {
        var input = document.createElement('input');
        input.type = 'text';
        input.style.position = 'fixed';
        input.style.left = x + 'px';
        input.style.top = y + 'px';
        input.onkeydown = handleEnter;
        document.body.appendChild(input);
        input.focus();
        hasInput = true;
    }
    function handleEnter(e) {
        var keyCode = e.keyCode;
        if (keyCode === 13) {
            drawText(this.value, parseInt(this.style.left, 10), parseInt(this.style.top, 10));
            document.body.removeChild(this);
            hasInput = false;
            cPush();
        }
    }
    function drawText(txt, x, y) {
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.font = font;
        ctx.fillStyle = selectedColor;
        ctx.fillText(txt, x - 100, y - 35);
    }
}

//依選的工具執行不同函式
const drawing = (e) => {
    if(!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);
    if(selectedTool === "brush") {
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
    else if(selectedTool === "eraser"){
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
    } 
    else if(selectedTool === "line"){
        ctx.globalCompositeOperation = 'source-over'
        lineCoordinates = getClientOffset(event);
        drawline(e);
    }
    else if(selectedTool === "rectangle"){
        ctx.globalCompositeOperation = 'source-over'
        drawRect(e);
    } else if(selectedTool === "circle"){
        ctx.globalCompositeOperation = 'source-over'
        drawCircle(e);
    } 
    else if(selectedTool === "triangle"){
        ctx.globalCompositeOperation = 'source-over'
        drawTriangle(e);
    }
    else if(selectedTool === "full_rectangle"){
        ctx.globalCompositeOperation = 'source-over'
        draw_full_rectangle(e);
    }
    else if(selectedTool === "full_circle"){
        ctx.globalCompositeOperation = 'source-over'
        draw_full_circle(e);
    }
    else if(selectedTool === "full_triangle"){
        ctx.globalCompositeOperation = 'source-over'
        draw_full_triangle(e);
    }
    else{
        text();
    }
}

//偵測按鈕點擊接換工具
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        if(selectedTool === "brush") {
            document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_pen.png'), auto";
        }
        else if(selectedTool === "eraser"){
            document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_eraser.png'), auto";
        } 
        else if(selectedTool === "line"){
            document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_line.png'), auto";
        }
        else if(selectedTool === "rectangle"){
            document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_rectangle.png'), auto";
        } 
        else if(selectedTool === "circle"){
            document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_circle.png'), auto";
        } 
        else if(selectedTool === "triangle"){
            document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_triangle.png'), auto";
        }
        else if(selectedTool === "full_rectangle"){
            document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_full_rectangle.png'), auto";
        }
        else if(selectedTool === "full_circle"){
            document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_full_circle.png'), auto";
        }
        else if(selectedTool === "full_triangle"){
            document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_full_triangle.png'), auto";
        }
        else{
            document.getElementsByTagName("body")[0].style.cursor = "url('./UI/paint_ui/mouse_text.png'), auto";
        }
    });
});

//偵測切換字體及字型大小選項
word_size.addEventListener("click", () => {
    appear_size = word_size.value;
    font = appear_size + ' ' + appear_type;
});
word_type.addEventListener("click", () => {
    appear_type = word_type.value;
    font = appear_size + ' ' + appear_type;
});

//偵測切換筆刷大小
sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

//清空畫布
clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
});

//上傳圖片
image_input.addEventListener("change", function(e){
    if(e.target.files) {
        let imageFile = e.target.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = function (e) {
          var myImage = new Image();
          myImage.src = e.target.result;
          myImage.onload = function(ev) {
            canvas.width = myImage.width;
            canvas.height = myImage.height;
            ctx.drawImage(myImage,0,0);
            let imgData = canvas.toDataURL("image/jpeg",0.75);
            cPush();
          }
        }
      }
});

//下載圖片
saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

//偵測滑鼠狀態
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mousedown", function(event){
    mousePressed = true;
});
canvas.addEventListener("mouseup", function(event){
    if (mousePressed) {
        mousePressed = false;
        cPush();
    }
});
canvas.addEventListener("mouseup", () => isDrawing = false);

//調色盤
var barTextEl = document.getElementById('colorBarTextId');
var platterTextEl = document.getElementById('platterTextId');
var Platter = (function () {
    function Platter() {
        this.sR = 0;
        this.sG = 255;
        this.sB = 255;
        this.canvas = document.getElementById('platter');
        this.ctx = this.canvas.getContext('2d');
        this.xScale = Math.ceil(this.canvas.width / 128);
        this.yScale = Math.ceil(this.canvas.height / 128);
        this.scaleWidth = this.canvas.width / this.xScale;
        this.scaleHeight = this.canvas.height / this.yScale;
        var gCanvas = document.getElementById('global');
        var gCtx = gCanvas.getContext('2d');
        var gRadius = gCanvas.width > gCanvas.height ? gCanvas.height / 2 : gCanvas.width / 2;
        this.gCanvas = gCanvas;
        this.gCtx = gCtx;
        this.gRadius = gRadius;
        this.updateGlobal("#000000");
        var minX = this.canvas.offsetLeft - gCanvas.width / 2;
        var maxX = minX + this.canvas.offsetWidth;
        var minY = this.canvas.offsetTop - gCanvas.height / 2;
        var maxY = minY + this.canvas.offsetHeight;
        var pLeft = this.canvas.offsetLeft;
        var pTop = this.canvas.offsetTop;
        var that = this;
        var isApp = 'ontouchstart' in window;
        if (isApp) {
            this.canvas.ontouchstart = handleTouchEvent;
            gCanvas.ontouchstart = handleTouchEvent;
        } 
        else {
            this.canvas.onmousedown = handleMouseEvent;
            gCanvas.onmousedown = handleMouseEvent;
        }
        function handleMouseEvent(e) {
            dragGlobal(e);
            document.onmousemove = function (e) {
                dragGlobal(e);
                e.preventDefault ? e.preventDefault() : (e.returnValue = false)
            }
            document.onmouseup = function (e) {
                document.onmousemove = null;
                document.onmouseup = null;
            }
        }
        function handleTouchEvent(e) {
            dragGlobal(e.touches[0]);
            document.ontouchmove = function (e) {
                dragGlobal(e.changedTouches[0]);
            }
            document.ontouchend = function (e) {
                document.ontouchmove = null;
                document.ontouchend = null;
            }
        }
        function dragGlobal(e) {
            if ('hidden' === gCanvas.style.visibility) {
                gCanvas.style.visibility = 'visible';
            }
            var x = e.clientX - gCanvas.width / 2;
            var y = e.clientY - gCanvas.height / 2;
            if (x < minX) {
                x = minX;
            }
            else if (x > maxX) {
                x = maxX;
            }
            if (y < minY) {
                y = minY;
            }
            else if (y > maxY) {
                y = maxY;
            }
            gCanvas.style.left = x + "px";
            gCanvas.style.top = y + "px";
            var cx = x - pLeft + gCanvas.width / 2;
            var cy = y - pTop + gCanvas.height / 2;
            var col = that.getColor(cx, cy);
            that.pickPoint = {x: cx, y: cy};
            selectedColor = "#"+(col.r).toString(16)+(col.g).toString(16)+(col.b).toString(16);
            var maxCol = col.r > col.g ? col.r : (col.g > col.b ? col.g : col.b) + 1;
            if (maxCol > 128) {
                if ("#000000" !== gCtx.strokeStyle) {
                    that.updateGlobal("#000000");
                }
            } else {
                if ("#dddddd" !== gCtx.strokeStyle) {
                    that.updateGlobal("#dddddd");
                }
            }
        }
    }
    Platter.prototype.updateGlobal = function (color) {
        var gCanvas = this.gCanvas;
        var gCtx = this.gCtx;
        var gRadius = this.gRadius;
        gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
        gCtx.strokeStyle = color;
        gCtx.beginPath();
        gCtx.arc(gRadius, gRadius, gRadius, 0, Math.PI * 2);
        gCtx.stroke();
    }
    Platter.prototype.draw = function () {
        var cw = this.canvas.width;
        var ch = this.canvas.height;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var w = this.scaleWidth;
        var h = this.scaleHeight;
        for (var x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {
                var col = this.getScaleColor(x, y);
                var color = 'rgb(' + col.r + ',' + col.g + ',' + col.b + ')';
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x * xScale, y * yScale, xScale, yScale);
            }
        }
    }

    Platter.prototype.getScaleColor = function (scaleX, scaleY) {
        var w = this.scaleWidth;
        var h = this.scaleHeight;
        var r = 0;
        var g = 0;
        var b = 0;
        var sR = this.sR;
        var sG = this.sG;
        var sB = this.sB;
        var mid = sR > sG ? sR : sG;
        var max = mid > sB ? mid : sB;
        mid = mid > sB ? sB : mid;
        var min = sR + sG + sB - mid - max;
        var oneMaxXV = (255 - max) / w;
        var oneMidXV = (255 - mid) / w;
        var oneMinXV = (255 - min) / w;
        var midColor = 255 - scaleX * oneMidXV;
        var minColor = 255 - scaleX * oneMinXV;
        var maxColor = 255 - scaleX * oneMaxXV;
        var oneYTemp = midColor / h;
        var midC = Math.floor(midColor - scaleY * oneYTemp);
        oneYTemp = minColor / h;
        var minC = Math.floor(minColor - scaleY * oneYTemp);
        oneYTemp = maxColor / h;
        var maxC = Math.floor(maxColor - scaleY * oneYTemp);
        sR === max ? (r = maxC) : (sR === mid ? (r = midC) : (r = minC));
        sG === max ? (g = maxC) : (sG === mid ? (g = midC) : (g = minC));
        sB === max ? (b = maxC) : (sB === mid ? (b = midC) : (b = minC));
        return {r: r, g: g, b: b}
    }
    Platter.prototype.getColor = function (x, y) {
        return this.getScaleColor(x / this.xScale, y / this.yScale);
    }
    Platter.prototype.update = function (rgb) {
        this.sR = rgb.r;
        this.sG = rgb.g;
        this.sB = rgb.b;
        this.draw();
    }
    Platter.prototype.getPickColor = function () {
        if (this.pickPoint) {//選中的座標
            return this.getColor(this.pickPoint.x, this.pickPoint.y);
        }
        return undefined;
    }
    return Platter;
}());
var BarHelper = (function () {
    function BarHelper() {
        this.canvas = document.getElementById('colorBar');
        this.ctx = this.canvas.getContext('2d');
        this.pickLineWidth = 10;
        this.rainWidth = this.canvas.width - 2 * this.pickLineWidth;
        this.rainHeight = this.canvas.height - this.pickLineWidth;
        var top = this.canvas.offsetTop;
        var that = this;
        var isApp = 'ontouchstart' in window;
        if (isApp) {
            this.canvas.ontouchstart = handleTouchEvent;
        } 
        else {
            this.canvas.onmousedown = handleMouseEvent;
        }
        function handleMouseEvent(e) {
            dragLine(e);
            document.onmousemove = function (e) {
                dragLine(e);
                e.preventDefault ? e.preventDefault() : (e.returnValue = false)
            }
            document.onmouseup = function (event) {
                document.onmousemove = null;
                document.onmouseup = null;
            }
        }
        function handleTouchEvent(e) {
            dragLine(e.touches[0]);
            document.ontouchmove = function (e) {
                dragLine(e.changedTouches[0]);
            }
            document.ontouchend = function (e) {
                document.ontouchmove = null;
                document.ontouchend = null;
            }
        }
        function dragLine(e) {
            var y = e.clientY - top;
            that.updatePickLine(y);
            var col = that.getPickColor();
            var color = 'rgb(' + col.r + ',' + col.g + ',' + col.b + ")";
            platter.update(col);
            var col = platter.getPickColor();
            if (col) {
                selectedColor = "#"+(col.r).toString(16)+(col.g).toString(16)+(col.b).toString(16);
            }
        }
    }
    BarHelper.prototype.draw = function () {
        this.drawRain();
    }
    BarHelper.prototype.drawRain = function () {
        var w = this.rainWidth;
        var h = this.rainHeight;
        var ctx = this.ctx;
        var offY = this.pickLineWidth / 2;
        for (var y = 0; y <= h; y++) {
            var col = this.getColor(y);
            var color = 'rgb(' + col.r + ',' + col.g + ',' + col.b + ")";
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(this.pickLineWidth, y + offY);
            ctx.lineTo(this.pickLineWidth + w, y + offY);
            ctx.stroke();
        }
    }
    BarHelper.prototype.getColor = function (y) {
        var h = this.rainHeight;
        var oneYV = 255 / (h / 6);
        var r = 255;
        var g = 0;
        var b = 0;
        if (y <= h / 3) {
            if (y <= h / 6) {
                b = Math.floor(oneYV * y);
                if (b > 255) {
                    b = 255;
                }
                r = 255;
            }
            else {
                r = 255 - Math.floor(oneYV * (y - h / 6));
                if (r < 0) {
                    r = 0;
                }
                b = 255;
            }
            g = 0;
        }
        else if (y <= 2 * h / 3) {
            if (y < 3 * h / 6) {
                g = Math.floor(oneYV * (y - 2 * h / 6));
                if (g > 255) {
                    g = 255;
                }
                b = 255;
            } else {
                b = 255 - Math.floor(oneYV * (y - 3 * h / 6));
                if (b < 0) {
                    b = 0;
                }
                g = 255;
            }
            r = 0;
        }

        else {
            if (y < 5 * h / 6) {
                r = Math.floor(oneYV * (y - 4 * h / 6));
                if (r > 255) {
                    r = 255;
                }
                g = 255;
            } else {
                g = 255 - Math.floor(oneYV * (y - 5 * h / 6));
                if (g < 0) {
                    g = 0;
                }
                r = 255;
            }
            b = 0;
        }
        return {r: r, g: g, b: b};
    }
    BarHelper.prototype.drawPickLine = function (y) {
        this.pickLineY = y;
        var w = this.pickLineWidth;
        var h = this.canvas.height - w;
        var ch = this.canvas.height;
        var cw = this.canvas.width;
        var ctx = this.ctx;
        ctx.clearRect(0, 0, w, ch);
        ctx.clearRect(cw - w, 0, w, ch);
        ctx.fillStyle = '#ffaaaa';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y + w / 2);
        ctx.lineTo(0, y + w);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cw, y);
        ctx.lineTo(cw - w, y + w / 2);
        ctx.lineTo(cw, y + w);
        ctx.fill();
    }
    BarHelper.prototype.getPickColor = function () {
        return this.getColor(this.pickLineY);
    }
    BarHelper.prototype.updatePickLine = function (y) {
        var w = this.pickLineWidth;
        var h = this.canvas.height;
        var maxY = h - w;
        var minY = 0;
        if (y < minY) {
            y = minY;
        }
        else if (y > maxY) {
            y = maxY;
        }
        this.drawPickLine(y);
    }
    return BarHelper;
}());
var platter = new Platter();
platter.draw();
var barHelper = new BarHelper();
barHelper.draw();