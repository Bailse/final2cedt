import { createItem, deleteItem, getItems, updateItem , loadItem } from "./api.js";

// Global state variables
let ApiData = {};
let currentCategoryKey = null;
let currentQuestionIndex = 0;
let scoreX = 0; // คะแนนด้านอารมณ์
let scoreY = 0; // คะแนนด้านรูปลักษณ์
let answerHistory = []; // เก็บประวัติคำตอบ {x, y}
let totalcombinedQuestions = 0; // รวมคำถามตอนเริ่ม Quiz

// State for the creator view
let editingQuizKey = null; 
let customEmotionQuestions = [];
let customAppearanceQuestions = [];
let customQuizResults = [];

const views = {
    category: document.getElementById('category-selection-view'),
    management: document.getElementById('management-view'),
    quiz: document.getElementById('quiz-view'),
    result: document.getElementById('result-view'),
    creator: document.getElementById('creator-view'),
};
const loadingOverlay = document.getElementById('loading-overlay');

function switchView(viewName) {
    Object.values(views).forEach(view => view.classList.remove('active'));
    if (views[viewName]) {
        views[viewName].classList.add('active');
    }
}

function goHome() {
    currentCategoryKey = null;
    currentQuestionIndex = 0;
    scoreX = 0;
    scoreY = 0;
    answerHistory = [];
    combinedQuestions = [];
    editingQuizKey = null; 
    
    renderCategorySelection();
    switchView('category');
}

function renderManagementList() {
    const listContainer = document.getElementById('quiz-management-list');
    listContainer.innerHTML = '';
    const quizKeys = getItems();

    if (quizKeys.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-muted">ยังไม่มีแบบทดสอบให้จัดการ</p>';
        return;
    }

    quizKeys.forEach(id => {
        const quiz = loadItem(id);
        const item = document.createElement('div');
        item.className = 'creator-question-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        
        item.innerHTML = `
    <p style="margin: 0; font-weight: 600;">${quiz.title}</p>
    <div>
        <button class="edit-btn" data-id="${id}" title="แก้ไข">&#9998;</button>
        <button class="delete-btn" data-id="${id}" title="ลบ">&times;</button>
    </div>
`;
listContainer.appendChild(item);
    });
}

function showManagementView() {
    renderManagementList();
    switchView('management');
}

function showNewCreatorView() {
    editingQuizKey = null;
    document.getElementById('creator-view-title').innerText = "สร้างแบบทดสอบของคุณ";
    document.getElementById('category-name-input').value = '';
    customEmotionQuestions = [];
    customAppearanceQuestions = [];
    customQuizResults = [];
    renderAllCreatorLists();
    switchView('creator');
}

function editQuiz(id) {
    editingQuizKey = id;
    const quizToEdit = loadItem(id);

    document.getElementById('creator-view-title').innerText = `แก้ไข: ${quizToEdit.title}`;
    document.getElementById('category-name-input').value = quizToEdit.title;
    
    if (quizToEdit.question.IsEmotional) {
    customEmotionQuestions = JSON.parse(JSON.stringify(quizToEdit.question.AnswerList));
  } else {
    customAppearanceQuestions = JSON.parse(JSON.stringify(quizToEdit.question.AnswerList));
  }

  customQuizResults = JSON.parse(JSON.stringify(quizToEdit.results));

    renderAllCreatorLists();
    switchView('creator');
}

function deleteQuiz(id) {
    if (confirm(`คุณต้องการลบแบบทดสอบ "${loadItem(id).title}" ใช่หรือไม่?`)) {
        deleteItem(id);
        renderManagementList(); 
    }
}

function startQuiz(categoryKey) {
    currentCategoryKey = categoryKey;
    currentQuestionIndex = 0;
    scoreX = 0;
    scoreY = 0;
    answerHistory = [];

    const quiz = loadItem(categoryKey);
    document.getElementById('quiz-category-title').innerText = quiz.title;

    totalcombinedQuestions = quiz.question.length;

    renderQuestion();
    switchView('quiz');
}

function renderQuestion() {
    if (currentQuestionIndex >= totalcombinedQuestions) {
        showResult();
        return;
    }

    const question = loadItem(currentQuestionIndex);
    document.getElementById('prev-question-btn').style.visibility = (currentQuestionIndex === 0) ? 'hidden' : 'visible';
    document.getElementById('question-text').innerText = `(${question.type === 'emotion' ? 'อารมณ์' : 'รูปลักษณ์'}) ${question.question}`;

    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';

    question.question.AnswerList.forEach(AnswerSchema => {

        const button = document.createElement('button');
        button.className = "btn btn-answer";
        button.innerText = AnswerSchema.text;
        button.dataset.type = question.question.IsEmotional ? 'emotion' : 'appearance'; // <-- เพิ่ม data-type
        button.dataset.points = question.question.IsEmotional ? AnswerSchema.scoreX : AnswerSchema.scoreY; // <-- เพิ่ม data-points
        
        answersContainer.appendChild(button);
    });
}

