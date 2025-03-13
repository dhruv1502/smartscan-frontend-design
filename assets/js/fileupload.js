// Handle image upload
document.getElementById("imageUpload").addEventListener("change", function(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            image.src = e.target.result;
            image.style.display = "block";
            image.onload = setupCanvas;
        };
        reader.readAsDataURL(file);
    }
});
