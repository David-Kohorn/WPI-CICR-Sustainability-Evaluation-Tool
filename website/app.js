import { getCategoriesAndQuestions, UI_TEXT, PDF_TEXT } from './data.js';

//Retrieve the questions and categories from the database
const {questions, categories} = await getCategoriesAndQuestions();

import { downloadPdf } from "./pdf_handler.js";


// ================================
// APPLICATION STATE (single source of truth)
// ================================
// Everything that changes while the app runs is stored here.
// This prevents duplicated variables and makes reasoning easier.
const state = {
  language: "es",                                        // "es" or "en"
  index: 0,                                              // current question index (0-based) - Note that the ID for each question is 1-based
  answers: new Array(questions.length).fill(null),       // user's answers: index is each question, values are selected radio option, array of selected checkbox options, text input, or slider value
  scores: Object.fromEntries(categories.map(c => [c.id, 0])), // computed category scores: {category_id; score_value,}
  radarChart: null                                       // Chart.js instance when created
};


// ================================
// DOM REFERENCE OBJECT
// ================================
// Collect every important element in one place so we don't keep calling
// document.getElementById all over the file.
const DOM = {
  title: document.getElementById("title"),
  preambleIntro: document.getElementById("preambleIntro"),
  preambleIntroDetails: document.getElementById("preambleIntroDetails"),
  preambleConsent: document.getElementById("preambleConsent"),
  preambleConsentDetails: document.getElementById("preambleConsentDetails"),
  userManualLink: document.getElementById("userManualLink"),
  startBtn: document.getElementById("startBtn"),
  esBtn: document.getElementById("esBtn"),
  enBtn: document.getElementById("enBtn"),
  resultsTitle: document.getElementById("resultsTitle"),
  downloadPdfBtn: document.getElementById("downloadPdf"), // element id 
  toolTitle: document.getElementById("toolTitle"),
  disclaimer: document.getElementById("disclaimer"),

  // progress bar area
  quizProgress: document.getElementById("quizProgress"),
  progressCategoryLabel: document.getElementById("progressCategoryLabel"),
  progressBarVisual: document.getElementById("progressBarVisual"),
  progressBarLabel: document.getElementById("progressBarLabel"),
  progressBarText: document.getElementById("progressBarText"),

  // pages / panels
  landing: document.getElementById("landing"),
  quiz: document.getElementById("quiz"),
  results: document.getElementById("results"),

  // question area
  question: document.getElementById("question"),
  answers: document.getElementById("answers"),

  // navigation buttons
  nextBtn: document.getElementById("nextBtn"),
  backBtn: document.getElementById("backBtn"),
  skipBtn: document.getElementById("skipBtn"),
  backToScoresBtn: document.getElementById("backToScoresBtn"),

  // results area
  infoContainer: document.getElementById("categoryInfoOutput"),
  scoreOutput: document.getElementById("scoreOutput"),
  radarCanvas: document.getElementById("radarChart"),
  chartPanel: document.getElementById("chartPanel"),
  pdfContent: document.getElementById("pdfContent") // (optional) used by PDF flow
};


// ================================
// SMALL HELPERS (used across file)
// ================================

// Helper to split long radar labels into two lines
function radarLabel(label) {
  if (label.includes(" & ")) {
    return label.split(" & ");
  }
  const words = label.split(" ");
  if (words.length <= 1) return label;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}


// ================================
// UI / LANGUAGE UPDATE -  These functions update visible text when language changes.
// ================================

