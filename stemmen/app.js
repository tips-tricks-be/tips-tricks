const currentUserKey = 'currentUser';
const ratingStoragePrefix = 'movieRatings:';
const guestUser = 'Gast Gebruiker';
const defaultRatings = {
    movie1: 4,
    movie2: 5,
    movie3: 3,
    movie4: 2,
    movie5: 5,
    movie6: 1,
    movie7: 4,
    movie8: 3,
    movie9: 5,
    movie10: 4,
    movie11: 2,
    movie12: 3,
};
const movieRatings = { ...defaultRatings };
let currentUser = guestUser;
let currentHeroIndex = 0;
const heroImages = [];

const loadHeroImages = async () => {
    try {
        const response = await fetch('img/index.json');
        if (!response.ok) throw new Error('Hero manifest not found');
        const files = await response.json();
        if (!Array.isArray(files)) return;

        const images = files
            .filter((name) => typeof name === 'string' && name.toLowerCase() !== 'favicon-96x96.png')
            .filter((name) => /\.(jpe?g|png|webp|gif|avif)$/i.test(name))
            .map((name) => `img/${encodeURIComponent(name).replace(/%2F/g, '/').replace(/%20/g, '%20')}`);

        if (images.length > 0) {
            heroImages.length = 0;
            heroImages.push(...images);
        }
    } catch (error) {
        console.warn('Could not load hero images manifest:', error);
    }
};

const cookieConsentKey = 'ratingCookieConsent';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return '';
};

const setCookie = (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const deleteCookie = (name) => {
    setCookie(name, '', -1);
};

const getRatingsKey = () => `${ratingStoragePrefix}${currentUser}`;

const hasCookieConsent = () => getCookie(cookieConsentKey) === 'accepted';

const showCookieConsent = () => {
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) {
        banner.classList.remove('hidden');
    }
};

const hideCookieConsent = () => {
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) {
        banner.classList.add('hidden');
    }
};

const acceptCookieConsent = () => {
    setCookie(cookieConsentKey, 'accepted', 365);
    hideCookieConsent();
};

const loadCookieConsent = () => {
    if (!hasCookieConsent()) {
        showCookieConsent();
    } else {
        hideCookieConsent();
    }
};

const updateUserDisplay = () => {
    const userLabel = document.getElementById('currentUser');
    if (userLabel) {
        userLabel.textContent = currentUser === guestUser ? 'Gast Gebruiker' : `Ingeschreven als ${currentUser}`;
    }
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    if (signInBtn) {
        signInBtn.classList.toggle('hidden', currentUser !== guestUser);
    }
    if (signOutBtn) {
        signOutBtn.classList.toggle('hidden', currentUser === guestUser);
    }
};

const loadCurrentUser = () => {
    const storedUser = getCookie(currentUserKey);
    if (storedUser) {
        currentUser = decodeURIComponent(storedUser);
    }
    updateUserDisplay();
};

const setCurrentUser = (userName) => {
    currentUser = userName && userName.trim() ? userName.trim() : guestUser;
    if (currentUser === guestUser) {
        deleteCookie(currentUserKey);
    } else {
        setCookie(currentUserKey, currentUser, 30);
    }
    updateUserDisplay();
    loadRatings();
    updateRatings();
};

const signOutUser = () => {
    currentUser = guestUser;
    deleteCookie(currentUserKey);
    updateUserDisplay();
    loadRatings();
    updateRatings();
};

const loadRatings = () => {
    Object.assign(movieRatings, defaultRatings);
    const stored = localStorage.getItem(getRatingsKey());
    if (!stored) return;
    try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
            Object.keys(parsed).forEach((key) => {
                const value = Number(parsed[key]);
                if (!Number.isNaN(value) && value >= 0 && value <= 5) {
                    movieRatings[key] = value;
                }
            });
        }
    } catch (error) {
        console.warn('Failed to load saved ratings:', error);
    }
};

const saveRatings = () => {
    if (!hasCookieConsent()) {
        return;
    }
    localStorage.setItem(getRatingsKey(), JSON.stringify(movieRatings));
};

const updateRatingTooltips = () => {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star) => {
        const value = Number(star.dataset.value);
        if (currentUser === guestUser) {
            star.title = 'Log in om te beoordelen';
        } else {
            star.title = `Beoordeel met ${value} ster${value === 1 ? '' : 'ren'}`;
        }
    });
};

