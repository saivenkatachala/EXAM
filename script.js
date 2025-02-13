let timer;
let timeLeft = 1800; // 30 minutes in seconds
let currentQuestionIndex = 0;
let questions = [
  { question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct: 1 },
  { question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correct: 2 },
];

let answers = [];
const webAppUrl = "https://script.google.com/macros/s/AKfycbxE0hFHwq_xn6ntepMmCLqWTLg-4sYfq5q3PiI52_jC4NL9v353nhVJwV51Wdm8NeGNaw/exec"; // Replace with your Google Apps Script web app link

function startExam() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const examName = document.getElementById('examName').value;

  if (!name || !email || !examName) {
    alert('Please fill all fields.');
    return;
  }

  document.getElementById('studentForm').style.display = 'none';
  document.getElementById('examInterface').style.display = 'block';

  document.getElementById('studentNameDisplay').textContent = `Student: ${name}`;
  document.getElementById('examNameDisplay').textContent = `Exam: ${examName}`;

  timer = setInterval(updateTimer, 1000);

  renderQuestion();
}

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer').textContent = `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  timeLeft--;

  if (timeLeft < 0) {
    clearInterval(timer);
    submitExam();
  }
}

function renderQuestion() {
  const question = questions[currentQuestionIndex];
  const questionsDiv = document.getElementById('questions');

  questionsDiv.innerHTML = `
    <p><strong>Q${currentQuestionIndex + 1}: ${question.question}</strong></p>
    ${question.options
      .map(
        (option, idx) =>
          `<label><input type="radio" name="q${currentQuestionIndex}" value="${idx}" ${answers[currentQuestionIndex] === idx ? 'checked' : ''}> ${option}</label><br>`
      )
      .join('')}
  `;
}

function saveAnswer() {
  const selectedOption = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
  answers[currentQuestionIndex] = selectedOption ? parseInt(selectedOption.value) : null;
}

function nextQuestion() {
  saveAnswer();
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
}

function prevQuestion() {
  saveAnswer();
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
}



async function submitExam() {
  clearInterval(timer);
  saveAnswer();

  const studentDetails = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    examName: document.getElementById('examName').value,
    answers: answers,
    correctAnswers: questions.map((q) => q.correct),
  };

  try {
    const response = await fetch(webAppUrl, {
      method: "POST",
      body: JSON.stringify(studentDetails),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json(); // Parse the JSON response

    // Display results to the student
    document.getElementById('examInterface').style.display = 'none';
    document.getElementById('resultsBox').style.display = 'block';

    const correctAnswers = questions.filter((q, index) => q.correct === answers[index]).length;
    const totalQuestions = questions.length;

    document.getElementById('marksDisplay').textContent = `Marks: ${correctAnswers}/${totalQuestions}`;
    document.getElementById('gradeDisplay').textContent = `Grade: ${calculateGrade(correctAnswers, totalQuestions)}`;
    document.getElementById('feedbackDisplay').textContent = result.message; // Display the response message
  } catch (error) {
    alert('Error submitting the exam. Please try again later.');
    console.error("Error in submitExam:", error);
  }
}






