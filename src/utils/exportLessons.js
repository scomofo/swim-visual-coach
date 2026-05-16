export function exportLessonData({ drill, progress, settings }) {
  const payload = {
    exportedAt: new Date().toISOString(),
    drill,
    progress,
    settings,
  };

  const blob = new Blob([
    JSON.stringify(payload, null, 2),
  ], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `swim-lesson-${drill}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
