import { useState } from "react";

const API_URL = "http://localhost:5000";

const FEATURE_META = {
  amount: {
    label: "Monto ($)",
    icon: "ti-currency-dollar",
    type: "number",
    min: 0,
    max: 10000,
    step: 0.01,
    placeholder: "ej: 250.00",
    unit: "$",
  },
  hour: {
    label: "Hora del día",
    icon: "ti-clock",
    type: "range",
    min: 0,
    max: 23,
    step: 1,
    placeholder: "",
    unit: "h",
  },
  day_of_week: {
    label: "Día de la semana",
    icon: "ti-calendar",
    type: "select",
    options: [
      { value: 0, label: "Lunes" },
      { value: 1, label: "Martes" },
      { value: 2, label: "Miércoles" },
      { value: 3, label: "Jueves" },
      { value: 4, label: "Viernes" },
      { value: 5, label: "Sábado" },
      { value: 6, label: "Domingo" },
    ],
  },
  transactions_last_24h: {
    label: "Transacciones últ. 24h",
    icon: "ti-repeat",
    type: "number",
    min: 0,
    max: 50,
    step: 1,
    placeholder: "ej: 3",
    unit: "",
  },
  avg_amount_user: {
    label: "Monto promedio usuario ($)",
    icon: "ti-chart-bar",
    type: "number",
    min: 0,
    max: 5000,
    step: 0.01,
    placeholder: "ej: 120.00",
    unit: "$",
  },
  distance_from_home: {
    label: "Distancia desde casa (km)",
    icon: "ti-map-pin",
    type: "number",
    min: 0,
    max: 2000,
    step: 0.1,
    placeholder: "ej: 5.0",
    unit: "km",
  },
  is_international: {
    label: "¿Transacción internacional?",
    icon: "ti-world",
    type: "toggle",
  },
};

