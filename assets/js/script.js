let image = document.getElementById("image");
let canvas = document.getElementById("imageCanvas");
let ctx = canvas.getContext("2d");

let startX, startY, endX, endY;
let isDrawing = false;
let scaleX = 1, scaleY = 1;
let selections = []; // Store all selections

let resizing = false, moving = false;
let resizeIndex = -1, moveIndex = -1;
let resizeHandle = "";
let offsetX = 0, offsetY = 0;

// Set up canvas size
function setupCanvas() {
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.style.display = "block";
    scaleX = image.naturalWidth / image.width;
    scaleY = image.naturalHeight / image.height;
    redrawSelections();
}

// Redraw all selections on canvas
function redrawSelections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    selections.forEach(selection => {
        ctx.fillStyle = selection.color + "80"; // 50% opacity
        ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
        ctx.strokeStyle = selection.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
    });
}

// Change cursor on hover over selection corners (for resizing)
canvas.addEventListener("mousemove", (e) => {
    let rect = canvas.getBoundingClientRect();
    let mouseX = (e.clientX - rect.left) * scaleX;
    let mouseY = (e.clientY - rect.top) * scaleY;
    let hover = false;

    selections.forEach((sel) => {
        let buffer = 5;
        // Bottom-left and top-right corners
        if (
            (mouseX >= sel.x - buffer && mouseX <= sel.x + buffer && mouseY >= sel.y + sel.height - buffer && mouseY <= sel.y + sel.height + buffer) ||
            (mouseX >= sel.x + sel.width - buffer && mouseX <= sel.x + sel.width + buffer && mouseY >= sel.y - buffer && mouseY <= sel.y + buffer)
        ) {
            canvas.style.cursor = "nesw-resize";
            hover = true;
        }
        // Top-left and bottom-right corners
        if (
            (mouseX >= sel.x - buffer && mouseX <= sel.x + buffer && mouseY >= sel.y - buffer && mouseY <= sel.y + buffer) ||
            (mouseX >= sel.x + sel.width - buffer && mouseX <= sel.x + sel.width + buffer && mouseY >= sel.y + sel.height - buffer && mouseY <= sel.y + sel.height + buffer)
        ) {
            canvas.style.cursor = "nwse-resize";
            hover = true;
        }
    });
    if (!hover && !moving) {
        canvas.style.cursor = "crosshair";
    }
});

// Mouse down: check for resizing, moving, or drawing a new selection
canvas.addEventListener("mousedown", (e) => {
    let rect = canvas.getBoundingClientRect();
    let mouseX = (e.clientX - rect.left) * scaleX;
    let mouseY = (e.clientY - rect.top) * scaleY;

    // Check for resizing first (priority over moving)
    for (let i = 0; i < selections.length; i++) {
        let sel = selections[i];
        let buffer = 5;
        if (
            mouseX >= sel.x - buffer && mouseX <= sel.x + buffer &&
            mouseY >= sel.y - buffer && mouseY <= sel.y + buffer
        ) {
            resizing = true;
            resizeIndex = i;
            resizeHandle = "top-left";
            return;
        } else if (
            mouseX >= sel.x + sel.width - buffer && mouseX <= sel.x + sel.width + buffer &&
            mouseY >= sel.y - buffer && mouseY <= sel.y + buffer
        ) {
            resizing = true;
            resizeIndex = i;
            resizeHandle = "top-right";
            return;
        } else if (
            mouseX >= sel.x - buffer && mouseX <= sel.x + buffer &&
            mouseY >= sel.y + sel.height - buffer && mouseY <= sel.y + sel.height + buffer
        ) {
            resizing = true;
            resizeIndex = i;
            resizeHandle = "bottom-left";
            return;
        } else if (
            mouseX >= sel.x + sel.width - buffer && mouseX <= sel.x + sel.width + buffer &&
            mouseY >= sel.y + sel.height - buffer && mouseY <= sel.y + sel.height + buffer
        ) {
            resizing = true;
            resizeIndex = i;
            resizeHandle = "bottom-right";
            return;
        }
    }

    // Next, check if the click is inside an existing selection (for moving)
    for (let i = 0; i < selections.length; i++) {
        let sel = selections[i];
        if (
            mouseX >= sel.x && mouseX <= sel.x + sel.width &&
            mouseY >= sel.y && mouseY <= sel.y + sel.height
        ) {
            moving = true;
            moveIndex = i;
            offsetX = mouseX - sel.x;
            offsetY = mouseY - sel.y;
            return;
        }
    }

    // Otherwise, start drawing a new selection
    isDrawing = true;
    startX = mouseX;
    startY = mouseY;
});

