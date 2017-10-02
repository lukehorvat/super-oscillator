# Super Oscillator

<p align="center">
  <img src="https://i.imgur.com/QqcEvAT.gif">
</p>

An interactive, 3D music synthesizer for the Web!

Live version hosted [here](https://lukehorvat.github.io/super-oscillator).

Uses [three.js](https://threejs.org) and [web-audio-oscillators](https://github.com/lukehorvat/web-audio-oscillators).

## Setup

To run a local instance, issue the following commands:

```bash
$ git clone git@github.com:lukehorvat/super-oscillator.git
$ cd super-oscillator
$ npm install
$ npm start
```

This installs all dependencies and serves the Web app on port 9000.

## Contributing

There are still a few things I'd like to do:

- Add a power on/off button.
- Add knobs for controlling various effects (reverb, delay, vibrato, etc.).
- Show the note name when a key is pressed.
- Add more oscillators (via the web-audio-oscillators package).
- Add some kind of light effect to the screen so that it looks more like a real electronic display.
- Add buttons to start/stop the playing of preset songs.
- Fix the bug that causes the fork link in the top-right corner to occasionally hijack mouse clicks made on the synthesizer. I don't know what is causing this...
- Publish the synthesizer as an NPM package so that others can easily use it in their apps.

Pull requests welcome!
