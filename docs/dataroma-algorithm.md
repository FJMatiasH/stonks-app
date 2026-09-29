# Algoritmo de Puntuación de Superinversores (Dataroma)

Este documento detalla la fórmula matemática y los criterios utilizados para calcular el rating (0-100) basado en las compras y ventas de los Superinversores recopilados desde Dataroma.

## 1. Puntuación Base
La puntuación inicial (base) es de **50 puntos**.

## 2. Análisis de Transacciones (Compras y Ventas)
Por cada posición (holding) de un Superinversor en la acción, se analiza su actividad reciente:
- Si la actividad incluye **'Buy'** (Compra nueva) o **'Add'** (Añadir a posición): se suman **+2 puntos** a la puntuación base y se incrementa el contador de `compradores` en 1.
- Si la actividad incluye **'Sell'** (Venta total) o **'Reduce'** (Reducir posición): se restan **-2 puntos** a la puntuación base y se incrementa el contador de `vendedores` en 1.

## 3. Peso Promedio en Cartera
Se calcula el peso promedio de la acción en las carteras de los Superinversores que la poseen (`avgWeight = suma total de porcentajes / número de inversores`).
- Si el peso promedio es **mayor al 5%**: se suman **+10 puntos**.
- Si el peso promedio es **mayor al 2%** y **menor o igual a 5%**: se suman **+5 puntos**.

## 4. Consenso de Mercado (Compradores vs Vendedores)
Se compara el número total de compradores contra el de vendedores para medir el consenso general:
- Si hay más del **doble de compradores que vendedores** (`compradores > vendedores * 2`): se suman **+15 puntos**.
- Si hay **más compradores que vendedores** pero no el doble (`compradores > vendedores`): se suman **+5 puntos**.
- Si hay más del **doble de vendedores que compradores** (`vendedores > compradores * 2`): se restan **-15 puntos**.
- Si hay **más vendedores que compradores** pero no el doble (`vendedores > compradores`): se restan **-5 puntos**.

## 5. Normalización Final
El puntaje final se acota matemáticamente entre **0 y 100** (`Math.max(0, Math.min(100, Math.round(score)))`). Esto asegura que la puntuación siempre sea un porcentaje válido, independientemente de la cantidad extrema de compras o ventas.
