// main.js (เวอร์ชันแก้ไข)
import {
  initializeApp,
  goHome,
  showManagementView,
  showNewCreatorView,
  previousQuestion,
  addManualQuestion,
  generateWithLLM,
  generateImageForCurrentResult,
  addOrUpdateManualResult,
  postCustomQuiz,
  startQuiz,
  selectAnswer,
  editQuiz,
  deleteQuiz,
  deleteCreatorQuestion,
  editCreatorResult,
  deleteCreatorResult
} from "./table.js"; // Import ฟังก์ชันทั้งหมดที่ต้องการใช้

document.addEventListener("DOMContentLoaded", () => {

  initializeApp();

  // --- Event Listeners ทั่วไป ---

  // ปุ่มกลับหน้าแรก (ใช้ querySelectorAll เพราะมีหลายปุ่ม)
  document.querySelectorAll(".returnhomepage-btn").forEach(btn => {
    btn.addEventListener("click", goHome);
  });
  
  // ปุ่มไปหน้าจัดการ (ใช้ querySelectorAll เพราะมีหลายปุ่ม)
  document.querySelectorAll(".gosetup-btn").forEach(btn => {
    btn.addEventListener("click", showManagementView);
  });

  // ปุ่มไปหน้าสร้าง Quiz
  document.getElementById("gocreator-btn").addEventListener("click", showNewCreatorView);

  // ปุ่มย้อนกลับคำถาม
  document.getElementById("prev-question-btn").addEventListener("click", previousQuestion);

  // --- Event Listeners ในหน้า Creator ---
  
  document.getElementById("emotion-btn").addEventListener("click", () => addManualQuestion('emotion'));
  document.getElementById("appearance-btn").addEventListener("click", () => addManualQuestion('appearance'));
  document.getElementById("LLM-emotion-btn").addEventListener("click", () => generateWithLLM('emotion_questions'));
  document.getElementById("LLM-appearance-btn").addEventListener("click", () => generateWithLLM('appearance_questions'));
  document.getElementById("LLM-results-btn").addEventListener("click", () => generateWithLLM('results'));
  document.getElementById("generateImage-btn").addEventListener("click", generateImageForCurrentResult);
  document.getElementById("addOrUpdateManualResult-btn").addEventListener("click", addOrUpdateManualResult);
  document.getElementById("postcustomquiz-btn").addEventListener("click", postCustomQuiz);

  // --- Event Delegation ที่แก้ไขแล้ว ---

  // หน้าเลือกแบบทดสอบ
  const categoryList = document.getElementById("category-list");
  if (categoryList) {
    categoryList.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("btn")) {
        startQuiz(e.target.dataset.key); // <-- ส่งค่า key จาก data-key
      }
    });
  }

  // หน้าตอบคำถาม
  const answersContainer = document.getElementById("answers-container");
  if (answersContainer) {
    answersContainer.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("btn-answer")) {
        const type = e.target.dataset.type;
        const points = parseInt(e.target.dataset.points, 10);
        selectAnswer(type, points); // <-- ส่งค่า type และ points
      }
    });
  }

  // หน้าจัดการ Quiz
  const managementList = document.getElementById("quiz-management-list");
  if (managementList) {
    managementList.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      if (e.target && e.target.classList.contains("edit-btn")) {
        editQuiz(id); // <-- ส่งค่า id
      } else if (e.target && e.target.classList.contains("delete-btn")) {
        deleteQuiz(id); // <-- ส่งค่า id
      }
    });
  }

  // หน้าสร้าง/แก้ไข: ลบคำถาม Appearance
  const appearanceList = document.getElementById("appearance-questions-list");
  if (appearanceList) {
    appearanceList.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("delete-btn")) {
        const index = parseInt(e.target.dataset.index, 10);
        deleteCreatorQuestion('appearance', index); // <-- ส่ง type และ index
      }
    });
  }

  // หน้าสร้าง/แก้ไข: ลบคำถาม Emotion
  const emotionList = document.getElementById("emotion-questions-list");
  if (emotionList) {
    emotionList.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("delete-btn")) {
        const index = parseInt(e.target.dataset.index, 10);
        deleteCreatorQuestion('emotion', index); // <-- ส่ง type และ index
      }
    });
  }

  // หน้าสร้าง/แก้ไข: จัดการ Result
  const resultCreatorList = document.getElementById("result-creator-list");
  if (resultCreatorList) {
    resultCreatorList.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      if (e.target && e.target.classList.contains("edit-btn")) {
        editCreatorResult(index); // <-- ส่ง index
      } else if (e.target && e.target.classList.contains("delete-btn")) {
        deleteCreatorResult(index); // <-- ส่ง index
      }
    });
  }

});
