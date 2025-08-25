// ai-wizard.js

// Function to fetch AI suggestions for a goal
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

// Example function to populate your Smart Wizard
async function populateWizardWithAI(goalText) {
  const suggestions = await generateGoalSuggestions(goalText);
  if (!suggestions) return;

  // Set category
  const categoryElem = document.getElementById("wizard-category");
  if (categoryElem) categoryElem.value = suggestions.category || "";

  // Set deadline
  const deadlineElem = document.getElementById("wizard-deadline");
  if (deadlineElem) deadlineElem.value = suggestions.deadline || "";

  // Populate subtasks
  const subtasksContainer = document.getElementById("wizard-subtasks");
  if (subtasksContainer && suggestions.subtasks) {
    subtasksContainer.innerHTML = ""; // Clear previous
    suggestions.subtasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.textContent = task;
      subtasksContainer.appendChild(li);
    });
  }
}

// Example: attach to goal input blur
const goalInput = document.getElementById("goal-title-input");
if (goalInput) {
  goalInput.addEventListener("blur", () => {
    const goalText = goalInput.value;
    populateWizardWithAI(goalText);
  });
}