# Super Oscillator

<p align="center">
  <img src="https://i.imgur.com/QqcEvAT.gif">
</p>

An interactive 3D synthesizer for the Web.

Live version hosted [here](https://oscillator.js.org).

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
- ~~Implement QWERTY keyboard control i.e. interact with the synthesizer via your keyboard.~~
- Eliminate the annoying "click" sound heard when playing keys consecutively. Probably need to apply an ADSR envelope...
- Add some kind of light effect to the screen so that it looks more like a real electronic display.
- Add buttons to start/stop the playing of preset songs.
- Fix the [bug that causes the fork link in the top-right corner to occasionally hijack mouse clicks made on the synthesizer](https://stackoverflow.com/q/46557602). I don't know what is causing this...
- Get it working properly on mobile devices. It doesn't look good on small screens and the synthesizer doesn't respond to touches.
- Publish the synthesizer as an NPM package so that others can easily use it in their apps.

Any help with this would be appreciated. 🙂
