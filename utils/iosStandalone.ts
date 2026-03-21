let hasInstalledIOSStandaloneWorkaround = false;
let stableStandaloneHeight = 0;

export const isIOSDevice = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isStandaloneDisplayMode = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(display-mode: standalone)').matches || !!(window.navigator as Navigator & { standalone?: boolean }).standalone;
};

export const isIOSStandaloneWebApp = (): boolean => isIOSDevice() && isStandaloneDisplayMode();

const isTextEntryElement = (target: EventTarget | null): target is HTMLElement => {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

const setViewportVars = () => {
    if (typeof document === 'undefined') return;
    const innerHeight = Math.round(window.innerHeight);
    const viewportHeight = Math.round(window.visualViewport?.height || innerHeight);
    const viewportOffsetTop = Math.round(window.visualViewport?.offsetTop || 0);
    const obscuredHeight = Math.max(0, innerHeight - viewportHeight - viewportOffsetTop);
    const keyboardInset = obscuredHeight > 120 ? obscuredHeight : 0;
    const nextStableHeight = Math.max(innerHeight, viewportHeight + viewportOffsetTop);

    if (!keyboardInset || !stableStandaloneHeight) {
        stableStandaloneHeight = nextStableHeight;
    }

    document.documentElement.style.setProperty('--app-height', `${stableStandaloneHeight || nextStableHeight}px`);
    document.documentElement.style.setProperty('--visual-viewport-height', `${viewportHeight}px`);
    document.documentElement.style.setProperty('--keyboard-inset', `${keyboardInset}px`);
};

export const installIOSStandaloneWorkaround = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!isIOSStandaloneWebApp() || hasInstalledIOSStandaloneWorkaround) return;

    hasInstalledIOSStandaloneWorkaround = true;
    document.documentElement.classList.add('ios-standalone');
    document.body.classList.add('ios-standalone');

    const handleViewportChange = () => {
        setViewportVars();
    };

    const handleFocusIn = (event: FocusEvent) => {
        if (!isTextEntryElement(event.target)) return;
        document.body.classList.add('ios-keyboard-open');
        setViewportVars();

        const target = event.target;
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                if (document.activeElement !== target) return;
                try {
                    target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                } catch {
                    // Ignore scroll failures on older iOS builds.
                }
            });
        });
    };

    const handleFocusOut = () => {
        window.setTimeout(() => {
            if (!isTextEntryElement(document.activeElement)) {
                document.body.classList.remove('ios-keyboard-open');
            }
            setViewportVars();
        }, 180);
    };

    setViewportVars();
    window.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
};
