/* ==========================================
   ELEMENTS
========================================== */

const noBtn = document.getElementById("noBtn");
const forgiveBtn = document.getElementById("forgiveBtn");
const successScreen = document.getElementById("successScreen");
const heartButton = document.getElementById("heartButton");
const heartsContainer = document.getElementById("hearts-container");
const music = document.getElementById("bgMusic");

/* ==========================================
   FLOATING HEARTS BACKGROUND
========================================== */

function createFloatingHeart(){

    const heart = document.createElement("div");

    heart.innerHTML = "❤️";

    heart.style.position = "absolute";
    heart.style.left = Math.random()*100 + "%";
    heart.style.bottom = "-30px";

    heart.style.fontSize = (15 + Math.random()*20) + "px";

    heart.style.opacity = Math.random();

    heart.style.animation =
        `floatHeart ${5 + Math.random()*5}s linear forwards`;

    heartsContainer.appendChild(heart);

    setTimeout(()=>{
        heart.remove();
    },10000);

}

setInterval(createFloatingHeart,400);

/* ==========================================
   ADD FLOATING HEART ANIMATION
========================================== */

const style=document.createElement("style");

style.innerHTML=`

@keyframes floatHeart{

0%{

transform:translateY(0) rotate(0deg);

opacity:1;

}

100%{

transform:translateY(-110vh) rotate(360deg);

opacity:0;

}

}

`;

document.head.appendChild(style);

/* ==========================================
   HEART BURST
========================================== */

heartButton.addEventListener("click",()=>{

    for(let i=0;i<25;i++){

        const heart=document.createElement("div");

        heart.innerHTML="💖";

        heart.style.position="fixed";

        heart.style.left=heartButton.getBoundingClientRect().left+40+"px";

        heart.style.top=heartButton.getBoundingClientRect().top+40+"px";

        heart.style.fontSize="24px";

        heart.style.pointerEvents="none";

        heart.style.transition="1.5s ease-out";

        document.body.appendChild(heart);

        const x=(Math.random()-0.5)*500;

        const y=(Math.random()-0.5)*500;

        setTimeout(()=>{

            heart.style.transform=`translate(${x}px,${y}px) scale(0)`;

            heart.style.opacity=0;

        },10);

        setTimeout(()=>{

            heart.remove();

        },1600);

    }

});

/* ==========================================
   RUNAWAY NO BUTTON
========================================== */

function moveButton(){

    const btnWidth=noBtn.offsetWidth;

    const btnHeight=noBtn.offsetHeight;

    const x=Math.random()*(window.innerWidth-btnWidth-30);

    const y=Math.random()*(window.innerHeight-btnHeight-30);

    noBtn.style.left=x+"px";

    noBtn.style.top=y+"px";

}

noBtn.addEventListener("mouseover",moveButton);

noBtn.addEventListener("touchstart",(e)=>{

    e.preventDefault();

    moveButton();

});

/* ==========================================
   FORGIVE BUTTON
========================================== */

forgiveBtn.addEventListener("click",()=>{

    successScreen.classList.remove("hidden");

    if(music){

        music.play().catch(()=>{});

    }

    launchConfetti();

});

/* ==========================================
   CLICK HEARTS ANYWHERE
========================================== */

document.addEventListener("click",(e)=>{

    for(let i=0;i<8;i++){

        const heart=document.createElement("div");

        heart.innerHTML="💗";

        heart.style.position="fixed";

        heart.style.left=e.clientX+"px";

        heart.style.top=e.clientY+"px";

        heart.style.pointerEvents="none";

        heart.style.transition="1s ease-out";

        heart.style.fontSize="20px";

        document.body.appendChild(heart);

        const x=(Math.random()-0.5)*250;

        const y=(Math.random()-0.5)*250;

        setTimeout(()=>{

            heart.style.transform=`translate(${x}px,${y}px) scale(0)`;

            heart.style.opacity=0;

        },10);

        setTimeout(()=>{

            heart.remove();

        },1000);

    }

});

/* ==========================================
   SIMPLE CONFETTI
========================================== */

const canvas=document.getElementById("confettiCanvas");

const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;

canvas.height=window.innerHeight;

window.addEventListener("resize",()=>{

canvas.width=window.innerWidth;

canvas.height=window.innerHeight;

});

function launchConfetti(){

const confetti=[];

for(let i=0;i<200;i++){

confetti.push({

x:Math.random()*canvas.width,

y:Math.random()*canvas.height-canvas.height,

r:5+Math.random()*8,

d:Math.random()*200,

vx:(Math.random()-0.5)*4,

vy:2+Math.random()*4,

color:`hsl(${Math.random()*360},100%,70%)`

});

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

confetti.forEach(c=>{

ctx.beginPath();

ctx.fillStyle=c.color;

ctx.arc(c.x,c.y,c.r,0,Math.PI*2);

ctx.fill();

c.x+=c.vx;

c.y+=c.vy;

});

requestAnimationFrame(draw);

}

draw();

}