// Game config
const JUMP_TIME = 300; // in ms
const CHARACTER_GROUND_POSITION = 310;
const GAME_SPEED = 7;
const BOSS_POSITION = 5000;
const AUDIO_RUNNING = new Audio('./audio/running.wav');
const AUDIO_JUMPPING = new Audio('./audio/jumpping.wav');
const AUDIO_BOTTLE = new Audio('./audio/bottle.wav');
const AUDIO_THROW = new Audio('./audio/throw.wav');
const AUDIO_CHICKEN = new Audio('./audio/chicken.wav');
const AUDIO_WON = new Audio('./audio/won.wav');
const AUDIO_BACKGROUND = new Audio('./audio/cockroach-loop.wav');


AUDIO_BACKGROUND.loop = true;
AUDIO_BACKGROUND.volume = 0.2;
AUDIO_BOTTLE.volume = 0.3;

// Variables
let canvas;
let ctx;
let character_x = 220;
let character_y = CHARACTER_GROUND_POSITION;
let is_moving_left = false;
let is_moving_right = false;
let bg_elements = 0;
let scale = 0.35;
let last_jump_started = 0;
let character_graph_index = 0;
let cloud_offset = 0;
let chickens_array = [];
let character_energy = 100;
let final_boss_energy = 100;
let placed_tabasco_bottles_array = [500, 1200, 2200, 2900, 3300];
let collected_tabasco_bottles = 0;
let tabasco_bottle_throw_time = 0;
let throw_bottle_x = 0;
let throw_bottle_y = 0;
let time_passed = 0;
let boss_defeteaded_at = 0;
let game_finished = false;
let character_lost_at;
let gameOn = false;

// Pre-loading background images

let imagePaths = ['./img/tabasco.png', './img/bg_elem_1.png', './img/bg_elem_2.png', './img/cloud1.png', './img/cloud2.png', './img/sand.png', './img/chicken_big.png', './img/chicken_dead.png', `./img/chicken1.png`, `./img/chicken2.png`];
let images = [];

function preloadImagesBG() {
    for (let i = 0; i < imagePaths.length; i++) {
        let img = new Image();
        img.src = imagePaths[i];
        images.push(img);
    }
}

preloadImagesBG();

// Pre-loading character's moviment right and left

let images_path_character_right = ['./img/charakter_1.png', './img/charakter_2.png', './img/charakter_3.png', './img/charakter_4.png'];
let images_character_right_array = [];

function preLoadImagesCharacterRight() {
    for (let i = 0; i < images_path_character_right.length; i++) {
        let img = new Image();
        img.src = images_path_character_right[i];
        images_character_right_array.push(img);
    }
}

preLoadImagesCharacterRight();

let image_paths_character_left = ['./img/charakter_left_1.png', './img/charakter_left_2.png', './img/charakter_left_3.png', './img/charakter_left_4.png'];
let images_character_left_array = [];

function preLoadImagesCharacterLeft() {
    for (let i = 0; i < image_paths_character_left.length; i++) {
        let img = new Image();
        img.src = image_paths_character_left[i];
        images_character_left_array.push(img);
    }
}

preLoadImagesCharacterLeft();

let current_character_img = images_character_right_array[0];

// -----------------------------

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    if (gameOn) {
        createChickenList();
        checkForRunning();
        draw();
        calculateCloudOffset();
        listenForKeys();
        calculateChickenPosition();
        checkForCollision();
    }

}

function createChickenList() {
    chickens_array = [
        createChicken(8, 700),
        createChicken(9, 1400),
        createChicken(8, 1800),
        createChicken(9, 2500),
        createChicken(9, 2800),
        createChicken(8, 3000),
        createChicken(9, 3400),
        createChicken(8, 4000),
        createChicken(9, 4300),
        createChicken(9, 4600),
    ];
}

function draw() {
    drawBackground();
    if (game_finished) {
        drawFinalScreen();;
    } else {
        drawChicken();
        drawBottlesOnTheSand();
        requestAnimationFrame(draw);
        drawEnergyBar();
        drawInfoCollectedBottles();
        drawThrowBottle();
        addBackGroundObj(images[1], 900, 400, 1);
        addBackGroundObj(images[1], 2900, 400, 1);
        addBackGroundObj(images[1], 4000, 400, 1);
    }
    updateCharacter();
    drawFinalBoss();
}

function drawBackground() {

    // Gradient color for the sky.
    let sky = ctx.createLinearGradient(0, 390, 0, 310);
    sky.addColorStop(0, "rgb(255, 255, 255)");
    sky.addColorStop(1, "rgb(165, 236, 265)");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    addBackGroundObj(images[3], 100 - cloud_offset, 80, 0.5, 1);
    addBackGroundObj(images[4], 800 - cloud_offset, 110, 0.5, 1);
    addBackGroundObj(images[4], 1500 - cloud_offset, 150, 0.5, 1);
    addBackGroundObj(images[3], 2300 - cloud_offset, 80, 0.5, 1);
    addBackGroundObj(images[4], 2800 - cloud_offset, 150, 0.5, 1);
    addBackGroundObj(images[4], 2900 - cloud_offset, 130, 0.5, 1);
    addBackGroundObj(images[4], 3500 - cloud_offset, 150, 0.5, 1);
    addBackGroundObj(images[3], 4000 - cloud_offset, 90, 0.5, 1);

    drawGround();
}

