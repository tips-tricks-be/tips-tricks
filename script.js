const video = document.getElementById('introVideo');
const startButton = document.getElementById('startButton');
const photoshopButton = document.getElementById('photoshopButton');
const _3dsmaxButton = document.getElementById('3dsmaxButton');
const AIButton = document.getElementById('AIButton');
const windowsButton = document.getElementById('windowsButton');
let firstPlaybackFinished = false;

const playWithSound = async () => {
    if (!video) return;
    video.muted = false;
    try {
        await video.play();
        if (startButton) {
            startButton.classList.add('hidden');
        }
    } catch (err) {
        console.warn('Autoplay blocked; showing start button.', err);
        video.muted = true;
        if (startButton) {
            startButton.classList.remove('hidden');
        }
    }
};

if (startButton) {
    startButton.addEventListener('click', async () => {
        startButton.classList.add('hidden');
        video.muted = false;
        try {
            await video.play();
        } catch (err) {
            console.warn('Play with sound failed:', err);
        }
    });
}

video.addEventListener('loadedmetadata', () => {
    playWithSound();
});

video.addEventListener('ended', () => {
    if (!firstPlaybackFinished) {
        firstPlaybackFinished = true;
        video.muted = true;
    }
    video.currentTime = 0;
    video.play().catch(() => {});
});

// Show the Photoshop button after 25 seconds
setTimeout(() => {
    if (photoshopButton) {
        photoshopButton.classList.remove('hidden');
    }
}, 25000);

// Show the 3ds Max button after 30 seconds
setTimeout(() => {
    if (_3dsmaxButton) {
        _3dsmaxButton.classList.remove('hidden');
    }
}, 25000);
setTimeout(() => {
    if (AIButton) {
        AIButton.classList.remove('hidden');
    }
}, 25000);

// Show the Windows 11 button after 35 seconds
setTimeout(() => {
    if (windowsButton) {
        windowsButton.classList.remove('hidden');
    }
}, 25000);

// Optional: handle click on the photoshop button
if (photoshopButton) {
    photoshopButton.addEventListener('click', () => {
        // placeholder action — customize as needed
        window.alert('Photoshop button clicked');
    });
}

// Optional: handle click on the 3ds Max button
if (_3dsmaxButton) {
    _3dsmaxButton.addEventListener('click', () => {
        // placeholder action — customize as needed
        window.alert('3ds Max button clicked');
    });
}

// Optional: handle click on the AI button
if (AIButton) {
    AIButton.addEventListener('click', () => {
        // placeholder action — customize as needed
        window.alert('AI button clicked');
    });
}

// Optional: handle click on the Windows 11 button
if (windowsButton) {
    windowsButton.addEventListener('click', () => {
        // placeholder action — customize as needed
        window.alert('Windows 11 button clicked');
    });
}
