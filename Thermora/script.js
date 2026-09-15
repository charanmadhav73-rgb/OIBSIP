/* =====================================
   THERMORA
   Temperature Intelligence Engine
===================================== */

// DOM Elements
const temperatureInput = document.getElementById("temperatureInput");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const convertButton = document.getElementById("convertButton");
const clearButton = document.getElementById("clearButton");
const swapButton = document.getElementById("swapButton");
const copyButton = document.getElementById("copyButton");

const resultValue = document.getElementById("resultValue");
const resultUnit = document.getElementById("resultUnit");
const errorMessage = document.getElementById("errorMessage");

const orbValue = document.getElementById("orbValue");
const orbUnit = document.getElementById("orbUnit");
const unitGrid = document.getElementById("unitGrid");

// Navigation & Panels
const modeTabs = document.querySelectorAll(".mode-tab");
const modePanels = document.querySelectorAll(".mode-panel");

// Compare Elements
const compareA = document.getElementById("compareA");
const compareB = document.getElementById("compareB");
const differenceValue = document.getElementById("differenceValue");
const comparisonTitle = document.getElementById("comparisonTitle");
const comparisonText = document.getElementById("comparisonText");

// Analyze Elements
const analysisTitle = document.getElementById("analysisTitle");
const analysisDescription = document.getElementById("analysisDescription");
const analysisTemperature = document.getElementById("analysisTemperature");
const analysisZone = document.getElementById("analysisZone");
const analysisPosition = document.getElementById("analysisPosition");

// Formula Elements
const formulaName = document.getElementById("formulaName");
const formulaExpression = document.getElementById("formulaExpression");
const formulaCalculation = document.getElementById("formulaCalculation");

// History & Visual Scale Elements
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const scaleIndicator = document.getElementById("scaleIndicator");
const scaleValue = document.getElementById("scaleValue");

// State & Boundaries
let history = JSON.parse(localStorage.getItem("thermora_history")) || [];

const ABSOLUTE_ZERO_CELSIUS = -273.15;

const UNIT_LABELS = {
    celsius: "°C",
    fahrenheit: "°F",
    kelvin: "K",
    rankine: "°R",
    reaumur: "°Ré",
    delisle: "°De",
    newton: "°N"
};

const UNIT_NAMES = {
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    rankine: "Rankine",
    reaumur: "Réaumur",
    delisle: "Delisle",
    newton: "Newton"
};


/* =====================================
   CONVERSION MATHEMATICS
===================================== */

function toCelsius(val, unit) {

    switch (unit) {

        case "celsius":
            return val;

        case "fahrenheit":
            return (val - 32) * (5 / 9);

        case "kelvin":
            return val - 273.15;

        case "rankine":
            return (val - 491.67) * (5 / 9);

        case "reaumur":
            return val * (5 / 4);

        case "delisle":
            return 100 - (val * 2 / 3);

        case "newton":
            return val * (100 / 33);

        default:
            return val;
    }
}


function fromCelsius(cVal, unit) {

    switch (unit) {

        case "celsius":
            return cVal;

        case "fahrenheit":
            return (cVal * 9 / 5) + 32;

        case "kelvin":
            return cVal + 273.15;

        case "rankine":
            return (cVal + 273.15) * (9 / 5);

        case "reaumur":
            return cVal * (4 / 5);

        case "delisle":
            return (100 - cVal) * (3 / 2);

        case "newton":
            return cVal * (33 / 100);

        default:
            return cVal;
    }
}


/* =====================================
   CORE CONVERSION ENGINE
===================================== */

function processConversion() {

    const inputValue = parseFloat(temperatureInput.value);

    const sourceUnit = fromUnit.value;
    const targetUnit = toUnit.value;


    if (isNaN(inputValue)) {

        showError("Please enter a valid numeric value.");

        return;
    }


    const celsiusVal = toCelsius(inputValue, sourceUnit);


    if (celsiusVal < ABSOLUTE_ZERO_CELSIUS) {

        showError(
            "Value is below Absolute Zero (-273.15°C). Physically impossible!"
        );

        return;
    }


    clearError();


    const convertedVal = fromCelsius(celsiusVal, targetUnit);

    const formattedResult = convertedVal.toFixed(2);


    resultValue.textContent = formattedResult;

    resultUnit.textContent = UNIT_LABELS[targetUnit];


    orbValue.textContent = Math.round(celsiusVal);

    orbUnit.textContent = "°C";


    updateUnitGrid(celsiusVal);

    updateAnalysis(celsiusVal);

    updateFormula(
        inputValue,
        sourceUnit,
        targetUnit,
        formattedResult
    );

    updateScale(celsiusVal);


    saveHistory(
        inputValue,
        sourceUnit,
        formattedResult,
        targetUnit
    );
}


