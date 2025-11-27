import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService, SurveyResponse } from '../../../../services/survey/survey.service';
import { Question } from '../../../../services/survey/survey.service';

@Component({
  selector: 'app-survey-responses',
  templateUrl: './survey-responses.component.html',
  styleUrls: ['./survey-responses.component.scss']
})
export class SurveyResponsesComponent implements OnInit {
  surveyId: string | null = null;
  responses: SurveyResponse[] = [];
  questions: Question[] = [];
  loading = false;
  error: string | null = null;
  groupedResponses: Map<string, SurveyResponse[]> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService
  ) { }

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('surveyId');
    if (this.surveyId) {
      this.loadResponses();
    } else {
      this.error = 'ID de encuesta no válido';
    }
  }

  loadResponses(): void {
    if (!this.surveyId) return;

    this.loading = true;
    this.error = null;

    this.surveyService.getSurveyResponses(this.surveyId).subscribe({
      next: (data) => {
        this.responses = data;
        this.groupResponses();
        this.loadQuestions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar respuestas:', error);
        this.error = 'No fue posible cargar las respuestas de la encuesta.';
        this.loading = false;
      }
    });
  }

  loadQuestions(): void {
    if (!this.surveyId) return;

    this.surveyService.getBuilderState(this.surveyId).subscribe({
      next: (state) => {
        this.questions = state.questions || [];
      },
      error: (error) => {
        console.error('Error al cargar preguntas:', error);
      }
    });
  }

  groupResponses(): void {
    this.groupedResponses.clear();
    const byHash = new Map<string, SurveyResponse[]>();
    
    for (const response of this.responses) {
      const hash = response.metadata_hash || 'unknown';
      if (!byHash.has(hash)) {
        byHash.set(hash, []);
      }
      byHash.get(hash)!.push(response);
    }
    
    this.groupedResponses = byHash;
  }

  getQuestionText(questionId: string): string {
    const question = this.questions.find(q => q.id === questionId);
    return question ? question.text : questionId;
  }

  formatResponseValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      if (value.choice) return value.choice;
      if (value.selected) return Array.isArray(value.selected) ? value.selected.join(', ') : value.selected;
      if (value.value) return value.value;
      if (value.answer) return value.answer;
      return JSON.stringify(value);
    }
    return String(value);
  }

  goBack(): void {
    this.router.navigate(['/admin/surveys']);
  }

  getResponseKeys(): string[] {
    return Array.from(this.groupedResponses.keys());
  }
}