function selectAnswer(Item, points) {
    let pointsX = 0;
    let pointsY = 0;

    if (Item.IsEmotional) {
        scoreX += points;
        pointsX = points;
    } else {
        scoreY += points;
        pointsY = points;
    }
    
    answerHistory.push({ x: pointsX, y: pointsY });
    currentQuestionIndex++;

    if (currentQuestionIndex < totalcombinedQuestions) {
        renderQuestion();
    } else {
        showResult();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        const lastPoints = answerHistory.pop();
        if (lastPoints) {
            scoreX -= lastPoints.x;
            scoreY -= lastPoints.y;
        }
        renderQuestion();
    }
}

function showResult() {
    const quiz = loadItem(currentCategoryKey);
    let finalResult = null;

    for (const result of quiz.results) {
        const conditionX = result.condition_x;
        const conditionY = result.condition_y;

        let isMatchX = (conditionX.op === '<=') ? (scoreX <= conditionX.val) : (scoreX > conditionX.val);
        let isMatchY = (conditionY.op === '<=') ? (scoreY <= conditionY.val) : (scoreY > conditionY.val);

        if (isMatchX && isMatchY) {
            finalResult = result;
            break;
        }
    }
    
    if (!finalResult) {
        finalResult = { title: "ไม่พบผลลัพธ์", description: `คะแนนของคุณคือ อารมณ์: ${scoreX}, รูปลักษณ์: ${scoreY}` };
    }

    document.getElementById('result-title').innerText = finalResult.title;
    document.getElementById('result-description').innerText = finalResult._description;
    const resultImage = document.getElementById('result-image');
    if (finalResult.imageUrl) {
        resultImage.src = finalResult._imgURL;
        resultImage.style.display = 'block';
    } else {
        resultImage.style.display = 'none';
    }
    switchView('result');
}

function generateImageForCurrentResult(event) {
    event.preventDefault(); // ป้องกันการ submit ฟอร์ม (ถ้ามี)
    const title = document.getElementById('manual-result-title').value.trim();
    if (!title) {
        alert('กรุณาใส่ "ชื่อผลลัพธ์" ก่อนสร้างรูปภาพ');
        return;
    }

    // จำลองการสร้างภาพด้วย AI โดยใช้ placeholder service
    const encodedTitle = encodeURIComponent(title);
    const randomBgColor = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const imageUrl = `https://placehold.co/600x400/${randomBgColor}/ffffff?text=${encodedTitle}`;

    const imageInput = document.getElementById('manual-result-image');
    imageInput.value = imageUrl;

    // แสดง Feedback เล็กน้อยบนปุ่ม
    const genBtn = event.target;
    const originalText = genBtn.innerHTML;
    genBtn.innerHTML = 'สร้างแล้ว!';
    genBtn.disabled = true;
    setTimeout(() => {
        genBtn.innerHTML = originalText;
        genBtn.disabled = false;
    }, 2000);
} ///confuse

function addManualQuestion(type) {
    const newQuestion = {
        question: `คำถามใหม่ (${type === 'emotion' ? 'อารมณ์' : 'รูปลักษณ์'})`,
        answers: [
            { text: "คำตอบ 1", points: 1 }, { text: "คำตอบ 2", points: 2 },
            { text: "คำตอบ 3", points: 3 }, { text: "คำตอบ 4", points: 4 }
        ]
    };
    if (type === 'emotion') {
        customEmotionQuestions.push(newQuestion);
    } else {
        customAppearanceQuestions.push(newQuestion);
    }
    renderAllCreatorLists();
}  ///confuse 2

function renderAllCreatorLists() {
    renderCreatorQuestions('emotion', customEmotionQuestions, document.getElementById('emotion-questions-list'));
    renderCreatorQuestions('appearance', customAppearanceQuestions, document.getElementById('appearance-questions-list'));
    renderCreatorResults();
}

function renderCreatorQuestions(type, questionsArray, container) {
    container.innerHTML = '';
    if (questionsArray.length === 0) {
        container.innerHTML = `<p class="text-center text-muted" style="font-size: 0.875rem;">ยังไม่มีคำถามหมวดนี้...</p>`;
        return;
    }

    questionsArray.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = `creator-question-item ${type}`;
        const answersHTML = q.answers.map((a, ansIndex) => `
            <div class="input-group" style="margin-bottom: 0.5rem;">
                <input type="text" class="form-control" value="${a.text}" oninput="updateCreatorAnswer('${type}', ${index}, ${ansIndex}, 'text', this.value)">
                <input type="number" class="form-control" value="${a.points}" style="max-width: 70px;" oninput="updateCreatorAnswer('${type}', ${index}, ${ansIndex}, 'points', parseInt(this.value, 10) || 0)">
            </div>`).join('');
        
        item.innerHTML = `
    <div class="creator-question-item-header">
        ...
        <div>
            <button class="edit-btn" data-index="${index}" title="แก้ไข">&#9998;</button>
            <button class="delete-btn" data-index="${index}" title="ลบ">&times;</button>
        </div>
    </div>`;
        container.appendChild(item);
    });
} ///confuse 3