/* =====================================
   ERROR HANDLING
===================================== */

function showError(msg) {

    errorMessage.style.display = "block";

    errorMessage.textContent = msg;

    resultValue.textContent = "--";
}


function clearError() {

    errorMessage.style.display = "none";

    errorMessage.textContent = "";
}


/* =====================================
   DYNAMIC UNIT RESULTS
===================================== */

function updateUnitGrid(celsiusVal) {

    unitGrid.innerHTML = "";


    Object.keys(UNIT_LABELS).forEach(unitKey => {

        const val =
            fromCelsius(celsiusVal, unitKey).toFixed(2);


        const card =
            document.createElement("div");


        card.className = "unit-card";


        card.innerHTML = `
            <small>${UNIT_NAMES[unitKey]}</small>
            <strong>
                ${val} ${UNIT_LABELS[unitKey]}
            </strong>
        `;


        unitGrid.appendChild(card);
    });
}


/* =====================================
   TEMPERATURE ANALYSIS
===================================== */

function updateAnalysis(celsius) {

    let title = "";

    let desc = "";

    let zone = "";


    if (celsius < 0) {

        title = "Freezing";

        desc =
            "Below the freezing point of water. Expect icy conditions.";

        zone = "Sub-Zero";

    }

    else if (celsius <= 15) {

        title = "Cold";

        desc =
            "Chilly conditions. Light outdoor apparel recommended.";

        zone = "Cold";

    }

    else if (celsius <= 25) {

        title = "Mild / Comfortable";

        desc =
            "Standard room temperature range. Ideal comfort conditions.";

        zone = "Moderate";

    }

    else if (celsius <= 38) {

        title = "Warm";

        desc =
            "Warm environment, approaching core human body temperature.";

        zone = "Warm";

    }

    else if (celsius < 100) {

        title = "Hot";

        desc =
            "High heat conditions. Avoid prolonged exposure.";

        zone = "Extreme Heat";

    }

    else {

        title = "Boiling & Beyond";

        desc =
            "At or above the boiling point of water. Extremely hazardous environment.";

        zone = "Boiling Zone";
    }


    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                ((celsius + 20) / 120) * 100
            )
        ).toFixed(0);


    analysisTitle.textContent = title;

    analysisDescription.textContent = desc;

    analysisTemperature.textContent =
        `${celsius.toFixed(1)}°C`;

    analysisZone.textContent = zone;

    analysisPosition.textContent =
        `${percentage}%`;
}


/* =====================================
   FORMULA LAB
===================================== */

function updateFormula(
    inputVal,
    source,
    target,
    outputVal
) {

    formulaName.textContent =
        `${UNIT_NAMES[source]} → ${UNIT_NAMES[target]}`;


    if (source === target) {

        formulaExpression.textContent =
            `${UNIT_LABELS[target]} = ${UNIT_LABELS[source]}`;

        formulaCalculation.textContent =
            `${inputVal} = ${outputVal}${UNIT_LABELS[target]}`;

        return;
    }


    if (
        source === "celsius" &&
        target === "fahrenheit"
    ) {

        formulaExpression.textContent =
            "°F = (°C × 9/5) + 32";

        formulaCalculation.textContent =
            `(${inputVal} × 9/5) + 32 = ${outputVal}°F`;
    }


    else if (
        source === "fahrenheit" &&
        target === "celsius"
    ) {

        formulaExpression.textContent =
            "°C = (°F - 32) × 5/9";

        formulaCalculation.textContent =
            `(${inputVal} - 32) × 5/9 = ${outputVal}°C`;
    }


    else {

        formulaExpression.textContent =
            `Internal conversion: [${UNIT_NAMES[source]}] → [Celsius] → [${UNIT_NAMES[target]}]`;

        formulaCalculation.textContent =
            `${inputVal} ${UNIT_LABELS[source]} → ${outputVal} ${UNIT_LABELS[target]}`;
    }
}


/* =====================================
   VISUAL TEMPERATURE SCALE
===================================== */

function updateScale(celsius) {

    const clampedCelsius =
        Math.max(
            -20,
            Math.min(100, celsius)
        );


    const percentage =
        ((clampedCelsius + 20) / 120) * 100;


    if (scaleIndicator) {

        scaleIndicator.style.left =
            `${percentage}%`;
    }


    if (scaleValue) {

        scaleValue.textContent =
            `${celsius.toFixed(1)}°C`;
    }
}