function updateUI() {
  // Update every piece of static UI text from the UI_TEXT object
  DOM.title.textContent = UI_TEXT[state.language].title;
  DOM.preambleIntro.textContent = UI_TEXT[state.language].preambleIntro;
  DOM.preambleIntroDetails.textContent = UI_TEXT[state.language].preambleIntroDetails;
  DOM.preambleConsent.textContent = UI_TEXT[state.language].preambleConsent;
  DOM.preambleConsentDetails.textContent = UI_TEXT[state.language].preambleConsentDetails;
  DOM.userManualLink.textContent = UI_TEXT[state.language].userManualLinkText;
  DOM.startBtn.textContent = UI_TEXT[state.language].start;
  DOM.resultsTitle.textContent = UI_TEXT[state.language].results;
  DOM.downloadPdfBtn.textContent = UI_TEXT[state.language].download;
  DOM.toolTitle.textContent = UI_TEXT[state.language].bannerTitle;
  DOM.disclaimer.textContent = UI_TEXT[state.language].disclaimer;

  // Buttons
  DOM.nextBtn.textContent = UI_TEXT[state.language].next;
  DOM.backBtn.textContent = UI_TEXT[state.language].back;
  DOM.skipBtn.textContent = UI_TEXT[state.language].skip;
  DOM.backToScoresBtn.textContent = UI_TEXT[state.language].backToScores;
}

// Change language and refresh whatever the user is currently viewing
function setLanguage(lang) {
  state.language = lang;
  updateUI();

  // Change link for the user manual pdf
  if (!DOM.landing.hidden) {
    const hrefString = "manuals/user_manual_" + state.language + ".pdf";
    DOM.userManualLink.href = hrefString;
  }

  // If quiz is visible, re-render current question in new language
  if (!DOM.quiz.hidden) {
    renderQuestion();
    renderQuizProgress();
  }

  // If results page is visible, update radar labels and score display
  if (!DOM.results.hidden) {
    updateRadarLanguage();
    renderScoreOutput(); 
    
    // Localize results title 
    const productName = state.answers[0] || "";
    if (lang === "es") {
      DOM.resultsTitle.textContent = productName ? `Resultados del análisis para ${productName}` : "Resultados del análisis";
    } else {
      DOM.resultsTitle.textContent = productName ? `Sustainability Results for ${productName}` : "Sustainability Results";
    }

    if (!DOM.infoContainer.hidden) {
      showCategoryInfo(DOM.infoContainer.dataset.category);
    }
  }
}

DOM.esBtn.onclick = () => setLanguage("es");
DOM.enBtn.onclick = () => setLanguage("en");


// ================================
// START BUTTON (show quiz)
// ================================
// When the user presses Start, hide landing and show the quiz.
DOM.startBtn.onclick = () => {
  DOM.landing.hidden = true;
  DOM.quiz.hidden = false;
  DOM.quizProgress.hidden = false;
  renderQuestion();
  renderQuizProgress();
};


// ================================
// QUESTION RENDERING (display only)
// ================================
// This section  draws the question inputs on screen. 

/*
  Design pattern:
  - questionRenderers is a map of functions keyed by question type.
  - renderQuestion() looks up the right renderer and calls it.
  - Each renderer uses state.index and state.answers to restore/save values.
*/


// Main render function - shows the question and its input controls
function renderQuestion() {
  const q = questions[state.index];
  DOM.question.textContent = q.text[state.language];
  DOM.answers.innerHTML = ""; // clear previous inputs

  if (q.is_demographic) {
    DOM.skipBtn.hidden = true;
  }
  else {
    DOM.skipBtn.hidden = false;
  }

  const renderer = questionRenderers[q.type];
  if (renderer) {
    // Call the renderer; it will create DOM elements inside DOM.answers
    renderer(q);
  }
}