function updateCreatorQuestionText(type, index, newText) {
    const arr = type === 'emotion' ? customEmotionQuestions : customAppearanceQuestions;
    if (arr[index]) arr[index].question = newText;
} ///confuse 4

function updateCreatorAnswer(type, qIndex, aIndex, field, value) {
    const arr = type === 'emotion' ? customEmotionQuestions : customAppearanceQuestions;
    if (arr[qIndex] && arr[qIndex].answers[aIndex]) {
        arr[qIndex].answers[aIndex][field] = value;
    }
} ///confuse 5

function deleteCreatorQuestion(type, index) {
    const arr = type === 'emotion' ? customEmotionQuestions : customAppearanceQuestions;
    arr.splice(index, 1);
    renderAllCreatorLists();
}  ///confuse 6

function addOrUpdateManualResult() {
    const title = document.getElementById('manual-result-title').value.trim();
    const description = document.getElementById('manual-result-desc').value.trim();
    const imageUrl = document.getElementById('manual-result-image').value.trim();
    const condition_x = { op: document.getElementById('condition-x-op').value, val: parseInt(document.getElementById('condition-x-val').value, 10) };
    const condition_y = { op: document.getElementById('condition-y-op').value, val: parseInt(document.getElementById('condition-y-val').value, 10) };
    const editingIndex = parseInt(document.getElementById('editing-result-index').value, 10);

    if (!title || !description || isNaN(condition_x.val) || isNaN(condition_y.val)) {
        alert("กรุณากรอกข้อมูลผลลัพธ์และเงื่อนไขให้ครบถ้วน");
        return;
    }
    const newResult = { title, description, imageUrl, condition_x, condition_y };
    if (editingIndex > -1) {
        customQuizResults[editingIndex] = newResult;
    } else {
        customQuizResults.push(newResult);
    }
    renderCreatorResults();
    resetResultForm();
}

function editCreatorResult(index) {
    const result = customQuizResults[index];
    document.getElementById('manual-result-title').value = result.title;
    document.getElementById('manual-result-desc').value = result.description;
    document.getElementById('manual-result-image').value = result.imageUrl || '';
    document.getElementById('condition-x-op').value = result.condition_x.op;
    document.getElementById('condition-x-val').value = result.condition_x.val;
    document.getElementById('condition-y-op').value = result.condition_y.op;
    document.getElementById('condition-y-val').value = result.condition_y.val;
    document.getElementById('editing-result-index').value = index;
    document.getElementById('manual-result-title').focus();
}

function deleteCreatorResult(index) {
    customQuizResults.splice(index, 1);
    renderCreatorResults();
}

function resetResultForm() {
    const form = document.getElementById('manual-result-form');
    form.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.type === 'hidden') el.value = -1;
        else if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = '';
    });
    document.getElementById('editing-result-index').value = -1;
}

function renderCreatorResults() {
    const listContainer = document.getElementById('result-creator-list');
    listContainer.innerHTML = '';
    if (customQuizResults.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-muted" style="font-size: 0.875rem;">ยังไม่มีผลลัพธ์...</p>';
        return;
    }
    customQuizResults.forEach((r, index) => {
        const item = document.createElement('div');
        item.className = 'creator-question-item';
        item.innerHTML = `
    <div class="creator-question-item-header">
        ...
        <div>
            <button class="edit-btn" data-index="${index}" title="แก้ไข">&#9998;</button>
            <button class="delete-btn" data-index="${index}" title="ลบ">&times;</button>
        </div>
    </div>`;
        listContainer.appendChild(item);
    });
}

