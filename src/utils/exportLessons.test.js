import { describe, expect, it, vi } from 'vitest';
import { exportLessonData } from './exportLessons';

describe('exportLessons', () => {
  it('downloads a JSON lesson file and revokes the object URL', () => {
    const anchor = document.createElement('a');
    const click = vi.spyOn(anchor, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
    const createObjectURL = vi.fn(() => 'blob:lesson');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    exportLessonData({ drill: 'superman', progress: { superman: true }, settings: { mode: 'correct' } });

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(anchor.download).toBe('swim-lesson-superman.json');
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:lesson');

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});
