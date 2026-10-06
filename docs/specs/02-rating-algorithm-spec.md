# Spec: Algoritmo de Rating Ponderado (SDD)

## 1. Objetivo
Convertir una serie de métricas financieras dispares en un único *Score Global (0-100)* usando un sistema de pesos configurables por el usuario.

## 2. Normalización de Métricas (Mapeo a 0-100)
Para poder sumar peras con peras, cada métrica se normaliza antes de multiplicarse por su peso:

### 2.1. PER (Price-to-Earnings Ratio)
Aplica tanto para `trailingPE` como para `forwardPE`.
- **Regla**: Un PER bajo (<15) es atractivo (Score 100). Un PER alto (>80) indica sobrevaloración extrema (Score 0).
- **Fórmula**: 
  - Si $PE \le 15 \Rightarrow 100$
  - Si $PE \ge 80 \Rightarrow 0$
  - Intermedio: $100 - \left( \frac{PE - 15}{65} \right) \times 100$

### 2.2. Debt-to-Equity Ratio
- **Regla**: Valores bajos o cercanos a 0 son menos riesgosos (Score 100). Valores altos (>3) indican endeudamiento excesivo (Score 0).
- **Fórmula**:
  - Si $D/E \le 0 \Rightarrow 100$
  - Si $D/E \ge 3 \Rightarrow 0$
  - Intermedio: $100 - \left( \frac{D/E}{3} \right) \times 100$

### 2.3. Price / Cash Flow (P/CF)
- **Regla**: Menor ratio indica mayor generación de caja frente a su precio.
- **Fórmula**:
  - Si $P/CF \le 10 \Rightarrow 100$
  - Si $P/CF \ge 50 \Rightarrow 0$
  - Intermedio: $100 - \left( \frac{P/CF - 10}{40} \right) \times 100$

### 2.4. Margen Neto (Net Margin)
- **Regla**: Se valora la rentabilidad. Un 40% de margen se considera excelente (Score 100).
- **Fórmula**:
  - Si $Margin \le 0\% \Rightarrow 0$
  - Si $Margin \ge 40\% \Rightarrow 100$
  - Intermedio: $\left( \frac{Margin}{40} \right) \times 100$

### 2.5. MarketBeat Scores y Superinversores
Estos valores ya provienen en un rango `0-100` desde el scraper, o se mapearon directamente a esa escala, por lo que no requieren conversión adicional.

### 2.6. Consenso de Analistas (Ratio Compra/Venta)
- **Regla**: Mide la dominancia de las recomendaciones de compra.
- **Fórmula**: $ \max\left(0, \frac{\text{Compra} - \text{Venta}}{\text{Total Opiniones}}\right) \times 100 $

## 3. Cálculo de Puntuación Final Ponderada
Una vez normalizadas, la puntuación total se calcula como el sumatorio de cada métrica normalizada multiplicada por su peso relativo:

$$ Rating = \sum_{i} \left( \text{ScoreNormalizado}_i \times \frac{\text{Peso}_i}{100} \right) $$

**Pesos por defecto:**
- Opinión de Analistas (MarketBeat): **50%**
- Potencial Upside: **50%**
- Resto de métricas: **0%** (Configurables desde UI).
