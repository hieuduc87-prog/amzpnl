import { useState, useCallback, useRef, useEffect } from "react";

const defaultProduct = () => ({
  id: Date.now(),
  name: "",
  sellingPrice: 0,
  basecost: 0,
  shippingFees: 0,
  dutyFees: 0,
  referralRate: 15,
  fbaFees: 0,
  storageFees: 0,
  otherFees: 0,
  adsRate: 25,
});

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: "Glass Suncatcher Ornament",
    sellingPrice: 15.99,
    basecost: 1.70,
    shippingFees: 1.14,
    dutyFees: 0,
    referralRate: 16.89,
    fbaFees: 4.16,
    storageFees: 0.05,
    otherFees: 0.34,
    adsRate: 25,
  },
  {
    id: 2,
    name: "2 Layer Suncatcher Ornament",
    sellingPrice: 9.80,
    basecost: 1.96,
    shippingFees: 1.14,
    dutyFees: 0,
    referralRate: 15,
    fbaFees: 3.68,
    storageFees: 0.01,
    otherFees: 0.01,
    adsRate: 25,
  },
  {
    id: 3,
    name: "Aluminum Suncatcher Ornament",
    sellingPrice: 18.99,
    basecost: 1.60,
    shippingFees: 1.14,
    dutyFees: 0,
    referralRate: 15,
    fbaFees: 3.68,
    storageFees: 0.02,
    otherFees: 0.02,
    adsRate: 25,
  },
];

function calc(p) {
  const basecostTotal = p.basecost + p.shippingFees + p.dutyFees;
  const referralFees = p.sellingPrice * (p.referralRate / 100);
  const amzFees = referralFees + p.fbaFees + p.storageFees + p.otherFees;
  const adsSpend = p.sellingPrice * (p.adsRate / 100);
  const profit = p.sellingPrice - basecostTotal - amzFees - adsSpend;
  const margin = p.sellingPrice > 0 ? (profit / p.sellingPrice) * 100 : 0;
  const basecostRatio = p.sellingPrice > 0 ? (basecostTotal / p.sellingPrice) * 100 : 0;
  return { basecostTotal, referralFees, amzFees, adsSpend, profit, margin, basecostRatio };
}

const fmt = (v) => {
  if (v === undefined || v === null || isNaN(v)) return "$0.00";
  return `$${v.toFixed(2)}`;
};
const pct = (v) => `${v.toFixed(2)}%`;

const profitColor = (v) => (v > 0 ? "#16a34a" : v < 0 ? "#dc2626" : "#94a3b8");
const marginBg = (v) =>
  v >= 20 ? "rgba(22,163,74,0.15)" : v >= 10 ? "rgba(234,179,8,0.15)" : v >= 0 ? "rgba(251,146,60,0.15)" : "rgba(220,38,38,0.15)";

