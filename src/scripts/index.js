import oscillators from "web-audio-oscillators";

let context = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = oscillators.organ(context);
oscillator.frequency.value = 220;
oscillator.connect(context.destination);
oscillator.start();
oscillator.stop(1);
