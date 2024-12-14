// Global variables
let privacyQuestions = []; //store questions 
let currentQuestionIndex = 0; // Index of the current question 
let userInfo = { name: "", age: "", answers: {} }; // store user details and answers
let powerScores = { government: 0, corporations: 0, individuals: 0 }; // Tracks power distribution 

// Function to show the loading overlay with a fadein effect
function showLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.style.opacity = 1, 50);
  } else {
    console.error("Loading overlay element not found.");
  }
}

// Function to hide the loading overlay with a fadeout effect
function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.opacity = 0;
    setTimeout(() => overlay.classList.add("hidden"), 500);
  } else {
    console.error("Loading overlay element not found.");
  }
}

// Function to load questions from a JSON file
async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    privacyQuestions = await response.json();
  } catch (error) {
    console.error("Error loading questions:", error);
    alert("Failed to load questions. Please try again.");
  }
}

// Function to start the questionnaire after collecting user info
function startQuestionnaire() {
  const nameInput = document.getElementById("userName").value.trim();
  const ageInput = document.getElementById("userAge").value.trim();

  // Validate input
  if (!nameInput || !ageInput) {
    alert("Please provide valid name and age to proceed.");
    return;
  }

  userInfo.name = nameInput;
  userInfo.age = ageInput;

  const userInfoForm = document.getElementById("userInfoForm");
  userInfoForm.classList.add("hidden");

  setTimeout(() => {
    userInfoForm.style.display = "none";
    document.getElementById("questionContainer").classList.remove("hidden");
    currentQuestionIndex = 0;
    userInfo.answers = {};
    powerScores = { government: 0, corporations: 0, individuals: 0 };
    displayNextQuestion();
  }, 500);
}

function displayNextQuestion() {
  const questionContainer = document.getElementById("questionContainer");
  questionContainer.style.opacity = 0;
  setTimeout(() => {
    if (currentQuestionIndex < privacyQuestions.length) {
      const questionData = privacyQuestions[currentQuestionIndex];
      document.getElementById("currentQuestion").innerText = questionData.question;

      const optionsContainer = document.getElementById("optionsContainer");
      optionsContainer.innerHTML = "";

      // Create Yes/No buttons for the question
      ["Yes", "No"].forEach(option => {
        const button = document.createElement("button");
        button.innerText = option;
        button.className = "optionButton";
        button.onclick = () => saveAnswer(questionData.key, option, questionData.impact);
        optionsContainer.appendChild(button);
      });

      questionContainer.style.opacity = 1;
    } else {
      document.getElementById("questionContainer").classList.add("hidden");
      generateWorld();
    }
  }, 500);
}

// Function to save the user's answer and update power scores
function saveAnswer(key, answer, impact) {
  userInfo.answers[key] = answer;

  if (answer === "Yes") {
    if (impact === "government") powerScores.government += 10;
    else if (impact === "corporations") powerScores.corporations += 10;
    else if (impact === "individuals") powerScores.individuals += 10;
  } else {
    if (impact === "government") powerScores.government += 5;
    else if (impact === "corporations") powerScores.corporations += 5;
    else if (impact === "individuals") powerScores.individuals += 5;
  }

  currentQuestionIndex++;
  displayNextQuestion();
}

// Function to generate a narrative based on user inputs
async function generateWorld() {
  showLoading();

  try {
    // Make the request to backend API
    const response = await fetch("https://backend-frut.onrender.com/generate-world", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI worldbuilder specializing in dystopian narratives and societal analysis."
          },
          {
            role: "user",
            content: `Create a dystopian narrative based on the following user inputs:
Name: ${userInfo.name}, Age: ${userInfo.age}.
Privacy decisions: ${JSON.stringify(userInfo.answers)}.
Include:
1. A central character named ${userInfo.name}.
2. A butterfly effect showing how privacy laws have changed Earth.
3. A description of the dystopian universe's places, people, politics, events and technology.
4. All the positives and negatives of the data policies.
5. Conclude with how happy an individual could or couldn't be in the world created and give it a score out of 100 based on happiness.`

          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const result = data.choices[0].message.content.trim();
      const [narrativeBlock, effectsBlock] = result.split("Effects:");
      const narrative = narrativeBlock.replace(/^Narrative:\s*/, "").trim();

      const effects = effectsBlock
        ? effectsBlock
          .trim()
          .split("\n")
          .map(effect => effect.replace(/^[A-Za-z\s]*:/, "").trim())
        : ["No effects provided."];

      const responseContainer = document.getElementById("response");
      responseContainer.classList.remove("hidden");
      responseContainer.innerHTML = `<h2>Welcome to A Different Future</h2><p>${narrative}</p>`;
      displayPowerChart(effects);
    } else {
      console.error("Error: No valid response from ChatGPT");
      alert("Failed to generate narrative. Please try again.");
    }
  } catch (error) {
    console.error("Error generating world:", error);
    alert("An error occurred while generating the world. Please try again.");
  } finally {
    hideLoading();
  }
}

// Function to display power distribution and effects
function displayPowerChart(effects) {
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.classList.remove("hidden");
  chartContainer.innerHTML = "";

  const groups = [
    { name: "Government", score: Math.round(powerScores.government), color: "#D6C9F5" },
    { name: "Corporations", score: Math.round(powerScores.corporations), color: "#D9F0F8" },
    { name: "Individuals", score: Math.round(powerScores.individuals), color: "#F8D9D9" }
  ];

  groups.forEach((group, index) => {
    const effect = effects[index] || "No detailed effects provided.";

    const groupRow = document.createElement("div");
    groupRow.className = "group-row";

    const label = document.createElement("div");
    label.className = "group-label";
    label.innerText = group.name;

    const lineContainer = document.createElement("div");
    lineContainer.className = "line-container";

    const line = document.createElement("div");
    line.className = "group-line";
    line.style.setProperty('--target-width', `${group.score}%`);
    line.style.backgroundColor = group.color;

    const percentage = document.createElement("span");
    percentage.className = "group-percentage";
    percentage.innerText = `${group.score}%`;

    // Append elements 
    lineContainer.appendChild(line);
    lineContainer.appendChild(percentage);
    groupRow.appendChild(label);
    groupRow.appendChild(lineContainer);
    chartContainer.appendChild(groupRow);

    const description = document.createElement("div");
    description.className = "group-description";
    description.innerText = effect;
    chartContainer.appendChild(description);
  });
}

// Load questions once the document has fully loaded
document.addEventListener("DOMContentLoaded", loadQuestions);