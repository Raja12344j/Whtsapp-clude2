async function fetchLogs() {
  const r = await fetch('/logs');
  const j = await r.json();
  const div = document.getElementById('logs');
  div.innerText = j.logs.join('\n') || 'No logs yet.';
  div.scrollTop = div.scrollHeight;
}

document.getElementById('startBtn').addEventListener('click', async () => {
  const targetType = document.getElementById('targetType').value;
  const targetId = document.getElementById('targetId').value.trim();
  const intervalSeconds = document.getElementById('intervalSeconds').value;
  const fileInput = document.getElementById('messagesFile');
  if (!targetId) return alert('Enter target id');
  if (!fileInput.files.length) return alert('Choose messages file (.txt)');
  const fd = new FormData();
  fd.append('messagesFile', fileInput.files[0]);
  fd.append('targetType', targetType);
  fd.append('targetId', targetId);
  fd.append('intervalSeconds', intervalSeconds);
  const res = await fetch('/start', { method: 'POST', body: fd });
  const j = await res.json();
  if (res.ok) {
    alert('Started');
    fetchLogs();
  } else {
    alert('Error: ' + (j.error || JSON.stringify(j)));
  }
});

document.getElementById('stopBtn').addEventListener('click', async () => {
  const res = await fetch('/stop', { method: 'POST' });
  const j = await res.json();
  if (res.ok) {
    alert('Stopped');
    fetchLogs();
  } else {
    alert('Error: ' + (j.error || JSON.stringify(j)));
  }
});

// poll logs every 3 seconds
setInterval(fetchLogs, 3000);
fetchLogs();
