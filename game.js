let game = document.getElementById('game');
let lostBalloonBox = document.getElementById('lostBalloonBox');
const maxlostBalloons = 10;
let balloonsLost = 0;
let balloonsPopped = 0;
let gun = document.getElementById('gun');
let moveBy = 10;
const lastTwoKeyEvents = [];
let sumOfQuickFires  = 0;
let gameFinish = document.getElementById('game-finish');
let balloonInterval;
let gameOver = false;
let score = 0;
const targetScore = 50;
const scoreText = document.getElementById('score');
const goalText = document.getElementById('target');
scoreText.innerText = `Score: ${score}`;
goalText.innerText = `Goal: ${targetScore}`

const balloonPopSound = new Audio('popBalloon.wav');
const gunArrowSound = new Audio('gunArrow.wav');

window.addEventListener('load', () => {
    gun.style.top = '20px';
});



window.addEventListener('keydown', event => {

    switch(event.code) {
        case 'ArrowUp':
            gun.style.top = (parseInt(gun.style.top) - moveBy) + 'px';
            break;
        case 'ArrowDown':
            gun.style.top = (parseInt(gun.style.top) + moveBy) + 'px';
            break;
            
    }

    if(parseInt(gun.style.top) < 20) {
        gun.style.top = '640px';
    }

    if(parseInt(gun.style.top) > 640) {
        gun.style.top = '20px';
    }
});

window.addEventListener('keydown', event => {

    if(event.code === 'ArrowRight' && !gameOver) {
        if(lastTwoKeyEvents.length < 2) {
            lastTwoKeyEvents.push(Date.now());
        } else {
            lastTwoKeyEvents.shift();
            lastTwoKeyEvents.push(Date.now());
        }

        const timeBetweenTwoFires = lastTwoKeyEvents.length == 2 ?  (lastTwoKeyEvents[1] - lastTwoKeyEvents[0]) / 1000 : null;
        console.log(lastTwoKeyEvents);
        console.log(timeBetweenTwoFires);

        if(timeBetweenTwoFires && timeBetweenTwoFires < 0.7) {
            console.log('timeBetweenTwoFires', timeBetweenTwoFires);
            sumOfQuickFires += timeBetweenTwoFires;
            console.log('sum', sumOfQuickFires)
        }
            
        if(lastTwoKeyEvents.length < 2 || timeBetweenTwoFires > 0.7 || sumOfQuickFires > 1.5) {
            addArrow();
            gunArrowSound.play();
            sumOfQuickFires = 0;
        }
        // TODO - DONE: if keys pressed in less time sum up to values and trigger addArrow function if sum is > 0.7
    }

});


function addArrow() {
    let arrow = document.createElement('div');
    const arrowSpan = 2;
    const removeArrowAfter = arrowSpan - 0.1;
    game.appendChild(arrow);
    arrow.classList.add('arrow');
    arrow.id = Date.now() + 'a';
    arrow.style.animation = `arrow ${arrowSpan}s linear`;
    arrow.style.top = (gun.offsetTop + gun.offsetHeight / 2) + 'px';

    const popInterval = setInterval(function() {popBalloon(arrow);}, 10);


    setTimeout(function() {
        game.removeChild(arrow);
        clearInterval(popInterval);
    }, removeArrowAfter * 1000);
}

function popBalloon(arrow) {
    const balloons = game.getElementsByClassName('balloon');

    for(one of balloons) {
        if(arrowCollidesBaloon(arrow, one)) {
            balloonsPopped++;
            balloonPopSound.play();
            game.removeChild(one);
            if(!gameOver) {
                score = balloonsPopped;
                scoreText.innerText = `Score: ${score}`;
            }
            
            if(balloonsPopped === targetScore) {
                finishGame('YOU WIN', 'gold', 'white', '37.5%');
            }
        }
    }
}

function arrowCollidesBaloon(arrow, oneBalloon) {
    const arrowBox = arrow.getBoundingClientRect();
    const balloonBox = oneBalloon.getBoundingClientRect();
  
    return !(
        arrowBox.top > balloonBox.bottom ||
        arrowBox.right < balloonBox.left ||
        arrowBox.bottom < balloonBox.top ||
        arrowBox.left > balloonBox.right
    );
}

addBalloons();
const addBalloonsInterval = setInterval(addBalloons, 1500);

function addBalloons() {
    let balloon = document.createElement('div');
    const balloonSpan = 12;
    const balloonLeft = Math.floor(Math.random()*1200) + 1 + 'px';
    const balloonColorSet = {'greenyellow': 'green', 'rgb(250, 98, 98)': 'red', 'rgb(3, 230, 247)': 'blue', 'rgb(222, 120, 245)': 'rgb(94, 2, 115)'};
    const balloonColors = Object.keys(balloonColorSet);
    const randomColorIndex =Math.floor(Math.random()*balloonColors.length);
    
    game.appendChild(balloon);
    balloon.classList.add('balloon');
    balloon.id = Date.now() + 'b';
    balloon.style.animation = `balloon ${balloonSpan}s linear`;
    balloon.style.left = parseInt(balloonLeft) < 90 ? '90px' : balloonLeft;
    balloon.style.backgroundColor = balloonColors[randomColorIndex];
    balloon.style.borderColor = balloonColorSet[balloonColors[randomColorIndex]];



    balloonInterval =  setInterval(function() {
        const balloonBox = balloon.getBoundingClientRect();
        const gameBox = game.getBoundingClientRect();

        if(balloonBox.y + 60 < gameBox.y) {
            if(game.contains(balloon)){
                game.removeChild(balloon);
                balloonsLost++;
                if(balloonsLost <= maxlostBalloons) {
                    balloon.style.animation = 'none';
                    balloon.style.left = '0px';
                    balloon.style.top = 62*balloonsLost - 62 + 'px';
                    balloon.style.zIndex = 10 + balloonsLost;
                    if(!gameOver) {
                        lostBalloonBox.appendChild(balloon);
                    }
                } else if(!gameOver){
                    finishGame('GAME OVER', 'red', 'red', '33%');
                }
            }
        }
    }, 10)

}

function finishGame(finishMessage, textColor, textStrokeColor, leftOfMsg) {
    gameOver = true;
    console.log(score);
    clearInterval(addBalloonsInterval);
    clearInterval(balloonInterval);
    gameFinish.innerHTML = `<span style='color: ${textColor}; -webkit-text-stroke: 1px ${textStrokeColor}; position: absolute; left: ${leftOfMsg}; top: 300px; font-family: Courier; font-size: 250%; z-index: 1000;'>${finishMessage}</span>
    <span id="play-again" onclick="refreshPage()">PLAY AGAIN</span>`;
}

function refreshPage() {
    location.reload();
}


