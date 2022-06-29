const container = document.getElementById('container');
const canvas = document.getElementById('canvas1');
const file = document.getElementById('file-upload');
const demoCheckbox = document.getElementById('demo-checkbox');

const resolution = 2 ** 10;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// holds all Canvas API methods and attributes
const context = canvas.getContext('2d');

let audioSource;
let analyzer;


/**
 * configure audio node upon window load
 * refactor code 
 * allow toggling of demo-checkbox
 * clicking anywhere in the container will play/pause the current song, not reset it
 */

container.addEventListener('click', () => {
    // let audio1 = new Audio();
    const audio1 = document.getElementById('audio1');
    audio1.src = 'sounds/sample.mp3';
    const audioContext = new AudioContext(); // add support for all browsers (last one is for Safari)
    audio1.play();
    // create audio node from the audio HTML
    audioSource = audioContext.createMediaElementSource(audio1);

    // create analyzer node (get time/frequency data)
    analyzer = audioContext.createAnalyser();

    // allow analyzer to analyze our audio node
    audioSource.connect(analyzer);

    // connect analyzer to default speakers
    analyzer.connect(audioContext.destination);

    // number of audio samples wanted in analyzer data file
    analyzer.fftSize = resolution;

    // # data values in analyzer data file
    // HALF of fftSize 
    // = number of bars on screen
    const bufferLength = analyzer.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    // width of single bar in visualizer
    const barWidth = canvas.width / 2 / bufferLength;
    let barHeight;
    let x; // increment by barWidth for each bar

    function animate() {
        x = 0;
        // clear canvas first
        context.clearRect(0, 0, canvas.width, canvas.height);

        // determines the height of each bar 
        // = decibel value of each frequency
        analyzer.getByteFrequencyData(dataArray);

        drawlVisualizer(bufferLength, x, barWidth, barHeight, dataArray)

        requestAnimationFrame(animate);
    }
    animate();
});

file.addEventListener('change', function() {
    const files = this.files;
    const audio1 = document.getElementById('audio1');
    audio1.src = URL.createObjectURL(files[0]);
    audio1.load();
    audio1.play();

    audioSource = audioContext.createMediaElementSource(audio1);

    // create analyzer node (get time/frequency data)
    analyzer = audioContext.createAnalyser();

    // allow analyzer to analyze our audio node
    audioSource.connect(analyzer);

    // connect analyzer to default speakers
    analyzer.connect(audioContext.destination);

    // number of audio samples wanted in analyzer data file
    analyzer.fftSize = resolution;

    // # data values in analyzer data file
    // HALF of fftSize 
    // = number of bars on screen
    const bufferLength = analyzer.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    // width of single bar in visualizer
    const barWidth = canvas.width / 2 / bufferLength;
    let barHeight;
    let x; // increment by barWidth for each bar

    function animate() {
        x = 0;
        // clear canvas first
        context.clearRect(0, 0, canvas.width, canvas.height);

        // determines the height of each bar 
        // = decibel value of each frequency
        analyzer.getByteFrequencyData(dataArray);

        drawlVisualizer(bufferLength, x, barWidth, barHeight, dataArray)

        requestAnimationFrame(animate);
    }
    animate();
});

function drawlVisualizer(bufferLength, x, barWidth, barHeight, dataArray) {
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] + 2;
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2); // this is the new (0, 0)
        // context.rotate(i * Math.PI * 4 / bufferLength);
        let innerAngle = 2 * Math.PI / (bufferLength);
        context.rotate(i * innerAngle);

        const hue = i * 0.71;
        context.fillStyle = `hsl(${hue}, 100%, 50%)`;
        context.fillRect(0, (barHeight * -0.1) + 100, barWidth, barHeight);
        // context.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        context.restore();
    }
}