export const COLORS = {
  void: "#08080A",
  coal: "#111116",
  soot: "#18181F",
  white: "#FFFFFF",
  bone: "#F7F7F5",
  mute: "#9A9AA3",
  line: "rgba(255,255,255,0.10)",
  grape: "#891FFB",
  iris: "#507AF4",
  frost: "#1BE2EB",
  gradient: "linear-gradient(90deg, #891FFB 0%, #507AF4 50%, #1BE2EB 100%)",
  glowPurple: "rgba(137,31,251,0.18)",
  glowBlue: "rgba(80,122,244,0.15)",
  glowCyan: "rgba(27,226,235,0.12)",
} as const;

export const STAGES = [
  { key: "idea", label: "IDEA", color: COLORS.grape, index: "01" },
  { key: "experience", label: "EXPERIENCE", color: COLORS.iris, index: "02" },
  { key: "result", label: "RESULT", color: COLORS.frost, index: "03" },
] as const;
