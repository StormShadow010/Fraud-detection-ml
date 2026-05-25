import { useState } from "react";

const API_URL = "http://localhost:5000";

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const FIELDS = [
  {
    key: "amount",
    label: "Monto de la transacción",
    icon: "💵",
    type: "number",
    min: 0,
    max: 100000,
    step: 0.01,
    placeholder: "ej: 250.00",
    prefix: "$",
  },
  {
    key: "hour",
    label: "Hora del día",
    icon: "🕐",
    type: "range",
    min: 0,
    max: 23,
    step: 1,
  },
  {
    key: "day_of_week",
    label: "Día de la semana",
    icon: "📅",
    type: "select",
    options: DAYS,
  },
  {
    key: "transactions_last_24h",
    label: "Transacciones en las últimas 24h",
    icon: "🔁",
    type: "number",
    min: 0,
    max: 100,
    step: 1,
    placeholder: "ej: 3",
  },
  {
    key: "avg_amount_user",
    label: "Monto promedio del usuario",
    icon: "📊",
    type: "number",
    min: 0,
    max: 100000,
    step: 0.01,
    placeholder: "ej: 120.00",
    prefix: "$",
  },
  {
    key: "distance_from_home",
    label: "Distancia desde casa",
    icon: "📍",
    type: "number",
    min: 0,
    max: 5000,
    step: 0.1,
    placeholder: "ej: 5.0",
    suffix: "km",
  },
  {
    key: "is_international",
    label: "¿Transacción internacional?",
    icon: "🌍",
    type: "toggle",
  },
];

const PRESETS = [
  {
    name: "✅ Transacción normal",
    short: "Normal",
    desc: "Compra típica de día, monto bajo, cerca de casa",
    bg: "#f0fdf4",
    border: "#86efac",
    btnBg: "#22c55e",
    tag: "Legítima",
    values: {
      amount: 85,
      hour: 14,
      day_of_week: 2,
      transactions_last_24h: 1,
      avg_amount_user: 100,
      distance_from_home: 5,
      is_international: 0,
    },
  },
  {
    name: "⚠️ Zona gris",
    short: "Zona gris",
    desc: "Monto algo alto, tarde de noche, algo lejos",
    bg: "#fffbeb",
    border: "#fcd34d",
    btnBg: "#f59e0b",
    tag: "Incierta",
    values: {
      amount: 400,
      hour: 23,
      day_of_week: 4,
      transactions_last_24h: 3,
      avg_amount_user: 150,
      distance_from_home: 80,
      is_international: 0,
    },
  },
  {
    name: "🚨 Transacción sospechosa",
    short: "Sospechosa",
    desc: "Monto alto, madrugada, lejos de casa, internacional",
    bg: "#fff1f2",
    border: "#fca5a5",
    btnBg: "#ef4444",
    tag: "Fraude",
    values: {
      amount: 1500,
      hour: 3,
      day_of_week: 6,
      transactions_last_24h: 8,
      avg_amount_user: 100,
      distance_from_home: 350,
      is_international: 1,
    },
  },
];

const RISK_CFG = {
  BAJO: {
    emoji: "🛡️",
    label: "Riesgo Bajo",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#86efac",
    textColor: "#14532d",
  },
  MEDIO: {
    emoji: "⚠️",
    label: "Riesgo Medio",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fcd34d",
    textColor: "#78350f",
  },
  ALTO: {
    emoji: "🚨",
    label: "Riesgo Alto",
    color: "#dc2626",
    bg: "#fff1f2",
    border: "#fca5a5",
    textColor: "#7f1d1d",
  },
};

const fmtVal = (key, val) => {
  if (key === "is_international") return val === 1 ? "Sí" : "No";
  if (key === "hour") return `${val}:00 h`;
  if (key === "day_of_week") return DAYS[val] || val;
  if (key === "amount" || key === "avg_amount_user")
    return `$${Number(val).toLocaleString("es-CO")}`;
  if (key === "distance_from_home") return `${val} km`;
  return val;
};

