var BIRD = [
  "\\_∞_/",
  "--∞--",
  "/^∞^\\",
  "--∞--",
];
var BIRD_ADJUST_Y = [
  -1, 0, 2, 0
];

var POOP = [
  ".",
  "o",
  "O",
  "o",
];

var KEY_CODE_LEFT = 37;
var KEY_CODE_UP = 38;
var KEY_CODE_RIGHT = 39;
var KEY_CODE_DOWN = 40;


var game_score = 0;
var game_lives = 5
var last_frame_time = getTimeMillis();
var frame_count = 0;
var BIRD_FRAME_RATE = .15;
var POOP_FRAME_RATE = .15;
var delta_time = 0;

var bird_x = 0;
var bird_y = 200;
var bird_speed_x = 0;
var bird_speed_y = 0;

var poop_x = 200;
var poop_y = 200;
var poop_speed_x = 0;
var poop_speed_y = 0;

var city_x;
var city_y;

var bird;
var poop;
var city;
var score;

var context = new AudioContext();
var laser_buffer;
var bgbeat_buffer;

window.addEventListener("load", start);

function start() {
  requestAnimationFrame(step);

  load_sounds(context, function() {
    play_sound(bgbeat_buffer, true);
  });

  window.addEventListener("keydown", key_down);
  window.addEventListener("keyup", key_up);
  window.addEventListener("resize", resize);

  bird = document.getElementById("bird");
  poop = document.getElementById("poop");
  city = document.getElementById("city");
  score = document.getElementById("score");
  bird.innerText = BIRD[0];
  poop.innerText = POOP[0];

  center(bird);
  center(poop);
  center(city);

  resize();
}

function resize() {
  city_x = Math.random() * window.innerWidth;
  city_y = window.innerHeight;
}

function center(elem) {
  elem.style.marginLeft = "-" + (elem.offsetWidth/2) + "px";
  elem.style.marginTop = "-" + (elem.offsetHeight/2) + "px";
}

function getTimeMillis() {
  return new Date().getTime();
}

function do_frame_math() {
  var current_frame_time = getTimeMillis();
  delta_time = current_frame_time - last_frame_time;
  last_frame_time = current_frame_time;

  frame_count++;
}

function key_up(evt) {

}

function ord(chr) {
  return chr.charCodeAt(0);
}

function key_down(evt) {
  // console.log(evt.keyCode);
  if (evt.keyCode == ord('A') || evt.keyCode == KEY_CODE_LEFT) {
    bird_speed_x = -1;
  }

  if (evt.keyCode == ord('D') || evt.keyCode == KEY_CODE_RIGHT) {
    bird_speed_x = 1;
  }

  if (evt.keyCode == ord('W') || evt.keyCode == KEY_CODE_UP) {
    bird_speed_y = -1;
  }

  if (evt.keyCode == ord('S') || evt.keyCode == KEY_CODE_DOWN) {
    bird_speed_y = 1;
  }

  if (evt.keyCode == ord('X')) {
    bird_speed_y = 0;
    bird_speed_x = 0;
  }

  if (evt.keyCode == ord(' ')) {
    if (poop_speed_y == 0) {
      poop_speed_y = 1;
      play_sound(laser_buffer, false);
    }
  }
}

function as_color(r, g, b) {
  r = Math.round(r);
  g = Math.round(g);
  b = Math.round(b);
  return "#"+(r).toString(16)+(g).toString(16)+(b).toString(16);
}

function random_color() {
  var r = Math.random() * 255;
  var g = Math.random() * 255;
  var b = Math.random() * 255;
  return as_color(r, g, b);
}

function step() {
  if (game_lives > 0) {
    requestAnimationFrame(step);
  } else {
    gameover.style.visibility = "visible";
  }
  do_frame_math();

  var bird_frame = Math.round((frame_count * BIRD_FRAME_RATE)) % BIRD.length;
  var poop_frame = Math.round((frame_count * POOP_FRAME_RATE)) % POOP.length;

  bird_x += bird_speed_x;
  bird_y += bird_speed_y;

  rainbow_right.style.marginLeft = (bird_x)+ "px";

  if (bird_x < 0) {
    bird_speed_x = 1;
  }

  if (bird_y > window.innerHeight) {
     bird_speed_y = -1;
  }

  if (bird_y < 0) {
    bird_speed_y =1
  }

  if (poop_y > window.innerHeight) {
    poop_speed_y = 0;
    poop_x = bird_x;
    poop_y = bird_y;
  }

  if (bird_x > window.innerWidth) {
    bird_speed_x = -1;
  }

  bird.innerText = BIRD[bird_frame];
  bird.style.left = bird_x + "px";
  bird.style.top = (bird_y + BIRD_ADJUST_Y[bird_frame]) + "px";
  bird.style.color = random_color();

  if (poop_speed_y == 0 && poop_y < window.innerHeight) {
    poop_x = bird_x;
    poop_y = bird_y;
    poop_speed_x = bird_speed_x;
  } else {
    poop_x += poop_speed_x;
    poop_y += poop_speed_y;
    poop_speed_x *= 0.993;
    if (poop_speed_x < .1) {
      poop_speed_x = 0;
    }
  }
  poop.innerText = POOP[poop_frame];
  poop.style.left = poop_x + "px";
  poop.style.top = poop_y + "px";

  city.style.left = city_x + "px";
  city.style.top = city_y + "px";

  score.innerText = "score: " + game_score;
  lives.innerText = "lives: " + game_lives;

  check_collisions();
}

function collision(p1, w1, p2, w2) {
  return (p1 + w1 / 2) > (p2 - w2 / 2) && (p1 - w1 / 2) < (p2 + w2 / 2);
}

function check_collisions() {
  if (collision(poop_x, poop.offsetWidth, city_x, city.offsetWidth)
  && collision(poop_y, poop.offsetHeight, city_y, city.offsetHeight)) {
    city_x = Math.random() * window.innerWidth;
    game_score = game_score + 1;
  }
  if (collision(bird_x, bird.offsetWidth, city_x, city.offsetWidth)
  && collision(bird_y, bird.offsetHeight, city_y, city.offsetHeight)) {
    city_x = Math.random() * window.innerWidth;
    game_lives = game_lives - 1;
  }
}

function load_sounds(context, finishedLoading) {
  bufferLoader = new BufferLoader(
    context,
    [
      //http://www.freesound.org/people/oceanictrancer/sounds/242577/
      '242577__oceanictrancer__120-bpm-ravish-loop.wav',

      // http://www.freesound.org/people/jobro/sounds/35684/
      '35684__jobro__laser7.wav',
    ],
    function (bufferList) {
      bgbeat_buffer = bufferList[0];
      laser_buffer = bufferList[1];
      finishedLoading();
    }
    );

  bufferLoader.load();
}

function play_sound(buffer, loop) {
  console.log('buffer', buffer);
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  source.connect(context.destination);
  source.start(0);
}
