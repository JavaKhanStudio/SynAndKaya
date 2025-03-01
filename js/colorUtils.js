export function generateColorPalette(r, g, b) {
    // Helper function to convert RGB to hex
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Helper to adjust brightness
    function adjustBrightness(r, g, b, amount) {
        return {
            r: Math.max(0, Math.min(255, r + amount)),
            g: Math.max(0, Math.min(255, g + amount)),
            b: Math.max(0, Math.min(255, b + amount))
        };
    }

    // Enhanced metallic shade generator with more nuanced control - Disney inspired
    function metallicShade(r, g, b, brightnessAdjust, saturationFactor, metallicFactor = 0.45) {
        // Disney colors are more vibrant and lively
        // First, enhance the base color with more saturation
        let enhancedR = Math.min(255, r * 1.1);
        let enhancedG = Math.min(255, g * 1.1);
        let enhancedB = Math.min(255, b * 1.1);

        // Apply brightness adjustment with less darkening than before
        brightnessAdjust = brightnessAdjust - 5; // Less darkening for more vibrant appearance

        const adjusted = adjustBrightness(enhancedR, enhancedG, enhancedB, brightnessAdjust);
        let adjustedR = adjusted.r;
        let adjustedG = adjusted.g;
        let adjustedB = adjusted.b;

        // Convert to HSL for better control over saturation
        const max = Math.max(adjustedR, adjustedG, adjustedB) / 255;
        const min = Math.min(adjustedR, adjustedG, adjustedB) / 255;
        const lightness = (max + min) / 2;

        let d = max - min;
        let saturation;

        if (d === 0) {
            saturation = 0;
        } else {
            saturation = d / (1 - Math.abs(2 * lightness - 1));
        }

        // For Disney-like colors, we want more saturation (opposite of traditional metallic)
        saturation = Math.max(0, Math.min(1, saturation * 1.2 * saturationFactor));

        // Add a metallic tint but preserve more of the original color's vibrancy
        const grayValue = (adjustedR + adjustedG + adjustedB) / 3;

        // Use a reduced metallicFactor to preserve more color
        const adjustedMetallicFactor = metallicFactor * 0.8;

        adjustedR = Math.round(adjustedR * (1 - adjustedMetallicFactor) + grayValue * adjustedMetallicFactor);
        adjustedG = Math.round(adjustedG * (1 - adjustedMetallicFactor) + grayValue * adjustedMetallicFactor);
        adjustedB = Math.round(adjustedB * (1 - adjustedMetallicFactor) + grayValue * adjustedMetallicFactor);

        return {
            r: adjustedR,
            g: adjustedG,
            b: adjustedB
        };
    }

    // Generate text color with good contrast
    function contrastTextColor(r, g, b) {
        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // For metallic effects, we want more than just black/white
        if (luminance > 0.6) {
            // Dark text on light backgrounds
            return { r: 45, g: 35, b: 35 };
        } else {
            // Light text on dark backgrounds - slightly metallic
            return { r: 230, g: 230, b: 230 };
        }
    }

    // Convert RGB object to CSS rgb string
    function rgbToString(rgbObj) {
        return `rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})`;
    }

    // Generate border color with good visibility
    function generateBorderColor(r, g, b) {
        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        if (luminance > 0.7) {
            // Dark border for light colors
            return rgbToString(adjustBrightness(r, g, b, -120));
        } else if (luminance < 0.3) {
            // Light border for dark colors
            return `rgba(255, 255, 255, 0.7)`;
        } else {
            // Darker metallic border for mid-tones
            return rgbToString(metallicShade(r, g, b, -60, 0.5));
        }
    }

    // Generate multiple levels of metallic shades
    // Going from darkest (S1) to lightest (S7)
    const COLOR_METAL_S1 = metallicShade(r, g, b, -90, 0.6, 0.6);  // Darkest
    const COLOR_METAL_S2 = metallicShade(r, g, b, -70, 0.62, 0.58);
    const COLOR_METAL_S3 = metallicShade(r, g, b, -50, 0.65, 0.56);
    const COLOR_METAL_S4 = metallicShade(r, g, b, -25, 0.7, 0.54);  // Mid (replaces COLOR_MID)
    const COLOR_METAL_S5 = metallicShade(r, g, b, 0, 0.75, 0.52);
    const COLOR_METAL_S6 = metallicShade(r, g, b, 25, 0.8, 0.5);
    const COLOR_METAL_S7 = metallicShade(r, g, b, 50, 0.85, 0.48);  // Lightest

    // Generate text colors
    const textColorObj = contrastTextColor(r, g, b);
    const textColorStr = rgbToString(textColorObj);

    // Generate inverse of the text color for shadow effect
    function inverseTextColor(textObj) {
        return {
            r: 255 - textObj.r,
            g: 255 - textObj.g,
            b: 255 - textObj.b
        };
    }

    const textInverseObj = inverseTextColor(textColorObj);

    return {
        // Legacy naming for compatibility
        COLOR_DARK: rgbToString(COLOR_METAL_S1),
        COLOR_MID: rgbToString(COLOR_METAL_S4),
        COLOR_LIGHT: rgbToString(COLOR_METAL_S7),

        // New enhanced metallic palette with 7 gradations
        COLOR_METAL_S1: rgbToString(COLOR_METAL_S1),
        COLOR_METAL_S2: rgbToString(COLOR_METAL_S2),
        COLOR_METAL_S3: rgbToString(COLOR_METAL_S3),
        COLOR_METAL_S4: rgbToString(COLOR_METAL_S4),
        COLOR_METAL_S5: rgbToString(COLOR_METAL_S5),
        COLOR_METAL_S6: rgbToString(COLOR_METAL_S6),
        COLOR_METAL_S7: rgbToString(COLOR_METAL_S7),

        // Original properties
        COLOR_BORDER: generateBorderColor(r, g, b),
        COLOR_TEXT: textColorStr,
        COLOR_TEXT_INVERSE: rgbToString(textInverseObj),

        // Add hex versions for convenience
        COLOR_METAL_S1_HEX: rgbToHex(COLOR_METAL_S1.r, COLOR_METAL_S1.g, COLOR_METAL_S1.b),
        COLOR_METAL_S2_HEX: rgbToHex(COLOR_METAL_S2.r, COLOR_METAL_S2.g, COLOR_METAL_S2.b),
        COLOR_METAL_S3_HEX: rgbToHex(COLOR_METAL_S3.r, COLOR_METAL_S3.g, COLOR_METAL_S3.b),
        COLOR_METAL_S4_HEX: rgbToHex(COLOR_METAL_S4.r, COLOR_METAL_S4.g, COLOR_METAL_S4.b),
        COLOR_METAL_S5_HEX: rgbToHex(COLOR_METAL_S5.r, COLOR_METAL_S5.g, COLOR_METAL_S5.b),
        COLOR_METAL_S6_HEX: rgbToHex(COLOR_METAL_S6.r, COLOR_METAL_S6.g, COLOR_METAL_S6.b),
        COLOR_METAL_S7_HEX: rgbToHex(COLOR_METAL_S7.r, COLOR_METAL_S7.g, COLOR_METAL_S7.b)
    };
}