// The renderers for each question type. They create DOM elements
// and restore previous values from state.answers when present.
const questionRenderers = {

  // RADIO buttons (single selection) - the value saved is the option id
  radio(q) {
    q.options.forEach(o => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="answer" value="${o.id}">
        ${o.label[state.language]}
      `;

      const input = label.querySelector("input");

      // Restore previous selection if user already answered this question
      if (state.answers[state.index] == o.id) {
        input.checked = true;
      }

      DOM.answers.appendChild(label);
    });
  },

  // SLIDER (range) input - the value saved is the selected slider value
  slider(q) {
    const wrapper = document.createElement("div");

    const labelsRow = document.createElement("div");
    labelsRow.style.display = "flex";
    labelsRow.style.justifyContent = "space-between";
    labelsRow.style.width = "75%";
    labelsRow.innerHTML = `<span>0</span><span>${q.slider_config.max_value}</span>`;

    const input = document.createElement("input");
    input.type = "range";
    input.min = q.slider_config.min_value;
    input.max = q.slider_config.max_value;
    input.step = q.slider_config.step;
    // restore value if present, otherwise default to min
    input.value = state.answers[state.index] ?? q.slider_config.min_value;
    input.id = "slider";
    input.classList.add("slider");

    const valueDisplay = document.createElement("div");
    valueDisplay.id = "sliderValue";
    valueDisplay.textContent = `${input.value}/${q.slider_config.max_value}`;

    input.oninput = () => {
      valueDisplay.textContent = `${input.value}/${q.slider_config.max_value}`;
    };

    wrapper.appendChild(labelsRow);
    wrapper.appendChild(input);
    wrapper.appendChild(valueDisplay);
    DOM.answers.appendChild(wrapper);
  },

  // CHECKBOXES (multiple selection) - the value saved are the option ids
  checkbox(q) {
    q.options.forEach(o => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" value="${o.id}">
        ${o.label[state.language]}
      `;

      const input = label.querySelector("input");

      // restore previous selections
      if (state.answers[state.index]?.includes(o.id)) {
        input.checked = true;
      }

      DOM.answers.appendChild(label);
    });
  },

  // TEXT input - the value saved is the inputed text
  text(q) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 250;
    input.placeholder = state.language === "es" ? "Escriba aquí..." : "Type here...";
    input.classList.add("text-input");

    // restore value if present
    if (state.answers[state.index]) input.value = state.answers[state.index];

    DOM.answers.appendChild(input);
  }
};

function renderQuizProgress() {
  const currentQ = state.index;
  const maxQ = questions.length;

  DOM.progressBarVisual.value = currentQ;
  DOM.progressBarVisual.max = maxQ;
  DOM.progressBarText.textContent = currentQ + "/" + maxQ;
  DOM.progressBarLabel.textContent = (state.language == "es" ? "Progreso:": "Progress:");

  const q = questions[state.index];

  if (q.is_demographic === true) DOM.progressCategoryLabel.textContent = (state.language == "es" ? "Demográfico": "Demographic");
  else DOM.progressCategoryLabel.textContent = categories.find(c => c.id == q.category_id).title[state.language];
}

// ================================
// ANSWER VALIDATION & SAVE (Next button logic) 
// ================================

// Map of handlers per question type. Each must:
// - confirm the user provided a valid answer
// - save that answer into state.answers[state.index]
// - return true if valid, false if not (so Next can stop)
const answerHandlers = {

  radio() {
    const selected = document.querySelector("input[name='answer']:checked");
    if (!selected) {
      alert(UI_TEXT[state.language].select);
      return false;
    }
    state.answers[state.index] = Number(selected.value);
    return true;
  },

  checkbox() {
    const selected = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
      .map(cb => Number(cb.value));
    if (selected.length === 0) {
      alert(UI_TEXT[state.language].select);
      return false;
    }
    state.answers[state.index] = selected;
    return true;
  },

  slider() {
    const slider = document.getElementById("slider");
    // slider always has a value so always valid; store as number
    state.answers[state.index] = Number(slider.value);
    return true;
  },

  text() {
    const input = document.querySelector(".text-input");
    if (!input || !input.value.trim()) {
      alert(UI_TEXT[state.language].select);
      return false;
    }
    state.answers[state.index] = input.value.trim();
    return true;
  }
};


// Next button click: validate current answer, then move forward or finish.
// Comments added for non-coders to follow the flow.
DOM.nextBtn.onclick = () => {
  const q = questions[state.index];

  // Pick the right validator for this question type
  const handler = answerHandlers[q.type];
  if (handler) {
    const isValid = handler();
    // If not valid (for example user didn't select anything), stop here.
    if (!isValid) return;
  }

  // Move to the next question
  state.index++;

  // If we still have questions, render the next one; otherwise finish
  if (state.index < questions.length) {
    renderQuestion();
    renderQuizProgress();
  } else {
    finish();
  }
};

//Skip button click: fill answer with null then skip forward or finish.
// Comments added for non-coders to follow the flow.
DOM.skipBtn.onclick = () => {
  // Fill answer with null
  state.answers[state.index] = null;

  // Move to the next question
  state.index++;

  // If we still have questions, render the next one; otherwise finish
  if (state.index < questions.length) {
    renderQuestion();
    renderQuizProgress();
  } else {
    finish();
  }
};