export default function App() {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [globalAdsRate, setGlobalAdsRate] = useState(25);
  const [editingId, setEditingId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const scrollRef = useRef(null);

  const addProduct = () => {
    const np = defaultProduct();
    np.adsRate = globalAdsRate;
    setProducts([...products, np]);
    setEditingId(np.id);
    setTimeout(() => scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" }), 100);
  };

  const removeProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const duplicateProduct = (p) => {
    const np = { ...p, id: Date.now(), name: p.name + " (copy)" };
    setProducts([...products, np]);
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const applyGlobalAds = () => {
    setProducts(products.map((p) => ({ ...p, adsRate: globalAdsRate })));
  };

  const bestProduct = products.length
    ? products.reduce((best, p) => (calc(p).margin > calc(best).margin ? p : best))
    : null;

  const totalProfit = products.reduce((s, p) => s + calc(p).profit, 0);
  const avgMargin = products.length
    ? products.reduce((s, p) => s + calc(p).margin, 0) / products.length
    : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #0a0f1a 0%, #111827 50%, #0d1525 100%)",
      color: "#e2e8f0",
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Header */}
      <header style={{
        padding: "24px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
        position: "relative", zIndex: 2,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "#fff",
            boxShadow: "0 0 20px rgba(245,158,11,0.3)",
          }}>₱</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.5px", color: "#f8fafc" }}>
              Amazon P&L Simulator
            </h1>
            <p style={{ fontSize: 11, margin: 0, color: "#64748b", letterSpacing: "1px", textTransform: "uppercase" }}>
              Profit & Loss Calculator
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Global Ads Rate */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 8, padding: "6px 14px",
          }}>
            <span style={{ fontSize: 12, color: "#f59e0b" }}>ADS %</span>
            <input
              type="number"
              value={globalAdsRate}
              onChange={(e) => setGlobalAdsRate(parseFloat(e.target.value) || 0)}
              style={{
                width: 50, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 4, color: "#f59e0b", textAlign: "center", padding: "4px",
                fontSize: 13, fontFamily: "inherit", outline: "none",
              }}
            />
            <button onClick={applyGlobalAds} style={{
              background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 4, color: "#f59e0b", padding: "4px 10px", cursor: "pointer",
              fontSize: 11, fontFamily: "inherit",
            }}>Apply All</button>
          </div>

          <button onClick={() => setShowHelp(!showHelp)} style={{
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 8, color: "#818cf8", padding: "8px 14px", cursor: "pointer",
            fontSize: 12, fontFamily: "inherit",
          }}>?</button>

          <button onClick={addProduct} style={{
            background: "linear-gradient(135deg, #16a34a, #15803d)",
            border: "none", borderRadius: 8, color: "#fff", padding: "8px 18px",
            cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            boxShadow: "0 0 15px rgba(22,163,74,0.3)",
          }}>+ Thêm SP</button>
        </div>
      </header>

      {showHelp && (
        <div style={{
          margin: "0 32px", padding: 20, background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12,
          fontSize: 13, lineHeight: 1.7, color: "#a5b4fc",
        }}>
          <strong style={{ color: "#c7d2fe" }}>Hướng dẫn sử dụng:</strong><br />
          • Click vào bất kỳ sản phẩm nào để chỉnh sửa thông số<br />
          • <strong>Giá bán</strong>: Giá bán trên Amazon<br />
          • <strong>Basecost</strong>: Giá mua hàng (FOB)<br />
          • <strong>Shipping</strong>: Chi phí vận chuyển tới kho FBA<br />
          • <strong>Duty</strong>: Thuế nhập khẩu<br />
          • <strong>Referral %</strong>: Phí Amazon (thường 15%)<br />
          • <strong>FBA Fees</strong>: Phí fulfillment<br />
          • <strong>Ads %</strong>: % doanh thu chi cho quảng cáo (mặc định 25%)<br />
          • Màu <span style={{ color: "#16a34a" }}>xanh</span> = lãi, <span style={{ color: "#dc2626" }}>đỏ</span> = lỗ
        </div>
      )}

      {/* Summary Cards */}
      <div style={{
        display: "flex", gap: 16, padding: "20px 32px", flexWrap: "wrap",
        position: "relative", zIndex: 2,
      }}>
        <SummaryCard
          label="Tổng số SP"
          value={products.length}
          sub="products"
          accent="#6366f1"
        />
        <SummaryCard
          label="Avg Margin"
          value={pct(avgMargin)}
          sub={avgMargin >= 15 ? "healthy" : avgMargin >= 0 ? "low" : "negative"}
          accent={avgMargin >= 15 ? "#16a34a" : avgMargin >= 0 ? "#eab308" : "#dc2626"}
        />
        <SummaryCard
          label="Best Product"
          value={bestProduct ? bestProduct.name.substring(0, 20) : "N/A"}
          sub={bestProduct ? pct(calc(bestProduct).margin) + " margin" : ""}
          accent="#16a34a"
        />
        <SummaryCard
          label="SP lỗ"
          value={products.filter((p) => calc(p).profit < 0).length}
          sub={`/ ${products.length} products`}
          accent="#dc2626"
        />
      </div>

      {/* Products Table */}
      <div ref={scrollRef} style={{
        padding: "0 32px 32px", overflowX: "auto",
        position: "relative", zIndex: 2,
      }}>
        {products.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 60, color: "#475569",
            border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 16,
          }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>Chưa có sản phẩm nào</p>
            <p style={{ fontSize: 13 }}>Nhấn <strong>+ Thêm SP</strong> để bắt đầu phân tích</p>
          </div>
        ) : (
          <div style={{
            display: "flex", gap: 16,
            paddingBottom: 16,
            minWidth: "min-content",
          }}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                computed={calc(p)}
                isEditing={editingId === p.id}
                onEdit={() => setEditingId(editingId === p.id ? null : p.id)}
                onUpdate={(f, v) => updateProduct(p.id, f, v)}
                onRemove={() => removeProduct(p.id)}
                onDuplicate={() => duplicateProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Comparison Bar Chart */}
      {products.length > 1 && (
        <div style={{
          padding: "0 32px 40px",
          position: "relative", zIndex: 2,
        }}>
          <h3 style={{ fontSize: 14, color: "#94a3b8", marginBottom: 16, letterSpacing: "1px", textTransform: "uppercase" }}>
            So sánh Margin
          </h3>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 160, flexWrap: "wrap" }}>
            {products.map((p) => {
              const c = calc(p);
              const maxMargin = Math.max(...products.map((pp) => Math.abs(calc(pp).margin)), 1);
              const height = Math.max((Math.abs(c.margin) / maxMargin) * 120, 4);
              return (
                <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 60 }}>
                  <span style={{ fontSize: 11, color: profitColor(c.margin), fontWeight: 700 }}>{pct(c.margin)}</span>
                  <div style={{
                    width: 40, height, borderRadius: "6px 6px 0 0",
                    background: c.margin >= 0
                      ? "linear-gradient(180deg, #16a34a, #15803d)"
                      : "linear-gradient(180deg, #dc2626, #991b1b)",
                    boxShadow: c.margin >= 0 ? "0 0 10px rgba(22,163,74,0.3)" : "0 0 10px rgba(220,38,38,0.3)",
                    transition: "height 0.5s ease",
                  }} />
                  <span style={{
                    fontSize: 9, color: "#64748b", textAlign: "center",
                    maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{p.name || "N/A"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub, accent }) {
  return (
    <div style={{
      flex: "1 1 180px",
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${accent}22`,
      borderRadius: 12,
      padding: "16px 20px",
      minWidth: 160,
    }}>
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "#64748b", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: accent, margin: "0 0 4px" }}>{value}</p>
      <p style={{ fontSize: 11, color: "#475569", margin: 0 }}>{sub}</p>
    </div>
  );
}

function ProductCard({ product: p, computed: c, isEditing, onEdit, onUpdate, onRemove, onDuplicate }) {
  const InputRow = ({ label, field, prefix = "", suffix = "", step = "0.01" }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
      <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {prefix && <span style={{ fontSize: 11, color: "#64748b" }}>{prefix}</span>}
        <input
          type="number"
          step={step}
          value={p[field]}
          onChange={(e) => onUpdate(field, parseFloat(e.target.value) || 0)}
          style={{
            width: 70, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4, color: "#e2e8f0", textAlign: "right", padding: "4px 6px",
            fontSize: 12, fontFamily: "inherit", outline: "none",
          }}
          onFocus={(e) => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
        {suffix && <span style={{ fontSize: 11, color: "#64748b" }}>{suffix}</span>}
      </div>
    </div>
  );

  const DataRow = ({ label, value, color = "#cbd5e1", bold = false, bg = "transparent" }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "6px 0", background: bg, margin: bg !== "transparent" ? "0 -16px" : 0,
      paddingLeft: bg !== "transparent" ? 16 : 0, paddingRight: bg !== "transparent" ? 16 : 0,
      borderRadius: bg !== "transparent" ? 6 : 0,
    }}>
      <span style={{ fontSize: 12, color: bold ? "#f8fafc" : "#94a3b8", fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontSize: 13, color, fontWeight: bold ? 700 : 500, fontFamily: "inherit" }}>{value}</span>
    </div>
  );

  return (
    <div style={{
      width: 300, flexShrink: 0,
      background: "rgba(255,255,255,0.025)",
      border: `1px solid ${c.profit >= 0 ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"}`,
      borderRadius: 16,
      overflow: "hidden",
      transition: "all 0.3s",
    }}>
      {/* Product Header */}
      <div style={{
        padding: "16px",
        background: c.profit >= 0
          ? "linear-gradient(135deg, rgba(22,163,74,0.08), rgba(22,163,74,0.02))"
          : "linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.02))",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
          {isEditing ? (
            <input
              type="text"
              value={p.name}
              onChange={(e) => onUpdate("name", e.target.value)}
              placeholder="Tên sản phẩm..."
              style={{
                flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6, color: "#f8fafc", padding: "6px 10px",
                fontSize: 14, fontWeight: 600, fontFamily: "inherit", outline: "none",
              }}
            />
          ) : (
            <span style={{
              fontSize: 14, fontWeight: 600, color: "#f8fafc",
              flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{p.name || "Chưa đặt tên"}</span>
          )}
          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            <MiniBtn onClick={onDuplicate} title="Nhân bản">⧉</MiniBtn>
            <MiniBtn onClick={onEdit} title="Sửa" active={isEditing}>✎</MiniBtn>
            <MiniBtn onClick={onRemove} title="Xóa" danger>×</MiniBtn>
          </div>
        </div>

        {/* Big Price & Profit */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <p style={{ fontSize: 10, color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Giá bán</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#f8fafc", margin: "2px 0 0" }}>{fmt(p.sellingPrice)}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Profit</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: profitColor(c.profit), margin: "2px 0 0" }}>{fmt(c.profit)}</p>
            <p style={{
              fontSize: 11, fontWeight: 700, margin: "2px 0 0",
              color: profitColor(c.margin),
              padding: "2px 8px", borderRadius: 4,
              background: marginBg(c.margin),
              display: "inline-block",
            }}>{pct(c.margin)}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 16px" }}>
        {isEditing ? (
          <div>
            <p style={{ fontSize: 10, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
              ▸ Nhập liệu
            </p>
            <InputRow label="Giá bán" field="sellingPrice" prefix="$" />
            <InputRow label="Basecost" field="basecost" prefix="$" />
            <InputRow label="Shipping" field="shippingFees" prefix="$" />
            <InputRow label="Duty" field="dutyFees" prefix="$" />
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "8px 0" }} />
            <InputRow label="Referral %" field="referralRate" suffix="%" step="0.1" />
            <InputRow label="FBA Fees" field="fbaFees" prefix="$" />
            <InputRow label="Storage" field="storageFees" prefix="$" />
            <InputRow label="Other Fees" field="otherFees" prefix="$" />
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "8px 0" }} />
            <InputRow label="Ads %" field="adsRate" suffix="%" step="0.5" />
          </div>
        ) : (
          <div>
            {/* Cost Breakdown */}
            <p style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
              Chi phí Basecost
            </p>
            <DataRow label="Basecost" value={fmt(p.basecost)} />
            <DataRow label="Shipping" value={fmt(p.shippingFees)} />
            <DataRow label="Duty" value={fmt(p.dutyFees)} />
            <DataRow label="Tổng" value={fmt(c.basecostTotal)} color="#f8fafc" bold bg="rgba(255,255,255,0.03)" />

            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.06)", margin: "10px 0" }} />

            <p style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
              Phí Amazon
            </p>
            <DataRow label={`Referral (${p.referralRate}%)`} value={fmt(c.referralFees)} />
            <DataRow label="FBA Fees" value={fmt(p.fbaFees)} />
            <DataRow label="Storage" value={fmt(p.storageFees)} />
            <DataRow label="Other" value={fmt(p.otherFees)} />
            <DataRow label="Tổng phí AMZ" value={fmt(c.amzFees)} color="#f8fafc" bold bg="rgba(255,255,255,0.03)" />

            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.06)", margin: "10px 0" }} />

            <DataRow label={`Ads (${p.adsRate}%)`} value={fmt(c.adsSpend)} color="#f59e0b" />

            <div style={{ borderTop: "2px solid rgba(255,255,255,0.08)", margin: "10px 0" }} />

            <DataRow label="PROFIT" value={fmt(c.profit)} color={profitColor(c.profit)} bold bg={marginBg(c.margin)} />
            <DataRow label="Margin" value={pct(c.margin)} color={profitColor(c.margin)} bold />
            <DataRow label="Basecost/Rev" value={pct(c.basecostRatio)} color="#94a3b8" />
          </div>
        )}
      </div>

      {/* Profit Bar at bottom */}
      <div style={{
        height: 4,
        background: c.profit >= 0
          ? `linear-gradient(90deg, #16a34a ${Math.min(c.margin, 100)}%, transparent)`
          : `linear-gradient(90deg, #dc2626 ${Math.min(Math.abs(c.margin), 100)}%, transparent)`,
      }} />
    </div>
  );
}

function MiniBtn({ children, onClick, title, active = false, danger = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 26, height: 26,
        background: active ? "rgba(99,102,241,0.2)" : danger ? "rgba(220,38,38,0.1)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? "rgba(99,102,241,0.4)" : danger ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 6,
        color: active ? "#818cf8" : danger ? "#f87171" : "#94a3b8",
        cursor: "pointer",
        fontSize: 14, fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 0,
      }}
    >{children}</button>
  );
}
