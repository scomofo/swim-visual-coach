function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function headLift(pose) {
  return clamp01((pose.headPitch + 0.14) / 0.7);
}
function hipSink(pose) {
  return clamp01(pose.hipDrop / 0.32);
}
function flatness(pose, profile) {
  const rolled = Math.abs(pose.bodyRoll) / 0.62;
  const flat = 1 - clamp01(rolled);
  return profile.bothForward ? flat * 0.32 : flat;
}
function splay(pose) {
  return clamp01(
    (Math.abs(pose.leftLeg.splay) + Math.abs(pose.rightLeg.splay)) / 0.32
  );
}
function wideRecovery(profile) {
  if (profile.bothForward) return profile.armSet === "ti" ? 0.04 : 0.28;
  return profile.armSet === "windmill" ? 0.58 : 0.1;
}
function frontalArea(profile, pose) {
  const lift = headLift(pose);
  const hips = hipSink(pose);
  const flat = flatness(pose, profile);
  const kick = splay(pose);
  const wide = wideRecovery(profile);
  return clamp01(
    0.16 + 0.28 * lift + 0.3 * hips + 0.16 * flat + 0.12 * kick + 0.14 * wide
  );
}
function evaluateDrag(profile, pose, otherTotal = null) {
  const lift = headLift(pose);
  const hips = hipSink(pose);
  const flat = flatness(pose, profile);
  const kick = splay(pose);
  const wide = wideRecovery(profile);
  const pitchUp = clamp01((pose.bodyPitch + 0.1) / 0.36);
  const splash = clamp01(profile.splash);
  const wobble = clamp01(profile.wobble / 0.09);
  const thrash = clamp01(profile.kickAmp * profile.kickHz / 0.95);
  const knee = clamp01(profile.kickKnee / 0.85);
  const form = clamp01(
    0.07 + 0.3 * lift + 0.34 * hips + 0.16 * flat + 0.12 * kick + 0.2 * wide + 0.1 * pitchUp
  );
  const wave = clamp01(
    0.05 + 0.34 * splash + 0.26 * lift + 0.16 * wobble + 0.2 * thrash + (pose.breathing ? 0.1 * lift : 0)
  );
  const skin = clamp01(
    0.08 + 0.28 * thrash + 0.2 * knee + 0.18 * wide + 0.12 * wobble + 0.1 * kick
  );
  const total = clamp01(0.46 * form + 0.31 * wave + 0.23 * skin);
  const speedRef = clamp01(profile.speed / 1.18);
  const force = clamp01(total * speedRef * speedRef);
  const area = frontalArea(profile, pose);
  let dominant = "form";
  if (wave >= form && wave >= skin) dominant = "wave";
  else if (skin >= form && skin >= wave) dominant = "skin";
  const label = total < 0.28 ? "Quiet" : total < 0.58 ? "Stirring" : "Noisy";
  const note = total < 0.28 ? "The water stays almost still." : dominant === "form" ? "Head, hips, or width are punching a hole." : dominant === "wave" ? "The surface is doing extra work." : "The kick and recovery are making weather.";
  return {
    form,
    wave,
    skin,
    total,
    force,
    area,
    label,
    dominant,
    note,
    otherTotal
  };
}
const IDLE_DRAG = {
  form: 0.12,
  wave: 0.08,
  skin: 0.1,
  total: 0.1,
  force: 0.02,
  area: 0.18,
  label: "Quiet",
  dominant: "form",
  note: "The water stays almost still.",
  otherTotal: null
};
export {
  IDLE_DRAG,
  evaluateDrag,
  frontalArea
};