function GaugeChart({ value }) {
  const r = 72,
    cx = 100,
    cy = 90;
  const polar = (cx, cy, r, a) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arc = (cx, cy, r, s, e) => {
    const sp = polar(cx, cy, r, s),
      ep = polar(cx, cy, r, e),
      l = e - s > 180 ? 1 : 0;
    return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${l} 1 ${ep.x} ${ep.y}`;
  };
  const angle = -180 + (value / 100) * 180;
  const ne = polar(cx, cy, r - 6, angle);
  const col = value < 35 ? "#16a34a" : value < 70 ? "#d97706" : "#dc2626";

  return (
    // viewBox aumentado de 105 → 118 para que el texto del % no quede recortado
    <svg viewBox="0 0 200 118" style={{ width: "100%", maxWidth: 220 }}>
      {/* Arco fondo */}
      <path
        d={arc(cx, cy, r, -180, 0)}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Arco valor */}
      <path
        d={arc(cx, cy, r, -180, angle)}
        fill="none"
        stroke={col}
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Aguja */}
      <line
        x1={cx}
        y1={cy}
        x2={ne.x}
        y2={ne.y}
        stroke="#374151"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="4" fill="#374151" />
      {/* Porcentaje — cy+18 en lugar de cy+20 para centrado limpio */}
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        fontSize="19"
        fontWeight="700"
        fill={col}
      >
        {value.toFixed(1)}%
      </text>
      {/* Etiquetas extremos */}
      <text x="14" y={cy + 4} fontSize="9" fill="#9ca3af">
        0%
      </text>
      <text x="172" y={cy + 4} fontSize="9" fill="#9ca3af">
        100%
      </text>
    </svg>
  );
}

function ContribBar({ c, maxAbs }) {
  const pct = maxAbs > 0 ? Math.abs(c.contribution) / maxAbs : 0;
  const isFraud = c.contribution > 0;
  const barColor = isFraud ? "#ef4444" : "#22c55e";
  const badgeBg = isFraud ? "#fee2e2" : "#dcfce7";
  const badgeTxt = isFraud ? "#991b1b" : "#14532d";
  const impPct = (Math.abs(c.contribution) * 100).toFixed(1);
  const ICONS = {
    amount: "💵",
    hour: "🕐",
    day_of_week: "📅",
    transactions_last_24h: "🔁",
    avg_amount_user: "📊",
    distance_from_home: "📍",
    is_international: "🌍",
  };

  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 6,
        }}
      >
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
            {ICONS[c.feature]} {c.label}
          </span>
          <span
            style={{
              marginLeft: 8,
              fontSize: 12,
              color: "#6b7280",
              background: "#f9fafb",
              padding: "1px 7px",
              borderRadius: 20,
              border: "1px solid #e5e7eb",
            }}
          >
            {fmtVal(c.feature, c.value)}
          </span>
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: badgeTxt,
            background: badgeBg,
            padding: "2px 9px",
            borderRadius: 20,
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          {isFraud ? "+" : "−"}
          {impPct}%
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: "#f3f4f6",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(pct * 100).toFixed(1)}%`,
            background: barColor,
            borderRadius: 99,
            transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: "#9ca3af" }}>
        {isFraud ? "↑ Aumenta el riesgo" : "↓ Reduce el riesgo"}
      </div>
    </div>
  );
}

