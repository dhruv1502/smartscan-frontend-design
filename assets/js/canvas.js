window.addEventListener("load",()=>{

    
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    
    let painting = false;
    function startPosition(){
        painting = true;
    }
    function endPosition(){
        painting = false;
        ctx.beginPath();
    }

    function draw(e){
        if (!painting) return;
        
        ctx.lineWidth = 5;
        ctx.lineCap = "round";

        ctx.lineTo(e.clientX,e.clinetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX,e.clinetY);

    }

    canvas.addEventListener("mousedown",startPosition);
    canvas.addEventListener("mouseup",endPosition);
    canvas.addEventListener("mousemove",draw);

    console.log(canvas);
    

});