// ================================
// BACK NAVIGATION
// ================================
DOM.backBtn.onclick = () => {
  // If we're at the first question, do nothing
  if (state.index === 0) return;

  // Go back one question and re-render it (restores answers from state)
  state.index--;
  renderQuestion();
  renderQuizProgress();
};


// When viewing the expanded category info, "Back to scores" hides the info panel
async function handleBackToScores() {
  DOM.infoContainer.hidden = true;
  DOM.scoreOutput.hidden = false;
  DOM.backToScoresBtn.hidden = true;
}
DOM.backToScoresBtn.onclick = handleBackToScores;


// ================================
// SCORING SYSTEM 
// ================================
// This takes state.answers and computes state.scores. It does NOT render UI.
function calculateScores() {
  const rawTotals = Object.fromEntries(categories.map(c => [c.id, 0])); // Adds up answer scores
  const rawMaximums = Object.fromEntries(categories.map(c => [c.id, 0])); // Puts the scores out of maximum possible

  questions.forEach((q, i) => {
    const answer = state.answers[i];

    //Early return checks (unknown answer or not applicable selected)
    if (answer === null || answer === undefined) return;

    const category_id = q.category_id;

    if (q.type === "radio") {
      const selectedOption = q.options.find(o => o.id == answer);
      rawTotals[category_id] += selectedOption.weight;
      rawMaximums[category_id] += Math.max(...q.options.map(o => o.weight));;
    }

    if (q.type === "checkbox") {
      let earned = 0;
      q.options.forEach((opt) => {
        if (answer.includes(opt.id)) earned += opt.weight;
      });

      const cap = q.score_maximum;

      //Capped question
      if (Number.isInteger(cap)) {
        rawTotals[category_id] += (earned < cap) ? earned : cap; 
        rawMaximums[category_id] += cap;
      }
      //Average question
      else {
        if (answer.length > 0) {
          rawTotals[category_id] += earned / answer.length;
        }
        rawMaximums[category_id] += questionMax;
      }
    }

    if (q.type === "slider") {
      //Convert answer value to a normalized score
      const minValue = Number(q.slider_config.min_value);
      const maxValue = Number(q.slider_config.max_value);
      const minScore = Number(q.slider_config.min_score);
      const maxScore = Number(q.slider_config.max_score);

      if (maxValue === minValue) return;

      const normalizedScore = minScore + (Number(answer) - minValue) * (maxScore - minScore) / (maxValue - minValue);
      
      rawTotals[category_id] += normalizedScore;
      rawMaximums[category_id] += Math.max(minScore, maxScore);
    }
  });

  // Convert to percentages per category and store in state.scores
  const newScores = {};
  categories.forEach(c => {
    if (rawMaximums[c.id] === 0) {
      newScores[c.id] = 0;
    } else {
      newScores[c.id] = Math.round((rawTotals[c.id] / rawMaximums[c.id]) * 100);
    }
  });

  state.scores = newScores;
}


// ================================
// RESULTS RENDERING (radar chart + score cards)
// ================================

// Render the radar chart using Chart.js
function renderRadarChart(scores) {
  const ctx = DOM.radarCanvas;
  const labels = categories.map(c => radarLabel(c.title[state.language]));
  const data = categories.map(c => scores[c.id]);

  // Destroy previous chart if exists to avoid duplicates
  if (state.radarChart) state.radarChart.destroy();

  state.radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: state.language === "es" ? "Puntaje de Sostenibilidad" : "Sustainability Score",
        data,
        backgroundColor: "rgba(16, 185, 92, 0.2)",
        borderColor: "rgb(33, 156, 66)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(33, 156, 66)",
        pointBorderColor: "rgb(33, 156, 66)",
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      animation: false,
      maintainAspectRatio: false,
      layout: { padding: 0 },
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 100,
          ticks: { stepSize: 10, font: { size: 10 } },
          pointLabels: { display: false }
        }
      },
      plugins: { legend: { position: 'top', align: 'start' } }
     
    }
  });

  // After creating the chart, add the clickable overlays that match previous behavior
  addLabelClickOverlays();
}


