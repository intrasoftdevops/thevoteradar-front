import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para truncar texto largo
 * 
 * Uso:
 * {{ 'Texto muy largo' | truncate:10 }}     → "Texto muy..."
 * {{ 'Texto corto' | truncate:50 }}         → "Texto corto"
 * {{ text | truncate:20:'---' }}            → "Texto truncado---"
 */
@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 50, ellipsis: string = '...'): string {
    if (!value) return '';
    
    if (value.length <= limit) {
      return value;
    }
    
    return value.substring(0, limit) + ellipsis;
  }
}

