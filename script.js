const video = document.getElementById('introVideo');
const startButton = document.getElementById('startButton');
const photoshopButton = document.getElementById('photoshopButton');
const _3dsmaxButton = document.getElementById('3dsmaxButton');
const AIButton = document.getElementById('AIButton');
const windowsButton = document.getElementById('windowsButton');
const lessenButton = document.getElementById('lessenButton');
let firstPlaybackFinished = false;

const restoreIndexState = () => {
    const storedState = sessionStorage.getItem('tipsTricksIndexState');
    if (!storedState) return;
    try {
        const state = JSON.parse(storedState);
        if (video && typeof state.currentTime === 'number') {
            video.currentTime = state.currentTime;
        }
        if (video && typeof state.muted === 'boolean') {
            video.muted = state.muted;
        }
        if (startButton) {
            if (state.started) {
                startButton.classList.add('hidden');
            } else {
                startButton.classList.remove('hidden');
            }
        }
        if (state.visibleButtons) {
            if (photoshopButton) {
                state.visibleButtons.photoshop ? photoshopButton.classList.remove('hidden') : photoshopButton.classList.add('hidden');
            }
            if (_3dsmaxButton) {
                state.visibleButtons.dsmax ? _3dsmaxButton.classList.remove('hidden') : _3dsmaxButton.classList.add('hidden');
            }
            if (AIButton) {
                state.visibleButtons.AI ? AIButton.classList.remove('hidden') : AIButton.classList.add('hidden');
            }
            if (windowsButton) {
                state.visibleButtons.windows ? windowsButton.classList.remove('hidden') : windowsButton.classList.add('hidden');
            }
        }
        if (lessenButton) {
            lessenButton.classList.remove('hidden');
        }
        if (typeof state.scrollY === 'number') {
            window.scrollTo(0, state.scrollY);
        }
        if (state.isPlaying) {
            video.play().catch(() => {});
        }
    } catch (error) {
        console.warn('Failed to restore index state:', error);
    }
};

const saveIndexState = () => {
    const state = {
        currentTime: video?.currentTime || 0,
        muted: video?.muted ?? true,
        started: startButton ? !startButton.classList.contains('hidden') : false,
        isPlaying: video ? !video.paused : false,
        scrollY: window.scrollY,
        visibleButtons: {
            photoshop: photoshopButton ? !photoshopButton.classList.contains('hidden') : false,
            dsmax: _3dsmaxButton ? !_3dsmaxButton.classList.contains('hidden') : false,
            AI: AIButton ? !AIButton.classList.contains('hidden') : false,
            windows: windowsButton ? !windowsButton.classList.contains('hidden') : false,
            lessen: true,
        },
    };
    sessionStorage.setItem('tipsTricksIndexState', JSON.stringify(state));
};

if (startButton) {
    startButton.addEventListener('click', async () => {
        try {
            video.muted = false;
            await video.play();
            startButton.classList.add('hidden');
            saveIndexState();
        } catch (err) {
            console.warn('Play with sound failed:', err);
            video.muted = true;
        }
    });
}

window.addEventListener('pageshow', restoreIndexState);
window.addEventListener('beforeunload', saveIndexState);

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
        window.location.href = 'photoshop.html';
    });
}

// Optional: handle click on the 3ds Max button
if (_3dsmaxButton) {
    _3dsmaxButton.addEventListener('click', () => {
        window.location.href = '3dsmax.html';
    });
}

// Optional: handle click on the AI button
if (AIButton) {
    AIButton.addEventListener('click', () => {
        window.location.href = 'AI.html';
    });
}

// Optional: handle click on the Windows 11 button
if (windowsButton) {
    windowsButton.addEventListener('click', () => {
        window.location.href = 'windows.html';
    });
}

// Optional: handle click on the Lessen button
if (lessenButton) {
    lessenButton.addEventListener('click', () => {
        window.location.href = '../../stemmen/index.html';
    });
}