// Function to create a linear gradient with enhanced metallic shades
export function createMetallicGradient(svgId, gradientId, r, g, b, horizontal = true) {
    const palette = generateEnhancedMetallicPalette(r, g, b);
    const svg = document.getElementById(svgId);

    if (!svg) {
        console.error(`SVG with ID ${svgId} not found`);
        return null;
    }

    // Create defs if it doesn't exist
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);
    }

    // Create linearGradient element
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);

    if (horizontal) {
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '50%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '50%');
    } else {
        gradient.setAttribute('x1', '50%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '50%');
        gradient.setAttribute('y2', '100%');
    }

    // Add stops for each metallic shade
    const stops = [
        { offset: '0%', color: palette.COLOR_METAL_S1 },
        { offset: '16.7%', color: palette.COLOR_METAL_S2 },
        { offset: '33.3%', color: palette.COLOR_METAL_S3 },
        { offset: '50%', color: palette.COLOR_METAL_S4 },
        { offset: '66.7%', color: palette.COLOR_METAL_S5 },
        { offset: '83.3%', color: palette.COLOR_METAL_S6 },
        { offset: '100%', color: palette.COLOR_METAL_S7 }
    ];

    stops.forEach(stopInfo => {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', stopInfo.offset);
        stop.setAttribute('stop-color', stopInfo.color);
        gradient.appendChild(stop);
    });

    defs.appendChild(gradient);
    return `url(#${gradientId})`;
}

// Example SVG usage function
export function applyMetallicGradientToSVG(svgSelector, baseColor = { r: 120, g: 120, b: 180 }) {
    const { r, g, b } = baseColor;
    const palette = generateEnhancedMetallicPalette(r, g, b);

    // Apply the palette to SVG elements
    const svg = document.querySelector(svgSelector);
    if (!svg) return;

    // Create gradient definition
    const gradientId = 'metallicGradient';
    createMetallicGradient(svg.id, gradientId, r, g, b);

    // Apply gradient to elements
    // Example: Find all paths and apply the gradient
    const paths = svg.querySelectorAll('path');
    paths.forEach(path => {
        path.setAttribute('fill', `url(#${gradientId})`);
    });
}