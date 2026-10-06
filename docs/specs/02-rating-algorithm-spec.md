# Spec: Algoritmo de Rating Ponderado (SDD)

## 1. Objetivo
Convertir una serie de métricas financieras dispares en un único *Score Global (0-100)* usando un sistema de pesos configurables por el usuario y un mecanismo de normalización matemática proporcional.

## 2. Normalización de Métricas (Mapeo a 0-100)
Para poder combinar métricas de distinta naturaleza, cada una se normaliza a una escala uniforme de 0 a 100 antes de multiplicarse por su peso relativo:

### 2.1. P/E Growth (PEG)
- **Regla**: Un PEG $\le 1.0$ representa una valoración óptima respecto al crecimiento (Score 100). Un PEG $\ge 5.0$ indica sobrevaloración severa (Score 0).
- **Fórmula**: 
  - Si $PEG \le 1.0 \Rightarrow 100$
  - Si $PEG \ge 5.0 \Rightarrow 0$
  - Intermedio: $100 - \left( \frac{PEG - 1.0}{4.0} \right) \times 100$

### 2.2. Valoración y Ganancias (MB) & Opinión de Analistas (MB)
- Métricas directas de MarketBeat normalizadas en origen a escala `0-100`.

### 2.3. Potencial Upside
- **Regla**: Potencial de revalorización respecto al precio objetivo medio de los analistas. Un 50% de upside alcanza la puntuación máxima (Score 100).
- **Fórmula**: Si $Upside \le 0\% \Rightarrow 0$; Si $Upside \ge 50\% \Rightarrow 100$; Intermedio: $\left(\frac{Upside}{50}\right) \times 100$.

### 2.4. Consenso de Compra/Venta (Ratio de Analistas)
- **Regla**: Mide la proporción de recomendaciones de compra frente al total de opiniones emitidas.
- **Fórmula**: $ \max\left(0, \min\left(1, \frac{\text{Compra} - \text{Venta}}{\text{Total Opiniones}}\right)\right) \times 100 $

### 2.5. Forward P/E & Trailing P/E
- **Regla**: Un PER bajo ($\le 15$) es atractivo (Score 100). Un PER alto ($\ge 80$) indica sobrevaloración extrema (Score 0).
- **Fórmula**: $100 - \left( \frac{PE - 15}{65} \right) \times 100$ (acotado entre 0 y 100).

### 2.6. MarketBeat Rating (0-4)
- Mapeo lineal a escala 0-100: $(rating / 4.0) \times 100$.

### 2.7. Ratios Financieros Complementarios
- **Debt-to-Equity (D/E)**: $D/E \le 0 \Rightarrow 100$; $D/E \ge 3 \Rightarrow 0$; Intermedio: $100 - (D/E / 3) \times 100$.
- **Price / Cash Flow (P/CF)**: $P/CF \le 10 \Rightarrow 100$; $P/CF \ge 50 \Rightarrow 0$; Intermedio: $100 - \left( \frac{P/CF - 10}{40} \right) \times 100$.
- **Margen Neto**: $Margin \le 0\% \Rightarrow 0$; $Margin \ge 40\% \Rightarrow 100$; Intermedio: $(Margin / 40) \times 100$.
- **Dividend Yield**: $Yield \le 0\% \Rightarrow 0$; $Yield \ge 5\% \Rightarrow 100$; Intermedio: $(Yield / 5.0) \times 100$.
- **Market Cap**: Escala logarítmica con referencia en \$2,000B (\$2T): $\min\left(100, \frac{\log_{10}(Cap)}{\log_{10}(2000)} \times 100\right)$.

---

## 3. Configuración Óptima por Defecto (Pesos del Algoritmo)
El estado inicial del algoritmo arranca equilibrado con el siguiente orden y pesos prioritarios (suma total: 100%):

1. **P/E Growth (PEG)**: **30%**
2. **Valoración y Ganancias (MB)**: **18%**
3. **Potencial Upside**: **17%**
4. **Consenso de Compra/Venta**: **15%**
5. **Opinión de Analistas (MB)**: **10%**
6. **Forward P/E**: **5%**
7. **MarketBeat Rating (0-4)**: **5%**
8. **Resto de métricas**: **0%** (Superinversores, Trailing P/E, Margen Neto, D/E, Dividend Yield, P/CF, Market Cap, Interés Corto, Sentimiento en Noticias, Insiders).

$$ Rating = \sum_{i} \left( \text{ScoreNormalizado}_i \times \frac{\text{Peso}_i}{100} \right) $$
