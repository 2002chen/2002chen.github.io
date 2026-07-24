(function () {
  let dynamicQuestions = [];

  async function loadQuestions() {
    const client = window.learningCloud?.client;
    if (!client) return;
    const { data, error } = await client.from('questions').select('*').eq('active', true).order('level').order('position').order('id');
    if (error) { console.error(error); return; }
    dynamicQuestions = data || [];
    if (!dynamicQuestions.length) return;
    const mapped = { beginner: [], basic: [], advanced: [] };
    dynamicQuestions.forEach(row => mapped[row.level]?.push([row.topic, row.question_text, row.options, row.correct_index, row.explanation, row.id]));
    Object.keys(mapped).forEach(level => { if (mapped[level].length) quizBank[level] = mapped[level]; });
    quizOrder = {};
    renderQuiz();
  }

  async function saveAttempt(question, choice, correct) {
    const client = window.learningCloud?.client;
    const user = (await client?.auth.getUser())?.data?.user;
    const questionId = question?.[5];
    if (!client || !user || !questionId) return;
    await client.from('quiz_attempts').insert({ user_id: user.id, question_id: questionId, selected_index: choice, is_correct: correct });
  }

  async function saveMessage(payload) {
    const client = window.learningCloud?.client;
    const user = (await client?.auth.getUser())?.data?.user;
    if (!client || !user) throw new Error('请先登录');
    const { error } = await client.from('user_messages').insert({ user_id: user.id, sender_name: payload.name, message_type: payload.type, title: payload.title, content: payload.content, contact: payload.contact });
    if (error) throw error;
  }

  window.dynamicLearning = { loadQuestions, saveAttempt, saveMessage };
  window.addEventListener('cloud-data-ready', loadQuestions);
})();