/* =====================================
   COMPARE MODE
===================================== */

function updateComparison() {

    const valA =
        parseFloat(compareA.value);

    const valB =
        parseFloat(compareB.value);


    if (isNaN(valA) || isNaN(valB)) {

        return;
    }


    const diff =
        (valB - valA).toFixed(1);


    const absDiff =
        Math.abs(diff);


    differenceValue.textContent =
        (diff >= 0 ? "+" : "-") + absDiff;


    if (diff > 0) {

        comparisonTitle.textContent =
            "B is warmer";

        comparisonText.textContent =
            `Temperature B is ${absDiff}°C warmer than temperature A.`;
    }


    else if (diff < 0) {

        comparisonTitle.textContent =
            "A is warmer";

        comparisonText.textContent =
            `Temperature A is ${absDiff}°C warmer than temperature B.`;
    }


    else {

        comparisonTitle.textContent =
            "Temperatures are equal";

        comparisonText.textContent =
            "Both measurements are identical.";
    }
}


/* =====================================
   HISTORY MANAGEMENT
===================================== */

function saveHistory(
    fromVal,
    fromU,
    toVal,
    toU
) {

    const item = {

        id: Date.now(),

        text:
            `${fromVal} ${UNIT_LABELS[fromU]} = ${toVal} ${UNIT_LABELS[toU]}`,

        timestamp:
            new Date().toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
    };


    history.unshift(item);


    if (history.length > 20) {

        history.pop();
    }


    localStorage.setItem(
        "thermora_history",
        JSON.stringify(history)
    );


    renderHistory();
}


function renderHistory() {

    if (!historyList) {

        return;
    }


    if (history.length === 0) {

        historyList.innerHTML =
            `<p class="empty-history">
                Your conversions will appear here.
            </p>`;

        return;
    }


    historyList.innerHTML =
        history.map(item => `

            <div class="history-item">

                <strong>
                    ${item.text}
                </strong>

                <small>
                    ${item.timestamp}
                </small>

            </div>

        `).join("");
}


/* =====================================
   MODE NAVIGATION
===================================== */

modeTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        const mode =
            tab.dataset.mode;


        modeTabs.forEach(t =>
            t.classList.remove("active")
        );


        modePanels.forEach(p =>
            p.classList.remove("active")
        );


        tab.classList.add("active");


        const activePanel =
            document.getElementById(
                `${mode}Panel`
            );


        if (activePanel) {

            activePanel.classList.add("active");
        }

    });

});


/* =====================================
   EVENT LISTENERS
===================================== */

convertButton.addEventListener(
    "click",
    processConversion
);


temperatureInput.addEventListener(
    "input",
    processConversion
);


fromUnit.addEventListener(
    "change",
    processConversion
);


toUnit.addEventListener(
    "change",
    processConversion
);


/* =====================================
   SWAP UNITS
===================================== */

swapButton.addEventListener("click", () => {

    const temp =
        fromUnit.value;


    fromUnit.value =
        toUnit.value;


    toUnit.value =
        temp;


    processConversion();
});


/* =====================================
   CLEAR BUTTON
===================================== */

clearButton.addEventListener("click", () => {

    temperatureInput.value = "";

    resultValue.textContent = "--";

    clearError();
});


/* =====================================
   COPY RESULT
===================================== */

copyButton.addEventListener("click", () => {

    const textToCopy =
        `${resultValue.textContent} ${resultUnit.textContent}`;


    navigator.clipboard
        .writeText(textToCopy)
        .then(() => {

            const originalText =
                copyButton.textContent;


            copyButton.textContent =
                "✓ Copied!";


            setTimeout(() => {

                copyButton.textContent =
                    originalText;

            }, 1500);

        });

});


/* =====================================
   COMPARE INPUTS
===================================== */

compareA.addEventListener(
    "input",
    updateComparison
);


compareB.addEventListener(
    "input",
    updateComparison
);


/* =====================================
   CLEAR HISTORY
===================================== */

if (clearHistoryButton) {

    clearHistoryButton.addEventListener(
        "click",
        () => {

            history = [];

            localStorage.removeItem(
                "thermora_history"
            );

            renderHistory();

        }
    );
}


/* =====================================
   INITIAL RUN
===================================== */

processConversion();

updateComparison();

renderHistory();