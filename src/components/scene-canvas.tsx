import type { Slide } from "@/lib/data";

export function SceneCanvas({ slide }: { slide: Slide }) {
  const { scene } = slide;
  return (
    <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(160deg, ${scene.from}, ${scene.to})` }}>
      <div
        className="absolute inset-0 opacity-90 mix-blend-overlay"
        style={{
          backgroundImage:
            scene.subject === "PHONE_GLOW"
              ? "radial-gradient(circle at 70% 70%, rgba(255,200,120,0.35), transparent 35%)"
              : scene.subject === "FACE_SHOCK"
              ? "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.18), transparent 45%)"
              : scene.subject === "RED_PULSE"
              ? "radial-gradient(circle at 50% 80%, rgba(220,60,60,0.4), transparent 40%)"
              : scene.subject === "MESSAGE_BUBBLE"
              ? "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.0))"
              : "none",
        }}
      />
      {scene.vignette && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, transparent 40%, ${scene.vignette})` }} />
      )}
    </div>
  );
}