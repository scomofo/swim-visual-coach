import { describe, expect, it } from 'vitest';
import { DRILLS, DRILL_IDS, DRILL_ORDER } from './drills';

describe('curriculum', () => {
  it('places the new drills in TI order', () => {
    expect(DRILL_ORDER.indexOf('sweetSpot')).toBe(DRILL_ORDER.indexOf('breathing') + 1);
    expect(DRILL_ORDER.indexOf('singleSwitch')).toBe(DRILL_ORDER.indexOf('sweetSpot') + 1);
    expect(DRILL_ORDER.indexOf('twoBeatKick')).toBe(DRILL_ORDER.indexOf('tripleSwitch') + 1);
    expect(DRILL_ORDER.indexOf('rhythm')).toBe(DRILL_ORDER.indexOf('twoBeatKick') + 1);
  });

  it('forms a closed next-pointer chain through every drill', () => {
    const titles = Object.fromEntries(DRILL_ORDER.map((id) => [id, DRILLS[id].title]));
    for (const id of DRILL_ORDER) {
      const nextTitle = DRILLS[id].next;
      const nextId = DRILL_ORDER.find((other) => titles[other] === nextTitle);
      expect(nextId, `${id}.next -> "${nextTitle}"`).toBeDefined();
    }
    // chain ends wrap back to the first drill
    expect(DRILLS[DRILL_ORDER[DRILL_ORDER.length - 1]].next).toBe(titles[DRILL_ORDER[0]]);
  });

  it('keeps the sweet spot in the streamline phase and the two-beat kick in core propulsion', () => {
    expect(DRILLS.sweetSpot.phase).toBe('Streamline');
    expect(DRILLS.twoBeatKick.phase).toBe('Core Propulsion');
  });

  it('frames the two-beat kick as rotation timing, not propulsion', () => {
    const copy = [DRILLS.twoBeatKick.description, DRILLS.twoBeatKick.coach, DRILLS.twoBeatKick.narration].join(' ');
    expect(copy).toMatch(/rotation/i);
    expect(copy).toMatch(/does not propel|not propel/i);
    expect(copy).not.toMatch(/propel the body|propulsion/i);
  });

  it('teaches the catch in both switch drills', () => {
    for (const id of ['singleSwitch', 'tripleSwitch']) {
      const copy = [DRILLS[id].description, DRILLS[id].coach, DRILLS[id].narration].join(' ');
      expect(copy).toMatch(/anchor/i);
      expect(copy).toMatch(/high elbow/i);
      expect(copy).toMatch(/past the hip/i);
    }
    // core-body doctrine is preserved, not contradicted
    expect(DRILLS.singleSwitch.coach).toMatch(/torso moves the swimmer/i);
  });

  it('uses canonical TI vocabulary where the concepts are taught', () => {
    const press = [DRILLS.chestPress.description, DRILLS.chestPress.narration].join(' ');
    expect(press).toMatch(/press your buoy/i);
    const spl = [DRILLS.spl.description, DRILLS.spl.coach, DRILLS.spl.narration].join(' ');
    expect(spl).toMatch(/swimming golf/i);
    expect(spl).toMatch(/focal point/i);
    expect(spl).toMatch(/front[ -]?quadrant/i);
    const skate = DRILLS.skating.narration;
    expect(skate).toMatch(/front[ -]?quadrant/i);
  });

  it('states the never-train-struggle rule explicitly', () => {
    const effortless = DRILLS.effortless25.coach;
    expect(effortless).toMatch(/never practice struggling/i);
  });

  it('every drill entry has the shape the UI expects', () => {
    for (const id of DRILL_ORDER) {
      const drill = DRILLS[id];
      expect(drill.id).toBe(id);
      expect(typeof drill.title).toBe('string');
      expect(typeof drill.phase).toBe('string');
      expect(typeof drill.description).toBe('string');
      expect(typeof drill.coach).toBe('string');
      expect(typeof drill.narration).toBe('string');
      expect(typeof drill.next).toBe('string');
      expect(Array.isArray(drill.tags)).toBe(true);
      for (const tag of drill.tags) {
        expect(typeof tag.label).toBe('string');
        expect(typeof tag.cue).toBe('string');
      }
    }
    expect(Object.keys(DRILLS)).toEqual(DRILL_ORDER);
    expect(DRILL_IDS).toEqual(DRILL_ORDER);
  });
});