// Update radar labels and dataset text when language changes
function updateRadarLanguage() {
  if (!state.radarChart) return;

  state.radarChart.data.labels = categories.map(c => radarLabel(c.title[state.language]));
  state.radarChart.data.datasets[0].label = state.language === "es" ? "Puntaje de Sostenibilidad" : "Sustainability Score";
  state.radarChart.update();

  addLabelClickOverlays();
}


// Render the list of category score cards (clickable)
function renderScoreOutput() {
  DOM.scoreOutput.innerHTML = "";

  categories.forEach(c => {
    const wrapper = document.createElement("div");
    wrapper.className = "score-card clickable";
    wrapper.style.cursor = "pointer";

    // show numeric score and localized label
    wrapper.innerHTML = `
      <div class="score-number">${state.scores[c.id]}</div>
      <div class="score-label">${c.title[state.language]}</div>
    `;

    wrapper.onclick = () => showCategoryInfo(c.id);

    DOM.scoreOutput.appendChild(wrapper);
  });
}


// ================================
// CATEGORY INFO (detail for each category)
// ================================
// When a user clicks a radar label or a score card, show the related questions and answers. category parameter is the category id
function showCategoryInfo(category) {
  const category_id = Number(category);
  // collect questions for this category
  const qList = questions.filter(q => q.category_id === category_id);

  // Build a readable list of question text + selected answer per question
  const infoText = qList.map(q => {
    const i = questions.indexOf(q);
    const questionNumber = i + 1; // 1-based for humans
    const answerData = state.answers[i];

    if(answerData === null) return `${questionNumber}. ${q.text[state.language]} ${PDF_TEXT[state.language].skippedQuestionText}`;

    if (q.type === "slider") {
      return `${questionNumber}. ${q.text[state.language]} ${answerData}/${q.slider_config.max_value}`;
    }

    if (q.type === "checkbox") {
      const selectedLabels = answerData
        ? answerData.map(idx => q.options.find(o => o.id == [idx]).label[state.language]).join(", ")
        : "-";
      return `${questionNumber}. ${q.text[state.language]} ${selectedLabels}`;
    }

    return `${questionNumber}. ${q.text[state.language]} ${q.options.find(o => o.id == [answerData])?.label[state.language] || "-"}`;
  }).join("\n");

  // Hide score grid, show info panel
  DOM.infoContainer.dataset.category = category_id;
  DOM.scoreOutput.hidden = true;
  DOM.infoContainer.hidden = false;

  const category_object = categories.find(c => c.id === category_id);

  DOM.infoContainer.textContent = `${category_object.title[state.language]}\n\n${category_object.description[state.language]}\n\n${infoText}`;
  DOM.backToScoresBtn.hidden = false;
}


// ================================
// RADAR LABEL OVERLAY (clickable labels)
// ================================

function addLabelClickOverlays() {
  const canvas = DOM.radarCanvas;
  // remove old overlays
  document.querySelectorAll(".label-overlay").forEach(el => el.remove());

  if (!state.radarChart) return;

  const rScale = state.radarChart.scales.r;
  const cx = rScale.xCenter;
  const cy = rScale.yCenter;
  const radius = rScale.drawingArea * 1.15;

  state.radarChart.data.labels.forEach((labelLines, i) => {
    const angle = rScale.getIndexAngle(i) - Math.PI / 2;
    const x = cx + Math.cos(angle) * (radius + 10);
    const y = cy + Math.sin(angle) * (radius + 10);

    const lines = Array.isArray(labelLines) ? labelLines : [labelLines];

    const div = document.createElement("div");
    div.className = "label-overlay";
    div.style.position = "absolute";
    // Keep old positioning approach to preserve appearance (no change)
    div.style.left = `${canvas.offsetLeft + x}px`;
    div.style.top = `${canvas.offsetTop + y}px`;
    div.style.transform = "translate(-50%, -50%)";
    div.style.cursor = "pointer";
    div.style.textAlign = "center";
    div.style.userSelect = "none";
    div.style.fontSize = "13px";
    div.style.fontWeight = "600";
    div.style.color = rScale.options.pointLabels.color[i] || "#000";

    // Add lines (if label was split)
    lines.forEach(line => {
      const span = document.createElement("span");
      span.textContent = line;
      span.style.display = "block";
      div.appendChild(span);
    });

    // Hover effects 
    div.onmouseenter = () => { div.style.fontWeight = "bold"; div.style.textDecoration = "underline"; };
    div.onmouseleave = () => { div.style.fontWeight = "600"; div.style.textDecoration = "none"; };

    // Click opens category info
    div.onclick = () => showCategoryInfo(categories[i].id);

    DOM.chartPanel.appendChild(div);
  });
}

