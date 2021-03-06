// Note: In this script i'm using vars and not let/consts because we're
// re-evaling these values in the demo. You could totally use const
// everywhere instead.

// These are all variables used in the demos.
var TWINKLE_TWINKLE, ORIGINAL_TWINKLE_TWINKLE, DRUMS, LITTLE_TEAPOT;
var player, visualizer, viz, vizPLayer;
var music_rnn, rnnPlayer, music_vae, vaePlayer;
createSampleSequences();
createSamplePlayers();
setupMusicRNN();
setupMusicVAE();

// CodeMirrorify all the code snippets.
const codeMirrorSamples = {};
doTheCodeMirrors();

function createSampleSequences() {
  TWINKLE_TWINKLE = {
    notes: [
      {pitch: 60, startTime: 0.0, endTime: 0.5},
      {pitch: 60, startTime: 0.5, endTime: 1.0},
      {pitch: 67, startTime: 1.0, endTime: 1.5},
      {pitch: 67, startTime: 1.5, endTime: 2.0},
      {pitch: 69, startTime: 2.0, endTime: 2.5},
      {pitch: 69, startTime: 2.5, endTime: 3.0},
      {pitch: 67, startTime: 3.0, endTime: 4.0},
      {pitch: 65, startTime: 4.0, endTime: 4.5},
      {pitch: 65, startTime: 4.5, endTime: 5.0},
      {pitch: 64, startTime: 5.0, endTime: 5.5},
      {pitch: 64, startTime: 5.5, endTime: 6.0},
      {pitch: 62, startTime: 6.0, endTime: 6.5},
      {pitch: 62, startTime: 6.5, endTime: 7.0},
      {pitch: 60, startTime: 7.0, endTime: 8.0},
    ],
    tempos: [{
      time: 0, 
      qpm: 120
    }],
    totalTime: 8
  };

  ORIGINAL_TWINKLE_TWINKLE = {
    notes: [
      {pitch: 60, startTime: 0.0, endTime: 0.5},
      {pitch: 60, startTime: 0.5, endTime: 1.0},
      {pitch: 67, startTime: 1.0, endTime: 1.5},
      {pitch: 67, startTime: 1.5, endTime: 2.0},
      {pitch: 69, startTime: 2.0, endTime: 2.5},
      {pitch: 69, startTime: 2.5, endTime: 3.0},
      {pitch: 67, startTime: 3.0, endTime: 4.0},
      {pitch: 65, startTime: 4.0, endTime: 4.5},
      {pitch: 65, startTime: 4.5, endTime: 5.0},
      {pitch: 64, startTime: 5.0, endTime: 5.5},
      {pitch: 64, startTime: 5.5, endTime: 6.0},
      {pitch: 62, startTime: 6.0, endTime: 6.5},
      {pitch: 62, startTime: 6.5, endTime: 7.0},
      {pitch: 60, startTime: 7.0, endTime: 8.0},
    ],
    tempos: [{
      time: 0, 
      qpm: 120
    }],
    totalTime: 8
  };

  DRUMS = {
    notes: [
      { pitch: 36, quantizedStartStep: 0, quantizedEndStep: 1, isDrum: true },
      { pitch: 38, quantizedStartStep: 0, quantizedEndStep: 1, isDrum: true },
      { pitch: 42, quantizedStartStep: 0, quantizedEndStep: 1, isDrum: true },
      { pitch: 46, quantizedStartStep: 0, quantizedEndStep: 1, isDrum: true },
      { pitch: 42, quantizedStartStep: 2, quantizedEndStep: 3, isDrum: true },
      { pitch: 42, quantizedStartStep: 3, quantizedEndStep: 4, isDrum: true },
      { pitch: 42, quantizedStartStep: 4, quantizedEndStep: 5, isDrum: true },
      { pitch: 50, quantizedStartStep: 4, quantizedEndStep: 5, isDrum: true },
      { pitch: 36, quantizedStartStep: 6, quantizedEndStep: 7, isDrum: true },
      { pitch: 38, quantizedStartStep: 6, quantizedEndStep: 7, isDrum: true },
      { pitch: 42, quantizedStartStep: 6, quantizedEndStep: 7, isDrum: true },
      { pitch: 45, quantizedStartStep: 6, quantizedEndStep: 7, isDrum: true },
      { pitch: 36, quantizedStartStep: 8, quantizedEndStep: 9, isDrum: true },
      { pitch: 42, quantizedStartStep: 8, quantizedEndStep: 9, isDrum: true },
      { pitch: 46, quantizedStartStep: 8, quantizedEndStep: 9, isDrum: true },
      { pitch: 42, quantizedStartStep: 10, quantizedEndStep: 11, isDrum: true },
      { pitch: 48, quantizedStartStep: 10, quantizedEndStep: 11, isDrum: true },
      { pitch: 50, quantizedStartStep: 10, quantizedEndStep: 11, isDrum: true },
    ],
    quantizationInfo: {stepsPerQuarter: 4},
    tempos: [{time: 0, qpm: 120}],
    totalQuantizedSteps: 11
  };

  LITTLE_TEAPOT = {
    notes: [
      { pitch: 69, quantizedStartStep: 0, quantizedEndStep: 2, program: 0 },
      { pitch: 71, quantizedStartStep: 2, quantizedEndStep: 4, program: 0 },
      { pitch: 73, quantizedStartStep: 4, quantizedEndStep: 6, program: 0 },
      { pitch: 74, quantizedStartStep: 6, quantizedEndStep: 8, program: 0 },
      { pitch: 76, quantizedStartStep: 8, quantizedEndStep: 10, program: 0 },
      { pitch: 81, quantizedStartStep: 12, quantizedEndStep: 16, program: 0 },
      { pitch: 78, quantizedStartStep: 16, quantizedEndStep: 20, program: 0 },
      { pitch: 81, quantizedStartStep: 20, quantizedEndStep: 24, program: 0 },
      { pitch: 76, quantizedStartStep: 24, quantizedEndStep: 26, program: 0 }
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    totalQuantizedSteps: 26,
  };
}

function createSamplePlayers() {
  // A plain NoteSequence player
  player = new mm.Player();

  // A Visualizer
  viz = new mm.Visualizer(TWINKLE_TWINKLE, document.getElementById('canvas2'));
  visualizer = new mm.Visualizer(TWINKLE_TWINKLE, document.getElementById('canvas'));

  // This player calls back two functions: 
  // - run, after a note is played. This is where we update the visualizer.
  // - stop, when it is done playing the note sequence.
  vizPlayer = new mm.Player(false, {
    run: (note) => viz.redraw(note),
    stop: () => {}
  });
}

var rnn_steps = 20;
var rnn_temperature = 1.5;
function setupMusicRNN() {
  // Initialize model
  music_rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
  music_rnn.initialize();

  // Create a player to play the sampled sequence.
  rnnPlayer = new mm.Player();
}

function playRNN(event) {
  if (rnnPlayer.isPlaying()) {
    rnnPlayer.stop();
    event.target.textContent = 'Play';
    return;
  } else {
    event.target.textContent = 'Stop';
  }
  // The model expects a quantized sequence, and ours was unquantized:
  const qns = mm.sequences.quantizeNoteSequence(ORIGINAL_TWINKLE_TWINKLE, 4);

  music_rnn
  .continueSequence(qns, rnn_steps, rnn_temperature)
  .then((sample) => rnnPlayer.start(sample));
}

vae_temperature = 1.5;
function setupMusicVAE() {
  // Initialize model.
  music_vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2');
  music_vae.initialize();
  
  // Create a player to play the sampled sequence.
  vaePlayer = new mm.Player();
}
    
function playVAE(event) {
  if (vaePlayer.isPlaying()) {
    vaePlayer.stop();
    event.target.textContent = 'Play';
    return;
  } else {
    event.target.textContent = 'Stop';
  }
  music_vae
  .sample(1, vae_temperature)
  .then((sample) => vaePlayer.start(sample[0]));
}

function playInterpolation() {
  if (vaePlayer.isPlaying()) {
    vaePlayer.stop();
    return;
  }
  // Music VAE requires quantized melodies, so quantize them first.
  const star = mm.sequences.quantizeNoteSequence(TWINKLE_TWINKLE, 4);
  
  music_vae
  .interpolate([star, LITTLE_TEAPOT], 3 /* star + teapot + 1 in between */)
  .then((sample) => {
    const concatenated = mm.sequences.concatenate(sample);
    vaePlayer.start(concatenated);
  });
}

function startOrStop(event, p, seq = TWINKLE_TWINKLE) {
  if (p.isPlaying()) {
    p.stop();
    event.target.textContent = 'Play';
  } else {
    p.start(seq).then(() => {
      // Stop all buttons.
      const btns = document.querySelectorAll('.controls > button');
      for (let btn of btns) {
        btn.textContent = 'Play';
      }
    });
    event.target.textContent = 'Stop';
  }
}

function doTheCodeMirrors() {
  const codeMirrorConfig = {
    theme:'dracula',
    tabSize: 2,
    indentUnit: 2,
    lineNumbers: false,
    viewportMargin: Infinity,
  };
  
  // Make an editable code mirror for the code snippets.
  const samples = document.querySelectorAll('textarea.sample');
  
  for (let i = 0; i < samples.length; i++) {
    samples[i].value = samples[i].value.trim();
    
    codeMirrorConfig.readOnly = !samples[i].hasAttribute('editable');
    codeMirrorConfig.mode = samples[i].getAttribute('mode');
    
    const sample = CodeMirror.fromTextArea(samples[i], codeMirrorConfig);
    codeMirrorSamples[samples[i]] = sample;

    sample.on('change', (block) => {
      player.stop();
      runSnippet(block.getValue());
    });
  }
}

function runSnippet(value) {
  try {
    window.eval(value);
  } catch (e) {
    console.log(e);
  }
}
