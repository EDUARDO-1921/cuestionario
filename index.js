const apiUrl = "https://raw.githubusercontent.com/cesarmcuellar/CuestionarioWeb/refs/heads/main/cuestionario.json";

document.addEventListener("DOMContentLoaded", async () => {
    const quizContainer = document.getElementById("quiz-container");
    const submitBtn = document.getElementById("submit-btn");
    const resultContainer = document.getElementById("result");
    const percentageDisplay = document.getElementById("percentage");

    let allQuestions = [];

    try {
        // Fetch data from API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const data = await response.json();

        // Combine both types of questions
        const multipleChoiceQuestions = data.multiple_choice_questions.map((q, index) => ({
            ...q,
            type: "multiple_choice",
            id: `mcq${index}`
        }));
        const trueFalseQuestions = data.true_false_questions.map((q, index) => ({
            ...q,
            type: "true_false",
            id: `tf${index}`
        }));

        allQuestions = [...shuffleArray(multipleChoiceQuestions), ...shuffleArray(trueFalseQuestions)];

        // Display all questions in the container
        displayQuestions(allQuestions, quizContainer);
    } catch (error) {
        console.error("Error cargando las preguntas:", error);
        quizContainer.innerHTML = "<p>Error cargando el cuestionario. Por favor, intenta más tarde.</p>";
    }

    // Event listener to calculate and display the result
    submitBtn.addEventListener("click", () => {
        const totalQuestions = allQuestions.length;
        let correctAnswers = 0;

        allQuestions.forEach((question) => {
            const userAnswer = document.querySelector(`input[name="${question.id}"]:checked`);
            if (question.type === "multiple_choice") {
                if (userAnswer && userAnswer.value === question.correct_answer) {
                    correctAnswers++;
                }
            } else if (question.type === "true_false") {
                const correctAnswer = question.correct_answer ? "true" : "false";
                if (userAnswer && userAnswer.value === correctAnswer) {
                    correctAnswers++;
                }
            }
        });
        const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(2);
        percentageDisplay.textContent = `Has obtenido un ${percentage}% de aciertos.`;
        resultContainer.classList.remove("hidden");
    });
});

// Function to display questions
function displayQuestions(questions, container) {
    container.innerHTML = ""; // Clear the container

    questions.forEach((question) => {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question");

        // Multiple choice questions
        if (question.type === "multiple_choice") {
            questionDiv.innerHTML = `
                <h3>${question.question}</h3>
                ${question.options.map((option) => `
                    <label>
                        <input type="radio" name="${question.id}" value="${option}">
                        ${option}
                    </label>
                `).join("")}
            `;
        }

        // True/False questions
        if (question.type === "true_false") {
            questionDiv.innerHTML = `
                <h3>${question.question}</h3>
                <label>
                    <input type="radio" name="${question.id}" value="true">
                    Verdadero
                </label>
                <label>
                    <input type="radio" name="${question.id}" value="false">
                    Falso
                </label>
            `;
        }

        container.appendChild(questionDiv);
    });
}

// Function to shuffle an array
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}