const updateRatings = () => {
    const ratingContainers = document.querySelectorAll('[data-movie-id]');

    ratingContainers.forEach((container) => {
        const movieId = container.dataset.movieId;
        const rating = movieRatings[movieId] || 0;
        const stars = container.querySelectorAll('.star');

        stars.forEach((star) => {
            const value = Number(star.dataset.value);
            const isActive = value <= rating;
            star.classList.toggle('text-red-500', isActive);
            star.classList.toggle('text-slate-500', !isActive);
            star.setAttribute('aria-pressed', isActive);
        });

        const ratingValue = container.parentElement.querySelector('.rating-value');
        if (ratingValue) {
            ratingValue.textContent = rating;
        }
    });
    updateRatingTooltips();
};

let pendingRatingAction = null;

const showSignInModal = (pendingAction = null) => {
    pendingRatingAction = pendingAction;
    const modal = document.getElementById('signInModal');
    const input = document.getElementById('signInModalInput');
    if (!modal || !input) return;
    modal.classList.remove('hidden');
    input.value = pendingAction && pendingAction.username ? pendingAction.username : '';
    setTimeout(() => input.focus(), 50);
};

const hideSignInModal = () => {
    const modal = document.getElementById('signInModal');
    const input = document.getElementById('signInModalInput');
    if (modal) {
        modal.classList.add('hidden');
    }
    if (input) {
        input.value = '';
    }
    pendingRatingAction = null;
};

const submitSignInModal = () => {
    const input = document.getElementById('signInModalInput');
    if (!input) return;
    const name = input.value.trim();
    if (!name) {
        window.alert('Voer een gebruikersnaam in om te kunnen stemmen.');
        input.focus();
        return;
    }
    setCurrentUser(name);
    if (pendingRatingAction) {
        movieRatings[pendingRatingAction.movieId] = pendingRatingAction.rating;
        saveRatings();
        updateRatings();
    }
    hideSignInModal();
};

const bindRatingClicks = () => {
    const stars = document.querySelectorAll('.star');

    stars.forEach((star) => {
        star.addEventListener('click', () => {
            const container = star.closest('[data-movie-id]');
            if (!container) return;
            const movieId = container.dataset.movieId;
            const newRating = Number(star.dataset.value);

            if (currentUser === guestUser) {
                showSignInModal({ movieId, rating: newRating });
                return;
            }

            movieRatings[movieId] = newRating;
            saveRatings();
            updateRatings();
        });
    });
};

const initLogin = () => {
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const acceptCookiesBtn = document.getElementById('acceptCookiesBtn');
    const dismissCookiesBtn = document.getElementById('dismissCookiesBtn');
    const confirmSignInBtn = document.getElementById('confirmSignInBtn');
    const cancelSignInBtn = document.getElementById('cancelSignInBtn');
    const signInInput = document.getElementById('signInModalInput');

    if (signInBtn) {
        signInBtn.addEventListener('click', () => showSignInModal());
    }

    if (confirmSignInBtn) {
        confirmSignInBtn.addEventListener('click', submitSignInModal);
    }

    if (cancelSignInBtn) {
        cancelSignInBtn.addEventListener('click', hideSignInModal);
    }

    if (signInInput) {
        signInInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                submitSignInModal();
            }
            if (event.key === 'Escape') {
                hideSignInModal();
            }
        });
    }

    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            const confirmed = window.confirm('Sign out from ' + currentUser + '?');
            if (confirmed) {
                signOutUser();
            }
        });
    }

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', acceptCookieConsent);
    }

    if (dismissCookiesBtn) {
        dismissCookiesBtn.addEventListener('click', hideCookieConsent);
    }
};

const updateHeroBackground = () => {
    const heroBackground = document.getElementById('heroBackground');
    if (!heroBackground || heroImages.length === 0) return;
    heroBackground.style.backgroundImage = `url('${heroImages[currentHeroIndex]}')`;
};

const initHeroImageRotator = () => {
    if (heroImages.length === 0) return;
    updateHeroBackground();
    if (heroImages.length <= 1) return;

    setInterval(() => {
        currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
        updateHeroBackground();
    }, 5000);
};

const initMobileMenuToggle = () => {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const expanded = mobileMenu.classList.contains('hidden') ? 'false' : 'true';
        mobileMenuButton.setAttribute('aria-expanded', expanded);
    });
};

const initApp = async () => {
    await loadHeroImages();
    loadCurrentUser();
    loadCookieConsent();
    loadRatings();
    bindRatingClicks();
    updateRatings();
    initLogin();
    initMobileMenuToggle();
    initHeroImageRotator();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
 