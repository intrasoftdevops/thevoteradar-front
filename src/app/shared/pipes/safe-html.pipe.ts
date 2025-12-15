import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe para renderizar HTML de forma segura
 * 
 * Uso:
 * <div [innerHTML]="htmlContent | safeHtml"></div>
 * 
 * PRECAUCIÓN: Solo usar con contenido HTML confiable
 */
@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