// Mouse move: update drawing, resizing, or moving actions
canvas.addEventListener("mousemove", (e) => {
    let rect = canvas.getBoundingClientRect();
    let mouseX = (e.clientX - rect.left) * scaleX;
    let mouseY = (e.clientY - rect.top) * scaleY;

    if (resizing) {
        let sel = selections[resizeIndex];
        if (resizeHandle === "top-left") {
            sel.width += sel.x - mouseX;
            sel.height += sel.y - mouseY;
            sel.x = mouseX;
            sel.y = mouseY;
        } else if (resizeHandle === "top-right") {
            sel.width = mouseX - sel.x;
            sel.height += sel.y - mouseY;
            sel.y = mouseY;
        } else if (resizeHandle === "bottom-left") {
            sel.width += sel.x - mouseX;
            sel.height = mouseY - sel.y;
            sel.x = mouseX;
        } else if (resizeHandle === "bottom-right") {
            sel.width = mouseX - sel.x;
            sel.height = mouseY - sel.y;
        }
        redrawSelections();
        // Update tag element position if available
        if (sel.tagElement) {
            sel.tagElement.style.left = `${(sel.x / scaleX) + canvas.offsetLeft}px`;
            sel.tagElement.style.top = `${(sel.y / scaleY) + canvas.offsetTop - 25}px`;
        }
        return;
    }

    if (moving) {
        let sel = selections[moveIndex];
        sel.x = mouseX - offsetX;
        sel.y = mouseY - offsetY;
        redrawSelections();
        // Update tag element position if available
        if (sel.tagElement) {
            sel.tagElement.style.left = `${(sel.x / scaleX) + canvas.offsetLeft}px`;
            sel.tagElement.style.top = `${(sel.y / scaleY) + canvas.offsetTop - 25}px`;
        }
        return;
    }

    if (isDrawing) {
        endX = mouseX;
        endY = mouseY;
        redrawSelections();
        ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
        ctx.fillRect(startX, startY, endX - startX, endY - startY);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
});

// Mouse up: finish drawing a new selection or stop resizing/moving
canvas.addEventListener("mouseup", () => {
    if (isDrawing) {
        isDrawing = false;
        let finalStartX = Math.min(startX, endX);
        let finalStartY = Math.min(startY, endY);
        let finalEndX = Math.max(startX, endX);
        let finalEndY = Math.max(startY, endY);
        let width = finalEndX - finalStartX;
        let height = finalEndY - finalStartY;

        let tagName = "label" + (selections.length + 1);
        let color = getRandomColor();

        // Create and store new selection object
        let newSelection = {
            x: finalStartX,
            y: finalStartY,
            width: width,
            height: height,
            tag: tagName,
            color: color
        };
        selections.push(newSelection);
        redrawSelections();

        // Create a floating tag element for the selection
        let tag = document.createElement("div");
        tag.className = "tag";
        tag.innerText = tagName;
        tag.style.background = color;
        tag.style.position = "absolute";
        tag.style.left = `${(finalStartX / scaleX) + canvas.offsetLeft}px`;
        tag.style.top = `${(finalStartY / scaleY) + canvas.offsetTop - 25}px`;
        document.getElementById("container").appendChild(tag);
        newSelection.tagElement = tag;

        // Create a list item for the selection (with editable name and delete button)
        let listItem = document.createElement("li");
        listItem.style.color = color;
        listItem.style.display = "flex";
        listItem.style.alignItems = "center";
        listItem.style.gap = "10px";

        let textBox1 = document.createElement("input");
        textBox1.type = "input";
        textBox1.value = tagName;
        textBox1.style.border = "1px solid #ccc";
        textBox1.style.padding = "5px";
        textBox1.style.margin = "5px";
        textBox1.style.width = "45%";

        textBox1.addEventListener("input", function() {
            let updatedTagName = textBox1.value;
            tag.innerText = updatedTagName;
            let index = selections.findIndex(selection => selection.tag === tagName);
            if (index !== -1) {
                selections[index].tag = updatedTagName;
                tagName = updatedTagName;
            }
        });

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.backgroundColor = "red";
        deleteButton.style.color = "white";
        deleteButton.style.border = "none";
        deleteButton.style.padding = "5px 10px";
        deleteButton.style.cursor = "pointer";
        deleteButton.style.marginLeft = "10px";

        deleteButton.addEventListener("click", () => {
            let index = selections.findIndex(selection => selection.tag === tagName);
            if (index !== -1) {
                selections.splice(index, 1);
            }
            redrawSelections();
            tag.remove();
            listItem.remove();
        });

        listItem.appendChild(textBox1);
        listItem.appendChild(deleteButton);
        document.getElementById("areaList").appendChild(listItem);
    }
    // Reset flags for resizing and moving
    resizing = false;
    moving = false;
    resizeIndex = -1;
    moveIndex = -1;
    resizeHandle = "";
});

// Utility: generate a random hex color
function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Submit button: store selections and redirect
document.getElementById("submitBtn").addEventListener("click", function () {
    let jsonData = JSON.stringify(selections);
    localStorage.setItem("selectedAreas", jsonData);
    window.location.href = "show.html";
});

// Handle image upload and display related elements
document.getElementById("imgdivision").style.display = "none";
document.getElementById("outputdivion").style.display = "none";
document.getElementById("imageUpload").addEventListener("change", function(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            image.src = e.target.result;
            image.style.display = "block";
            image.onload = setupCanvas;

            document.getElementById("imgdivision").style.display = "inline-block";
            document.getElementById("outputdivion").style.display = "inline-block";
        };
        reader.readAsDataURL(file);
    }
});
