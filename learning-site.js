subsite.ready.then(async context => {
  if (!context) return;
  const { client, session } = context;
  document.getElementById('learningEmail').textContent = session.user.email || '';
  const [progress, attempts, learning] = await Promise.all([
    client.from('section_progress').select('*', { count: 'exact', head: true }).eq('completed', true),
    client.from('quiz_attempts').select('is_correct'),
    client.from('user_learning_data').select('learning_state').maybeSingle()
  ]);
  document.getElementById('sectionProgress').textContent = progress.count ?? 0;
  const rows = attempts.data || [];
  document.getElementById('attemptCount').textContent = rows.length;
  document.getElementById('accuracy').textContent = rows.length ? `${Math.round(rows.filter(item => item.is_correct).length / rows.length * 100)}%` : '0%';
  const notes = learning.data?.learning_state?.study_notes || {};
  const noteCount = Object.values(notes).filter(note => note.learned || note.pitfall || note.code).length;
  document.getElementById('noteCount').textContent = noteCount;
});
