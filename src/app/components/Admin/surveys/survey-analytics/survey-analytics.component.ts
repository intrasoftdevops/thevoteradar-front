import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService, SurveyAnalytics } from '../../../../services/survey/survey.service';

@Component({
  selector: 'app-survey-analytics',
  templateUrl: './survey-analytics.component.html',
  styleUrls: ['./survey-analytics.component.scss']
})
export class SurveyAnalyticsComponent implements OnInit {
  surveyId: string | null = null;
  analytics: SurveyAnalytics | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService
  ) { }

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('surveyId');
    if (this.surveyId) {
      this.loadAnalytics();
    } else {
      this.error = 'ID de encuesta no válido';
    }
  }

  loadAnalytics(): void {
    if (!this.surveyId) return;

    this.loading = true;
    this.error = null;

    this.surveyService.getSurveyAnalytics(this.surveyId).subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar analytics:', error);
        this.error = 'No fue posible cargar las estadísticas de la encuesta.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/surveys']);
  }

  getPercentage(count: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  getObjectKeys(obj: Record<string, any>): string[] {
    return Object.keys(obj);
  }
}

