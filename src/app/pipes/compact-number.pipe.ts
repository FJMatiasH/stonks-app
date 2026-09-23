import { Pipe, PipeTransform } from '@angular/core';

/**
 * Compact Number Pipe — Convierte cifras grandes a notación financiera abreviada.
 * Ejemplos:
 *   416161000000 → "$416.16B"
 *   95789000000  → "$95.79B"
 *   4232000      → "$4.23M"
 *   999000       → "$999.00K"
 */
@Pipe({
  name: 'compactNumber',
  standalone: true,
})
export class CompactNumberPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    currencySymbol: string = '',
    decimals: number = 2
  ): string {
    if (value == null || isNaN(value)) return 'N/A';

    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    let formatted: string;
    let suffix: string;

    if (abs >= 1_000_000_000_000) {
      formatted = (abs / 1_000_000_000_000).toFixed(decimals);
      suffix = 'T';
    } else if (abs >= 1_000_000_000) {
      formatted = (abs / 1_000_000_000).toFixed(decimals);
      suffix = 'B';
    } else if (abs >= 1_000_000) {
      formatted = (abs / 1_000_000).toFixed(decimals);
      suffix = 'M';
    } else if (abs >= 1_000) {
      formatted = (abs / 1_000).toFixed(decimals);
      suffix = 'K';
    } else {
      formatted = abs.toFixed(decimals);
      suffix = '';
    }

    return `${sign}${currencySymbol}${formatted}${suffix}`;
  }

  /**
   * Devuelve el número completo formateado para usar en atributo title (tooltip).
   */
  static fullFormat(value: number | null | undefined, currencySymbol: string = ''): string {
    if (value == null || isNaN(value)) return 'N/A';
    return `${currencySymbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
