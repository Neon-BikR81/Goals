// ai-wizard.js

// --------------------
// 1. Auto-detect wizard fields
// --------------------
let goalInput = document.querySelector('input[placeholder*="goal"]') || document.getElementById('goal-title-input');
let categoryElem = document.querySelector('input[placeholder*="category"]') || document.getElementById('wizard-category');
let deadlineElem = document.querySelector('input[placeholder*="deadline"]') || document.getElementById('wizard-deadline');
let subtasksContainer = document.querySelector('ul[placeholder*="subtasks"]') || document.getElementById('wizard-subtasks');

// --------------------
// 2. Function to call OpenAI API
// --------------------
async function generateGoalSuggestions(goalText) {
  if (!goalText) return null;

  const apiKey = "YOUR_OPENAI_API_KEY"; // Replace with your key

  const prompt = `
You are a smart goal planner. 
Given the user's goal, return a JSON object with:
- category (one of Fitness, Study, Work, Abstract)
- deadline (YYYY-MM-DD, optional)
- subtasks (array of actionable steps)
Do not include explanations. Only return valid JSON.

User goal: "${goalText}"
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Try to parse JSON safely
    let suggestions = null;
    try { suggestions = JSON.parse(text); } 
    catch(e) {
      console.error("AI returned invalid JSON:", text);
    }

    return suggestions;

  } catch (err) {
    console.error("Error fetching AI suggestions:", err);
    return null;
  }
}

// --------------------
// 3. Populate Smart Wizard fields
// --------------------
async function populateWizardWithAI(goalText) {
  if (!goalText || !goalInput) return;

  const suggestions = await generateGoalSuggestions(goalText);
  if (!suggestions) return;

  if (categoryElem) categoryElem.value = suggestions.category || "";
  if (deadlineElem) deadlineElem.value = suggestions.deadline || "";

  if (subtasksContainer && suggestions.subtasks) {
    subtasksContainer.innerHTML = "";
    suggestions.subtasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = task;
      subtasksContainer.appendChild(li);
    });
  }
}

// --------------------
// 4. Event listener to trigger AI suggestions
// --------------------
if (goalInput) {
  goalInput.addEventListener("blur", () => {
    const goalText = goalInput.value;
    populateWizardWithAI(goalText);
  });
}