const PRESETS = [
  {
    name: "Transacción normal",
    icon: "ti-check",
    color: "green",
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
    name: "Zona gris",
    icon: "ti-alert-triangle",
    color: "amber",
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
    name: "Transacción sospechosa",
    icon: "ti-alert-circle",
    color: "red",
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

const COLORS = {
  green: { bg: "#EAF3DE", text: "#3B6D11", border: "#639922", badge: "#27500A" },
  amber: { bg: "#FAEEDA", text: "#854F0B", border: "#BA7517", badge: "#633806" },
  red: { bg: "#FCEBEB", text: "#A32D2D", border: "#E24B4A", badge: "#791F1F" },
};

const RISK_CONFIG = {
  BAJO: { color: "green", label: "Riesgo Bajo", icon: "ti-shield-check" },
  MEDIO: { color: "amber", label: "Riesgo Medio", icon: "ti-shield-exclamation" },
  ALTO: { color: "red", label: "Riesgo Alto", icon: "ti-shield-x" },
};

function GaugeChart({ value }) {
  const radius = 80;
  const cx = 110;
  const cy = 100;
  const startAngle = -180;
  const endAngle = 0;
  const angle = startAngle + (value / 100) * 180;

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (cx, cy, r, startDeg, endDeg) => {
    const s = polarToCartesian(cx, cy, r, startDeg);
    const e = polarToCartesian(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const needleEnd = polarToCartesian(cx, cy, radius - 10, angle);

  const getColor = (v) => {
    if (v < 35) return "#639922";
    if (v < 70) return "#BA7517";
    return "#E24B4A";
  };

  return (
    <svg viewBox="0 0 220 115" style={{ width: "100%", maxWidth: 260 }}>
      <path
        d={arcPath(cx, cy, radius, -180, 0)}
        fill="none"
        stroke="#e5e5e0"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d={arcPath(cx, cy, radius, -180, startAngle + (value / 100) * 180)}
        fill="none"
        stroke={getColor(value)}
        strokeWidth="18"
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={needleEnd.x}
        y2={needleEnd.y}
        stroke="#2C2C2A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="5" fill="#2C2C2A" />
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="22" fontWeight="600" fill={getColor(value)}>
        {value.toFixed(1)}%
      </text>
      <text x="18" y={cy + 6} fontSize="11" fill="#888780">0%</text>
      <text x="186" y={cy + 6} fontSize="11" fill="#888780">100%</text>
    </svg>
  );
}

function ContributionBar({ contribution, maxAbs }) {
  const pct = maxAbs > 0 ? Math.abs(contribution.contribution) / maxAbs : 0;
  const isFraud = contribution.contribution > 0;
  const barColor = isFraud ? "#E24B4A" : "#639922";
  const bgColor = isFraud ? "#FCEBEB" : "#EAF3DE";

  const formatValue = (feat, val) => {
    if (feat === "is_international") return val === 1 ? "Sí" : "No";
    if (feat === "hour") return `${val}:00`;
    if (feat === "day_of_week") {
      const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      return days[val] || val;
    }
    return typeof val === "number" ? val.toLocaleString("es-CO") : val;
  };

  const impactPct = Math.abs(contribution.contribution * 100).toFixed(1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div style={{ width: 170, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <i
            className={`ti ${FEATURE_META[contribution.feature]?.icon || "ti-circle"}`}
            style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
            aria-hidden="true"
          />
          <span style={{ fontSize: 13, color: "var(--color-text-primary)", fontWeight: 500 }}>
            {contribution.label}
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-secondary)",
            background: "var(--color-background-secondary)",
            padding: "1px 6px",
            borderRadius: 4,
          }}
        >
          {formatValue(contribution.feature, contribution.value)}
        </span>
      </div>

      <div style={{ flex: 1, position: "relative", height: 18, background: "#F1EFE8", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${pct * 100}%`,
            background: barColor,
            borderRadius: 4,
            transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>

      <div
        style={{
          width: 60,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: isFraud ? "#A32D2D" : "#3B6D11",
            background: bgColor,
            padding: "2px 7px",
            borderRadius: 4,
          }}
        >
          {isFraud ? "+" : "−"}{impactPct}%
        </span>
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

  const applyPreset = (idx) => {
    setActivePreset(idx);
    setForm({ ...PRESETS[idx].values });
    setResult(null);
    setError(null);
  };

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
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
        if (isNaN(body[k])) throw new Error(`El campo "${FEATURE_META[k]?.label || k}" no es válido.`);
      }
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const riskCfg = result ? RISK_CONFIG[result.risk_level] : null;
  const riskColor = riskCfg ? COLORS[riskCfg.color] : null;

  const maxAbs = result
    ? Math.max(...result.feature_contributions.map((c) => Math.abs(c.contribution)), 0.001)
    : 0;

  return (
    <div style={{ padding: "1.5rem 0", fontFamily: "var(--font-sans)", maxWidth: 820, margin: "0 auto" }}>
      <h2 className="sr-only">Detector de fraude bancario con machine learning</h2>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "#FCEBEB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="ti ti-shield-lock" style={{ fontSize: 22, color: "#A32D2D" }} aria-hidden="true" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)" }}>
            Detector de fraude bancario
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
            Modelo Random Forest · 7 variables · análisis de contribución por factor
          </p>
        </div>
      </div>

      {/* Presets */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 10px" }}>
          Casos de ejemplo
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {PRESETS.map((p, i) => {
            const c = COLORS[p.color];
            const active = activePreset === i;
            return (
              <button
                key={i}
                onClick={() => applyPreset(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 14px",
                  borderRadius: "var(--border-radius-md)",
                  border: active ? `2px solid ${c.border}` : "0.5px solid var(--color-border-secondary)",
                  background: active ? c.bg : "var(--color-background-primary)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? c.badge : "var(--color-text-primary)",
                  transition: "all 0.15s",
                }}
              >
                <i className={`ti ${p.icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16, marginBottom: 16 }}>
        {/* Form */}
        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "1.25rem",
          }}
        >
          <p style={{ margin: "0 0 1rem", fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>
            Datos de la transacción
          </p>

          {Object.entries(FEATURE_META).map(([key, meta]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  marginBottom: 5,
                }}
              >
                <i className={`ti ${meta.icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
                {meta.label}
              </label>

              {meta.type === "number" && (
                <input
                  type="number"
                  min={meta.min}
                  max={meta.max}
                  step={meta.step}
                  placeholder={meta.placeholder}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              )}

              {meta.type === "range" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="range"
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <span
                    style={{
                      minWidth: 38,
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {form[key]}:00
                  </span>
                </div>
              )}

              {meta.type === "select" && (
                <select
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                >
                  {meta.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}

              {meta.type === "toggle" && (
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { v: 0, label: "No" },
                    { v: 1, label: "Sí" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => handleChange(key, opt.v)}
                      style={{
                        padding: "6px 20px",
                        borderRadius: "var(--border-radius-md)",
                        border:
                          form[key] === opt.v
                            ? "2px solid #185FA5"
                            : "0.5px solid var(--color-border-secondary)",
                        background:
                          form[key] === opt.v ? "#E6F1FB" : "var(--color-background-primary)",
                        color: form[key] === opt.v ? "#0C447C" : "var(--color-text-primary)",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: form[key] === opt.v ? 500 : 400,
                      }}
                    >
                      {opt.label}
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
              width: "100%",
              padding: "10px 0",
              marginTop: 6,
              borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-secondary)",
              background: loading ? "var(--color-background-secondary)" : "var(--color-background-primary)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--color-text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <i className="ti ti-loader" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} aria-hidden="true" />
                Analizando...
              </>
            ) : (
              <>
                <i className="ti ti-brain" style={{ fontSize: 16 }} aria-hidden="true" />
                Analizar transacción ↗
              </>
            )}
          </button>

          {error && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "#FCEBEB",
                border: "0.5px solid #F09595",
                borderRadius: "var(--border-radius-md)",
                fontSize: 13,
                color: "#791F1F",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <i className="ti ti-wifi-off" style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              <span>
                No se pudo conectar con el backend en <code>localhost:5000</code>. Ejecuta <code>python app.py</code> y recarga.
                <br />
                <span style={{ color: "#A32D2D" }}>{error}</span>
              </span>
            </div>
          )}
        </div>

        {/* Result panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!result && !loading && (
            <div
              style={{
                flex: 1,
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "2rem",
                minHeight: 260,
              }}
            >
              <i className="ti ti-chart-donut" style={{ fontSize: 40, color: "var(--color-text-tertiary)" }} aria-hidden="true" />
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-tertiary)", textAlign: "center" }}>
                Completa el formulario y presiona "Analizar transacción"
              </p>
            </div>
          )}

          {result && riskCfg && (
            <>
              {/* Verdict card */}
              <div
                style={{
                  background: "var(--color-background-primary)",
                  border: `2px solid ${riskColor.border}`,
                  borderRadius: "var(--border-radius-lg)",
                  padding: "1.25rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: riskColor.bg,
                    color: riskColor.badge,
                    padding: "5px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 14,
                  }}
                >
                  <i className={`ti ${riskCfg.icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
                  {riskCfg.label}
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <GaugeChart value={result.fraud_probability} />
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 10 }}>
                  <div
                    style={{
                      background: "var(--color-background-secondary)",
                      borderRadius: "var(--border-radius-md)",
                      padding: "8px 16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 2 }}>
                      Prob. fraude
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: "#A32D2D" }}>
                      {result.fraud_probability.toFixed(1)}%
                    </div>
                  </div>
                  <div
                    style={{
                      background: "var(--color-background-secondary)",
                      borderRadius: "var(--border-radius-md)",
                      padding: "8px 16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 2 }}>
                      Prob. legítima
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: "#3B6D11" }}>
                      {result.legit_probability.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature contributions */}
              <div
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  padding: "1.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>
                    Influencia por factor
                  </p>
                  <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: "#E24B4A", display: "inline-block" }} />
                      <span style={{ color: "var(--color-text-secondary)" }}>impulsa fraude</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: "#639922", display: "inline-block" }} />
                      <span style={{ color: "var(--color-text-secondary)" }}>mitiga fraude</span>
                    </span>
                  </div>
                </div>

                {result.feature_contributions.map((c) => (
                  <ContributionBar key={c.feature} contribution={c} maxAbs={maxAbs} />
                ))}

                <p style={{ margin: "12px 0 0", fontSize: 11, color: "var(--color-text-tertiary)" }}>
                  Los porcentajes indican cuánto cambia la probabilidad de fraude si ese factor tomara su valor
                  típico en transacciones legítimas. Mayor barra = mayor influencia en esta predicción.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
      `}</style>
    </div>
  );
}
