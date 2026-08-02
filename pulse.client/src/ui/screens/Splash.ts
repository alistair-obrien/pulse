let cachedSplash:HTMLElement | null = null;

let bg : HTMLElement;
let logo : HTMLElement;

export function render(): HTMLElement {
    const root = document.createElement("div");
    root.className = "splash";

    bg = document.createElement("div");
    bg.className = "splash-bg";
    
    logo = document.createElement("div");
    logo.className = "app-logo";
    logo.innerHTML = `
        <svg viewBox="0 0 155 147" fill="currentColor">
            <g transform="matrix(0.15487607,0,0,-0.15487607,-55.573146,175.49297)">
                <path d="M843 1089c-49-18-56-89-12-122 45-33 99-1 99 57 0 48-44 81-87 65z"/>
                <path d="M483 878c10-154 65-247 185-307 66-33 115-83 130-133 6-18 13-64 17-102 7-83 18-106 50-106 38 0 55 35 55 113 0 117 37 173 154 235 120 63 176 162 176 312 0 63-2 71-17 67-10-3-35-8-57-12C1072 928 974 855 930 764 910 722 906 693 899 555 891 384 885 350 865 350c-21 0-35 89-35 215 0 164-33 247-127 315-39 28-131 64-192 74l-34 6z"/>
            </g>
        </svg>`;

    root.append(bg, logo);

    cachedSplash = root;

    return root;
}

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function finish() {

    if (!cachedSplash)
        return;
    
    // Wait until everything is finished.
    await(200);
    bg.classList.add("intro");
    logo.classList.add("intro");

    await wait(1500);
    
    cachedSplash.remove();
    cachedSplash = null;
}