function drawGround() {

    if (is_moving_right) {
        bg_elements = bg_elements - GAME_SPEED;
    }

    if (is_moving_left && bg_elements < 0) {
        bg_elements = bg_elements + GAME_SPEED;
    }

    addBackGroundObj(images[1], 800, 316, 0.25, 0.4);
    addBackGroundObj(images[1], 1700, 316, 0.25, 0.4);

    ctx.globalAlpha = 1;

    // Gradient color for the ground.
    let grd = ctx.createLinearGradient(0, 370, 0, 430);
    grd.addColorStop(0, "rgb(205, 180, 103)");
    grd.addColorStop(1, "rgb(255, 230, 153)");

    ctx.fillStyle = grd;
    ctx.fillRect(0, 375, canvas.width, canvas.height - 375);

    for (let i = 0; i < 10; i++) {
        addBackGroundObj(images[5], i * canvas.width, 375, 0.36, 0.35)
    }

    addBackGroundObj(images[1], 90, 287);
    addBackGroundObj(images[2], 450, 152, 0.55);
    addBackGroundObj(images[2], 1100, 248);
    addBackGroundObj(images[1], 1300, 287);
    addBackGroundObj(images[2], 2000, 248);
    addBackGroundObj(images[2], 2300, 152, 0.55);
    addBackGroundObj(images[2], 2400, 248);
    addBackGroundObj(images[1], 3200, 287);
    addBackGroundObj(images[2], 3800, 248);
}

function checkForCollision() {
    setInterval(function() {

        // Check chicken collision
        for (let i = 0; i < chickens_array.length; i++) {
            let chicken = chickens_array[i];
            let chicken_x = chicken.position_x + bg_elements;

            if ((chicken_x - 46) < character_x && (chicken_x + 13) > character_x) {
                if (character_y > 230) {
                    if (character_energy >= 9) {
                        character_energy -= 10;
                        AUDIO_CHICKEN.play();
                    } else {
                        character_lost_at = new Date().getTime();
                        game_finished = true;
                    }

                }
            }
        }

        // Collecting the tabasco bottle
        for (let i = 0; i < placed_tabasco_bottles_array.length; i++) {
            let bottle_x = placed_tabasco_bottles_array[i] + bg_elements;
            if ((bottle_x - 30) < character_x && (bottle_x + 10) > character_x) {

                if (character_y > 280) {
                    placed_tabasco_bottles_array.splice(i, 1)
                    AUDIO_BOTTLE.play();
                    collected_tabasco_bottles++;
                }
            }
        }


        // Check bottle collision with final boss
        if (throw_bottle_x > BOSS_POSITION + bg_elements - 100 && throw_bottle_x < BOSS_POSITION + bg_elements + 100 && throw_bottle_y < 390) {
            if (final_boss_energy > 0) {
                final_boss_energy = final_boss_energy - 10;
            } else if (boss_defeteaded_at == 0) {
                boss_defeteaded_at = new Date().getTime();
                finishLevel();
            }
        }
    }, 100)
}

function finishLevel() {
    setTimeout(function() {
        AUDIO_WON.play();
    }, 500);
    game_finished = true;
}

function calculateChickenPosition() {
    setInterval(function() {
        for (let i = 0; i < chickens_array.length; i++) {
            let chicken = chickens_array[i];
            chicken.position_x = chicken.position_x - chicken.speed;
        }
    }, 20)
}

function calculateCloudOffset() {
    setInterval(function() {
        cloud_offset = cloud_offset + 0.4;
    }, 60)
}

function checkForRunning() {
    setInterval(function() {
        if (is_moving_right) {
            AUDIO_RUNNING.play();
            let index = character_graph_index % images_character_right_array.length;
            current_character_img = images_character_right_array[index];
            character_graph_index = character_graph_index + 1;
        }

        character_graph_index = character_graph_index + 1;

        if (is_moving_left) {
            AUDIO_RUNNING.play();
            let index = character_graph_index % images_character_left_array.length;
            current_character_img = images_character_left_array[index];
            character_graph_index = character_graph_index + 1;
        }

        if (!is_moving_right && !is_moving_left) {
            AUDIO_RUNNING.pause();
        }

    }, 50)

}

function drawFinalScreen() {
    ctx.font = '60px Bradley Hand ITC';
    let msg = 'You won!'

    if (character_lost_at >= 0) {
        ctx.fillStyle = 'red';
        msg = 'You lost!';
    }

    ctx.fillText(msg, 200, canvas.height / 2);
}