// Re-position overlays when the window resizes (keeps previous behavior)
window.addEventListener("resize", () => {
  if (state.radarChart) addLabelClickOverlays();
});


// ================================
// SCORE CALCULATION  and FINALIZE
// ================================

// Turn answers and scores into JSON (does not include submission_id)
function answersScoresToJSON() {
  let answersList = [];
  let categoryScoresList = [];

  // Populate answers 
  state.answers.forEach((answer, i) => {
    const questionType = questions[i]?.type;
    
    if (answer === null) {
      answersList.push(
      {
      "question_id": i + 1,
      "option_id": null,
      "slider_value": null,
      "text_value": null,
      "was_skipped": 1
      });
      return;
    }

    switch (questionType) {
      case "radio":
        answersList.push(
        {
        "question_id": i + 1,
        "option_id": answer,
        "slider_value": null,
        "text_value": null,
        "was_skipped": 0
        });
        break;

      case "checkbox":
        answer.forEach(a => {
          answersList.push(
          {
          "question_id": i + 1,
          "option_id": a,
          "slider_value": null,
          "text_value": null,
          "was_skipped": 0
          });
        });
        break;

      case "slider":
        answersList.push(
        {
        "question_id": i + 1,
        "option_id": null,
        "slider_value": answer,
        "text_value": null,
        "was_skipped": 0
        });
        break;

      case "text":
        answersList.push(
        {
        "question_id": i + 1,
        "option_id": null,
        "slider_value": null,
        "text_value": answer,
        "was_skipped": 0
        });
        break;
    }
  });

  // Populate categorieScores
  Object.entries(state.scores).forEach(([category_id, score]) => {
    categoryScoresList.push({
      category_id: category_id,
      score: score
    });
  });

  return {answersList, categoryScoresList};
}

function finish() {
  calculateScores();

  // Switch pages: hide quiz, show results
  DOM.quiz.hidden = true;
  DOM.quizProgress.hidden = true;
  DOM.results.hidden = false;

  const productName = state.answers[0] || "";

  // Localize results title 
  if (state.language === "es") {
    DOM.resultsTitle.textContent = productName ? `Resultados del análisis para ${productName}` : "Resultados del análisis";
  } else {
    DOM.resultsTitle.textContent = productName ? `Sustainability Results for ${productName}` : "Sustainability Results";
  }

  // Render results 
  renderRadarChart(state.scores);
  renderScoreOutput();

  // Send answers/scores to php for DB storing
  fetch("/db_submit.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answersScoresToJSON())
  })
  .then(res => res.json())
  .then(data => {
      if (!data.success) {
          console.error("Failed to save submission:", data.error);
      }
  })
  .catch(() => {
      console.error("Failed to save submission (network failure).");
  });
}


// ================================
// PDF DOWNLOAD HOOK
// ================================
// When user clicks Download PDF, call the imported downloadPdf function.
// compute the language-specific labels on demand so the PDF matches current language.
DOM.downloadPdfBtn.onclick = async () => {
  try {
    const testingTerm = categories.map(c => radarLabel(c.title[state.language]));
    await downloadPdf({
      userAnswers: state.answers,
      questions,
      categories,
      scores: state.scores,
      language: state.language
    });
  } catch (err) {
    console.error("PDF download failed:", err);
  }
};


// ================================
// INITIALIZATION
// ================================
// Set initial UI strings (language content) and keep ready.
updateUI();