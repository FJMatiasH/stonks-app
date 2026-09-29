# Spec: Arquitectura del Recommended Component (SDD)

## 1. Objetivo
Proporcionar una tabla interactiva para evaluar acciones de bolsa en tiempo real (Server-Sent Events), combinada con un panel de configuración de pesos (Weights Panel) con Two-Way Binding.

## 2. Layout y UI

### 2.1. Panel de Algoritmo (2 Columnas)
- Se utiliza un grid de 2 columnas `grid-cols-1 md:grid-cols-2`.
- Cada control contiene el nombre de la métrica y **dos inputs sincronizados**:
  1. `<input type="range">` (Slider)
  2. `<input type="number">` (Input numérico clásico)
- **Propiedades**: Ambos están configurados con `min="0" max="100" step="1"` para forzar valores enteros y evitar imprecisión de coma flotante en la vista.

### 2.2. Tabla de Acciones (`table-fixed`)
- Se implementa `table-fixed` para que el ancho de las columnas se mantenga estricto.
- Nuevas columnas incorporadas: **D/E** (Debt-to-Equity) y **P/CF** (Price/Cash Flow).
- Valores numéricos formateados con el `number` pipe nativo de Angular (`1.2-2` o `1.1-1`).

## 3. Lógica de Autonormalización (Two-Way Binding y Suma 100%)
Cuando el usuario modifica el valor (ya sea arrastrando el slider o escribiendo en el input text):
1. **Validación**: Se fuerza el valor a un entero entre `0` y `100`.
2. **Cálculo del Delta (Diff)**: La diferencia entre el nuevo valor y el viejo (`newVal - oldVal`).
3. **Distribución Proporcional**: Se toma ese Delta y se resta (o suma) proporcionalmente a las otras métricas dependiendo de su peso actual:
   - Si las demás suman 0, se reparte el sobrante equitativamente.
   - Si no, se resta `diff * (peso / sumaDeLosDemas)`.
4. **Fijación de Coma Flotante**: Se comprueba que la suma final de todos sea exactamente 100. Si hay error de flotante, se corrige sumando o restando al primer elemento restante.
5. **Re-redondeo Final**: Tras el cálculo matemático, todos los pesos se redondean de vuelta a enteros (`Math.round`) para que el usuario no vea decimales en el slider ni en los inputs.

## 4. Renderizado en Tiempo Real
Dado que los datos de las acciones se reciben vía SSE (Server-Sent Events) en el `CarteraService`:
- La tabla inicializa su cálculo ponderado durante la carga.
- Cuando una acción se añade a la matriz `tempStocks`, inmediatamente se invoca `recalculateRatings()` que aplica la fórmula matemática definida en la especificación, y re-ordena la vista automáticamente sin necesidad de refetching completo de datos.