async function generateWithLLM(type) {
    const categoryName = document.getElementById('category-name-input').value.trim();
    if (!categoryName) {
        alert('กรุณาใส่ชื่อแบบทดสอบก่อน');
        return;
    }

    let prompt = '';
    if (type === 'emotion_questions') {
        prompt = `สำหรับแบบทดสอบ "${categoryName}", สร้างคำถาม 2 ข้อเพื่อวิเคราะห์ "ด้านอารมณ์". แต่ละข้อมี 4 ตัวเลือกพร้อมคะแนน 1-4. ตอบเป็น JSON Array เท่านั้น: [{"question":"...","answers":[{"text":"...","points":1}, ...]}, ... ]`;
    } else if (type === 'appearance_questions') {
        prompt = `สำหรับแบบทดสอบ "${categoryName}", สร้างคำถาม 2 ข้อเพื่อวิเคราะห์ "ด้านรูปลักษณ์". แต่ละข้อมี 4 ตัวเลือกพร้อมคะแนน 1-4. ตอบเป็น JSON Array เท่านั้น: [{"question":"...","answers":[{"text":"...","points":1}, ...]}, ... ]`;
    } else if (type === 'results') {
        if (customEmotionQuestions.length < 1 || customAppearanceQuestions.length < 1) {
            alert('ต้องมีคำถามอารมณ์และรูปลักษณ์อย่างน้อย 1 ข้อ');
            return;
        }
        const maxScoreX = customEmotionQuestions.reduce((sum, q) => sum + Math.max(...q.answers.map(a => a.points)), 0);
        const maxScoreY = customAppearanceQuestions.reduce((sum, q) => sum + Math.max(...q.answers.map(a => a.points)), 0);
        const midPointX = Math.ceil(maxScoreX / 2);
        const midPointY = Math.ceil(maxScoreY / 2);

        prompt = `สำหรับแบบทดสอบ "${categoryName}", สร้างผลลัพธ์ 4 แบบตามแกน X (อารมณ์, สูงสุด ${maxScoreX}) และ Y (รูปลักษณ์, สูงสุด ${maxScoreY}).
        1. X <= ${midPointX}, Y <= ${midPointY}
        2. X > ${midPointX}, Y <= ${midPointY}
        3. X <= ${midPointX}, Y > ${midPointY}
        4. X > ${midPointX}, Y > ${midPointY}
        ตอบเป็น JSON Array 4 object เท่านั้น: [{"title":"...", "description":"...", "imageUrl":"https://placehold.co/600x400", "condition_x": {"op":"<=", "val":${midPointX}}, "condition_y": {"op":"<=", "val":${midPointY}}}, ... ]`;
    }

    loadingOverlay.style.display = 'flex';
    try {
        const apiKey = "AIzaSyDWAaz-IlyPd0Y2Ztnd2OBII8w7cu8NqPQ"; // **สำคัญ: ใส่ API Key ของคุณที่นี่**
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } };
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API error! status: ${response.status}`);
        const result = await response.json();
        let generatedText = result.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedJson = JSON.parse(generatedText);

        if (type === 'emotion_questions') customEmotionQuestions.push(...parsedJson);
        else if (type === 'appearance_questions') customAppearanceQuestions.push(...parsedJson);
        else if (type === 'results') customQuizResults = parsedJson;
        renderAllCreatorLists();
    } catch (error) {
        console.error("Error calling LLM API:", error);
        alert("เกิดข้อผิดพลาดในการสร้างข้อมูล: " + error.message);
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

function postCustomQuiz() {
    const categoryName = document.getElementById('category-name-input').value.trim();
    if (!categoryName) { alert('กรุณาตั้งชื่อแบบทดสอบ'); return; }
    if (customEmotionQuestions.length === 0 || customAppearanceQuestions.length === 0) { alert('กรุณาสร้างคำถามทั้งสองหมวดหมู่อย่างน้อย 1 ข้อ'); return; }
    if (customQuizResults.length < 4) { alert('กรุณาสร้างผลลัพธ์ให้ครบทั้ง 4 แบบ'); return; }

    const keyToUse = editingQuizKey ? editingQuizKey : `custom_${Date.now()}`;
    
    const newQuiz = {
        title: categoryName,
        questions: { emotion: customEmotionQuestions, appearance: customAppearanceQuestions },
        results: customQuizResults
    };
    createItem(newQuiz);
    alert('บันทึกแบบทดสอบสำเร็จ!');
    editingQuizKey = null; 
    goHome();
}

async function initializeApp() {
    try {
        ApiData = await getItems();
        renderCategorySelection();
        switchView('category');
    } catch (error) {
        console.error("Failed to initialize app:", error);
        document.getElementById('app').innerHTML = `<p style="color:red; text-align:center;">เกิดข้อผิดพลาดในการโหลดข้อมูลแบบทดสอบ (quiz.json)</p>`;
    }
}

function renderCategorySelection() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    const quizKeys = Object.keys(ApiData);

    if (quizKeys.length === 0) {
        categoryList.innerHTML = '<p class="text-center text-muted">ยังไม่มีแบบทดสอบ... ลองสร้างของคุณเองสิ!</p>';
        return;
    }
    
    for (const key of quizKeys) {
        const category = ApiData[key];
        const button = document.createElement('button');
        button.className = "btn";
        button.innerText = category.title;
        button.dataset.key = key;
        categoryList.appendChild(button);
    }
}