export default function FraudDetector() {
  const [form, setForm] = useState({
    amount: "",
    hour: 12,
    day_of_week: 0,
    transactions_last_24h: "",
    avg_amount_user: "",
    distance_from_home: "",
    is_international: 0,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const [step, setStep] = useState(1); // 1=form 2=result

  const applyPreset = (i) => {
    setActivePreset(i);
    setForm({ ...PRESETS[i].values });
    setResult(null);
    setError(null);
    setStep(1);
  };

  const handleChange = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setActivePreset(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = {};
      for (const k of Object.keys(form)) {
        body[k] = parseFloat(form[k]);
        if (isNaN(body[k]))
          throw new Error(
            `El campo "${FIELDS.find((f) => f.key === k)?.label || k}" es inválido.`,
          );
      }
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const rc = result ? RISK_CFG[result.risk_level] : null;
  const maxAbs = result
    ? Math.max(
        ...result.feature_contributions.map((c) => Math.abs(c.contribution)),
        0.001,
      )
    : 0;

  const styles = {
    page: {
      maxWidth: 520,
      margin: "0 auto",
      padding: "20px 16px",
      fontFamily: "system-ui,-apple-system,sans-serif",
      color: "#111827",
    },
    header: { textAlign: "center", marginBottom: 24 },
    logo: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: "#fef2f2",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 24,
      marginBottom: 10,
    },
    title: { fontSize: 22, fontWeight: 700, margin: 0, color: "white" },
    sub: { fontSize: 13, color: "white", margin: "4px 0 0" },
    card: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: "18px 20px",
      marginBottom: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,.06)",
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 600,
      color: "#374151",
      marginBottom: 14,
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    presetGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 8,
      marginBottom: 14,
    },
    label: {
      fontSize: 13,
      fontWeight: 500,
      color: "#374151",
      marginBottom: 5,
      display: "block",
    },
    input: {
      width: "100%",
      padding: "9px 12px",
      borderRadius: 10,
      border: "1.5px solid #e5e7eb",
      fontSize: 14,
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color .15s",
      color: "#111827",
      background: "#fff",
    },
    analyzeBtn: {
      width: "100%",
      padding: "13px",
      borderRadius: 12,
      border: "none",
      background: "#1d4ed8",
      color: "#fff",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 4,
    },
    backBtn: {
      background: "none",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: "8px 16px",
      fontSize: 13,
      cursor: "pointer",
      color: "white",
      marginBottom: 14,
    },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>🛡️</div>
        <h1 style={styles.title}>Detector de Fraude</h1>
        <p style={styles.sub}>
          Análisis inteligente de transacciones bancarias
        </p>
      </div>

      {/* Presets */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>⚡ Casos de ejemplo rápidos</div>
        <div style={styles.presetGrid}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(i)}
              style={{
                padding: "10px 8px",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "center",
                border:
                  activePreset === i
                    ? `2px solid ${p.btnBg}`
                    : "1.5px solid #e5e7eb",
                background: activePreset === i ? p.bg : "#fafafa",
                transition: "all .15s",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 3 }}>
                {p.short === "Normal"
                  ? "✅"
                  : p.short === "Zona gris"
                    ? "⚠️"
                    : "🚨"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: activePreset === i ? p.btnBg : "#374151",
                }}
              >
                {p.short}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  marginTop: 2,
                  lineHeight: 1.3,
                }}
              >
                {p.desc.split(",")[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 1 — Form */}
      {step === 1 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>📋 Datos de la transacción</div>

          {FIELDS.map((f) => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={styles.label}>
                {f.icon} {f.label}
              </label>

              {f.type === "number" && (
                <div style={{ position: "relative" }}>
                  {f.prefix && (
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 14,
                        color: "#9ca3af",
                      }}
                    >
                      {f.prefix}
                    </span>
                  )}
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    style={{
                      ...styles.input,
                      paddingLeft: f.prefix ? "28px" : "12px",
                      paddingRight: f.suffix ? "40px" : "12px",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#1d4ed8")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                  {f.suffix && (
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 13,
                        color: "#9ca3af",
                      }}
                    >
                      {f.suffix}
                    </span>
                  )}
                </div>
              )}

              {f.type === "range" && (
                <div>
                  <input
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={form[f.key]}
                    onChange={(e) =>
                      handleChange(f.key, parseInt(e.target.value))
                    }
                    style={{ width: "100%", accentColor: "#1d4ed8" }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      color: "#9ca3af",
                      marginTop: 2,
                    }}
                  >
                    <span>Medianoche</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: 13,
                      }}
                    >
                      {form[f.key]}:00 h
                    </span>
                    <span>Medianoche</span>
                  </div>
                </div>
              )}

              {f.type === "select" && (
                <select
                  value={form[f.key]}
                  onChange={(e) =>
                    handleChange(f.key, parseInt(e.target.value))
                  }
                  style={{ ...styles.input }}
                >
                  {f.options.map((o, i) => (
                    <option key={i} value={i}>
                      {o}
                    </option>
                  ))}
                </select>
              )}

              {f.type === "toggle" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    { v: 0, label: "No 🏠", desc: "Local" },
                    { v: 1, label: "Sí 🌍", desc: "Internacional" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => handleChange(f.key, opt.v)}
                      style={{
                        padding: "10px",
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "center",
                        border:
                          form[f.key] === opt.v
                            ? "2px solid #1d4ed8"
                            : "1.5px solid #e5e7eb",
                        background:
                          form[f.key] === opt.v ? "#eff6ff" : "#fafafa",
                        color: form[f.key] === opt.v ? "#1e40af" : "#374151",
                        fontWeight: form[f.key] === opt.v ? 600 : 400,
                        fontSize: 13,
                      }}
                    >
                      <div>{opt.label}</div>
                      <div
                        style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}
                      >
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...styles.analyzeBtn,
              background: loading ? "#93c5fd" : "#1d4ed8",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? <>⏳ Analizando...</> : <>🔍 Analizar transacción</>}
          </button>

          {error && (
            <div
              style={{
                marginTop: 12,
                padding: "12px 14px",
                background: "#fff1f2",
                border: "1px solid #fca5a5",
                borderRadius: 10,
                fontSize: 13,
                color: "#991b1b",
              }}
            >
              ⚠️{" "}
              {error.includes("localhost") ? (
                <>
                  Backend no conectado. Ejecuta <code>python app.py</code>
                </>
              ) : (
                error
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Result */}
      {step === 2 && result && rc && (
        <>
          <button onClick={() => setStep(1)} style={styles.backBtn}>
            ← Analizar otra
          </button>

          {/* Verdict */}
          <div
            style={{
              ...styles.card,
              border: `2px solid ${rc.border}`,
              background: rc.bg,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 6 }}>{rc.emoji}</div>
            <div
              style={{
                display: "inline-block",
                background: "#fff",
                padding: "4px 18px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                color: rc.textColor,
                border: `1px solid ${rc.border}`,
                marginBottom: 16,
              }}
            >
              {rc.label}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <GaugeChart value={result.fraud_probability} />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 14,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "12px",
                  border: "1px solid #fca5a5",
                }}
              >
                <div
                  style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}
                >
                  Probabilidad de fraude
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: 700, color: "#dc2626" }}
                >
                  {result.fraud_probability.toFixed(1)}%
                </div>
              </div>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "12px",
                  border: "1px solid #86efac",
                }}
              >
                <div
                  style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}
                >
                  Probabilidad legítima
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: 700, color: "#16a34a" }}
                >
                  {result.legit_probability.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Contributions */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>🔬 ¿Por qué esta predicción?</div>
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginBottom: 14,
                marginTop: -8,
              }}
            >
              Cada barra muestra cuánto influyó ese dato en la decisión del
              modelo.
            </p>
            {result.feature_contributions.map((c) => (
              <ContribBar key={c.feature} c={c} maxAbs={maxAbs} />
            ))}
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: "#f9fafb",
                borderRadius: 10,
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              💡 Los porcentajes muestran cuánto cambia la probabilidad de
              fraude si ese factor tomara un valor típico legítimo.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