function drawFinalBoss() {
    let final_boss_X = BOSS_POSITION;
    let final_boss_Y = 150;
    let boss_img = images[6];

    if (boss_defeteaded_at > 0) {
        let time_passed = new Date().getTime() - boss_defeteaded_at;
        boss_img = images[7];
    }

    addBackGroundObj(boss_img, final_boss_X, final_boss_Y, 0.45)

    if (boss_defeteaded_at == 0) {
        ctx.fillStyle = 'black'
        ctx.fillRect(BOSS_POSITION + bg_elements, 131, 208, 19)

        ctx.fillStyle = 'rgb(165, 236, 265)'
        ctx.fillRect(BOSS_POSITION + 1 + bg_elements, 132, 206, 17)

        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'red'
        ctx.fillRect(BOSS_POSITION + 4 + bg_elements, 135, 2 * final_boss_energy, 11)
    }
}

function drawInfoCollectedBottles() {
    let img = images[0];
    ctx.drawImage(img, 0, 15, img.width * 0.5, img.height * 0.5);
    ctx.font = "bolder 30px Bradley Hand ITC";
    ctx.fillText(`x ${collected_tabasco_bottles}`, 45, 45);
}

function drawBottlesOnTheSand() {
    for (let i = 0; i < placed_tabasco_bottles_array.length; i++) {
        bottle_x = placed_tabasco_bottles_array[i];
        addBackGroundObj(images[0], bottle_x, 390, 0.5);
    }
}

function drawEnergyBar() {
    ctx.fillStyle = 'black'
    ctx.fillRect(496, 11, 208, 38)

    ctx.globalAlpha = 3;
    ctx.fillStyle = 'rgb(165, 236, 265)'
    ctx.fillRect(497, 12, 206, 36)

    ctx.globalAlpha = 1;
    ctx.fillStyle = 'blue'
    ctx.fillRect(500, 15, 2 * character_energy, 30)
}

function drawChicken() {
    for (i = 0; i < chickens_array.length; i++) {
        let chicken = chickens_array[i];
        addBackGroundObj(chicken.img, chicken.position_x, chicken.position_y, chicken.scale);
    }
}

function createChicken(type, position_x) {
    return {
        "img": images[type],
        "position_x": position_x,
        "position_y": 383,
        "scale": 0.6,
        "speed": ((Math.random() * 2) + 1.5)
    };
}

function updateCharacter() {
    let characterImg = current_character_img;

    let time_passedSinceJump = new Date().getTime() - last_jump_started;
    if (time_passedSinceJump < JUMP_TIME) {
        character_y = character_y - 10;
    } else {
        if (character_y < CHARACTER_GROUND_POSITION) {
            character_y = character_y + 10;
        }
    }

    ctx.drawImage(characterImg, character_x, character_y, characterImg.width * scale, characterImg.height * scale);

}

function addBackGroundObj(src, offSet_X, offSet_Y, scale = 0.35, opacity = 1) {;
    let img = src;
    ctx.globalAlpha = opacity;
    ctx.drawImage(img, offSet_X + bg_elements, offSet_Y, img.width * scale, img.height * scale);

}

function drawThrowBottle() {
    if (tabasco_bottle_throw_time) {
        // Physics not very realistic!!!!
        let time_passed = new Date().getTime() - tabasco_bottle_throw_time;
        let gravity = Math.pow(9.81, time_passed / 200);
        throw_bottle_x = 220 + (time_passed * 0.6);
        throw_bottle_y = 310 - (time_passed * 0.4 - gravity);

        let img = images[0];

        ctx.drawImage(img, throw_bottle_x + 20, throw_bottle_y + 50, img.width * 0.5, img.height * 0.5);
    }
}

function listenForKeys() {
    document.addEventListener('keydown', e => {
        const k = e.key;

        if (k == 'd' && collected_tabasco_bottles > 0) {
            let time_passed = new Date().getTime() - tabasco_bottle_throw_time;
            if (time_passed > 1000) {
                AUDIO_THROW.play();
                collected_tabasco_bottles--;
                tabasco_bottle_throw_time = new Date().getTime();
            }
        }

        if (k == 'ArrowRight') {
            is_moving_right = true;
        }

        if (k == 'ArrowLeft') {
            is_moving_left = true;
        }

        let time_passedSinceJump = new Date().getTime() - last_jump_started;
        if (e.code == 'Space' && time_passedSinceJump > JUMP_TIME * 2) {
            last_jump_started = new Date().getTime();
            AUDIO_JUMPPING.play();
        }
    });

    document.addEventListener('keyup', e => {
        const k = e.key;
        if (k == 'ArrowRight') {
            is_moving_right = false;
        }

        if (k == 'ArrowLeft') {
            is_moving_left = false;
        }
    });



}

document.addEventListener('keyup', e => {
    const k = e.key;
    if (k == 'Enter') {
        e.preventDefault();
        gameOn = true;
        init();
        console.log(gameOn, 'Enter')
        document.getElementById('menuStart').classList.add('dHide');
    }


});