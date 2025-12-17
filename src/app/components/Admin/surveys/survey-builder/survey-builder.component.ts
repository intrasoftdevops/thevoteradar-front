import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService, BuilderState, Question, QuestionType } from '../../../../services/survey/survey.service';

@Component({
  selector: 'app-survey-builder',
  templateUrl: './survey-builder.component.html',
  styleUrls: ['./survey-builder.component.scss']
})
export class SurveyBuilderComponent implements OnInit {
  surveyId: string | null = null;
  builderState: BuilderState | null = null;
  loading = false;
  error: string | null = null;
  editingQuestionId: string | null = null;
  editingTitle = false;
  surveyStatus: 'draft' | 'active' | 'closed' | 'paused' | 'archived' = 'draft';
  private lastAddedChoiceInfo: { questionId: string; index: number } | null = null;
  private dragSourceIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService
  ) { }

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('surveyId');
    if (this.surveyId) {
      this.loadBuilderState();
    } else {
      this.error = 'ID de encuesta no válido';
    }
  }

  loadBuilderState(): void {
    if (!this.surveyId) return;

    this.loading = true;
    this.error = null;

    this.surveyService.getBuilderState(this.surveyId).subscribe({
      next: (state) => {
        this.builderState = state;
        this.surveyStatus = state.status || (state.is_draft ? 'draft' : 'active');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estado del builder:', error);
        this.error = error.error?.detail || error.message || 'Error al cargar la encuesta';
        this.loading = false;
      }
    });
  }

  addQuestion(type: QuestionType): void {
    if (!this.surveyId) return;

    this.surveyService.addQuestion(this.surveyId, type).subscribe({
      next: (newState) => {
        this.builderState = newState;
        
        if (newState.questions.length > 0) {
          const newQuestion = newState.questions[newState.questions.length - 1];
          this.editingQuestionId = newQuestion.id;
        }
      },
      error: (error) => {
        console.error('Error al agregar pregunta:', error);
        this.error = error.error?.detail || error.message || 'Error al agregar pregunta';
      }
    });
  }

  saveQuestion(question: Question): void {
    if (!this.surveyId || !question.text.trim()) {
      alert('El texto de la pregunta es requerido');
      return;
    }

    
    if ((question.type === 'multiple_choice' || question.type === 'multiple_select') && 
        (!question.options?.choices || question.options.choices.length < 2)) {
      alert('Debe haber al menos 2 opciones de respuesta');
      return;
    }

    if (question.type === 'scale') {
      if (!question.options?.min || !question.options?.max || 
          question.options.min >= question.options.max) {
        alert('La escala debe tener un mínimo menor que el máximo');
        return;
      }
    }

    if (question.type === 'candidate_vote' && 
        (!question.options?.candidates || question.options.candidates.length < 1)) {
      alert('Debe haber al menos 1 candidato');
      return;
    }

    this.surveyService.updateQuestion(this.surveyId, question.id, {
      text: question.text.trim(),
      options: question.options,
      is_demographic: !!question.is_demographic
    }).subscribe({
      next: (updatedState) => {
        this.builderState = updatedState;
        this.editingQuestionId = null;
        this.error = null;
      },
      error: (error) => {
        console.error('Error al guardar pregunta:', error);
        this.error = error.error?.detail || error.message || 'Error al guardar pregunta';
      }
    });
  }

  /**
   * Toggle demográfico (Builder v2)
   * Se persiste inmediatamente para que la bandera quede guardada aunque no presione "Guardar".
   */
  toggleDemographic(question: Question, value: boolean, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.surveyId) return;

    const prev = !!question.is_demographic;
    question.is_demographic = value;

    this.surveyService.updateQuestion(this.surveyId, question.id, { is_demographic: value }).subscribe({
      next: (updatedState) => {
        this.builderState = updatedState;
        this.error = null;
      },
      error: (error) => {
        console.error('Error al actualizar is_demographic:', error);
        // rollback
        question.is_demographic = prev;
        this.error = 'No se pudo guardar el estado demográfico.';
      }
    });
  }

  // =========================
  // Drag & Drop (HTML5) para reordenar preguntas
  // =========================

  onDragStart(index: number, event: DragEvent): void {
    this.dragSourceIndex = index;
    try {
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
      }
      event.dataTransfer?.setData('text/plain', String(index));
    } catch {
      // noop
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(targetIndex: number, event: DragEvent): void {
    event.preventDefault();
    if (!this.builderState || !this.surveyId) return;

    const from = this.dragSourceIndex ?? Number(event.dataTransfer?.getData('text/plain'));
    const to = targetIndex;
    if (Number.isNaN(from) || from === null || from === undefined) return;
    if (from === to) return;
    if (from < 0 || from >= this.builderState.questions.length) return;
    if (to < 0 || to >= this.builderState.questions.length) return;

    const prevOrder = [...this.builderState.questions];

    // Optimista: reordenar local
    const moved = this.builderState.questions.splice(from, 1)[0];
    this.builderState.questions.splice(to, 0, moved);

    // Persistir en backend
    const questionIds = this.builderState.questions.map(q => q.id);
    this.surveyService.reorderQuestions(this.surveyId, questionIds).subscribe({
      next: (updatedState) => {
        this.builderState = updatedState;
        this.error = null;
      },
      error: (err) => {
        console.error('Error al reordenar preguntas:', err);
        // rollback
        if (this.builderState) {
          this.builderState.questions = prevOrder;
        }
        this.error = 'No se pudo reordenar. Inténtalo de nuevo.';
      }
    });
  }

  onDragEnd(): void {
    this.dragSourceIndex = null;
  }

  deleteQuestion(questionId: string): void {
    if (!this.surveyId || !confirm('¿Estás seguro de eliminar esta pregunta?')) return;

    this.surveyService.deleteQuestion(this.surveyId, questionId).subscribe({
      next: (updatedState) => {
        this.builderState = updatedState;
        if (this.editingQuestionId === questionId) {
          this.editingQuestionId = null;
        }
      },
      error: (error) => {
        console.error('Error al eliminar pregunta:', error);
        this.error = error.error?.detail || error.message || 'Error al eliminar pregunta';
      }
    });
  }

  saveTitle(newTitle: string): void {
    if (!this.builderState || !this.surveyId || newTitle === this.builderState.title || !newTitle.trim()) {
      this.editingTitle = false;
      return;
    }

    
    const previousTitle = this.builderState.title;
    this.builderState.title = newTitle.trim();
    this.editingTitle = false;

    
    this.surveyService.updateSurvey(this.surveyId, { title: newTitle.trim() }).subscribe({
      error: (error) => {
        console.error('Error al actualizar título:', error);
        
        if (this.builderState) {
          this.builderState.title = previousTitle;
        }
        this.error = 'No se pudo guardar el título. Inténtalo de nuevo.';
      }
    });
  }

  activateSurvey(): void {
    if (!this.builderState || !this.surveyId || !this.builderState.is_draft) return;
    
    if (!confirm('¿Activar encuesta? Una vez activa, se recomienda no cambiar la estructura.')) {
      return;
    }

    const previousState = { ...this.builderState };
    this.builderState.is_draft = false;

    this.surveyService.updateSurvey(this.surveyId, { status: 'active' }).subscribe({
      next: () => {
        this.surveyStatus = 'active';
        if (this.builderState) {
          this.builderState.is_draft = false;
          this.builderState.status = 'active';
        }
        
        this.loadBuilderState();
      },
      error: (error) => {
        console.error('Error al activar encuesta:', error);
        this.builderState = previousState;
        this.error = 'No se pudo activar la encuesta.';
      }
    });
  }

  closeSurvey(): void {
    if (!this.builderState || !this.surveyId || this.builderState.is_draft) return;
    
    if (!confirm('¿Cerrar encuesta? No aceptará más respuestas.')) {
      return;
    }

    this.surveyService.updateSurvey(this.surveyId, { status: 'closed' }).subscribe({
      next: () => {
        this.surveyStatus = 'closed';
        if (this.builderState) {
          this.builderState.status = 'closed';
        }
        this.loadBuilderState();
      },
      error: (error) => {
        console.error('Error al cerrar encuesta:', error);
        this.error = 'No se pudo cerrar la encuesta.';
      }
    });
  }

  copyPublicLink(): void {
    if (!this.surveyId) return;
    
    const origin = window.location.origin;
    const publicUrl = `${origin}/survey/${this.surveyId}`;
    
    
    this.surveyService.createShortLink(publicUrl, { survey_id: this.surveyId }).subscribe({
      next: (response: any) => {
        const linkToCopy = response?.short_url || publicUrl;
        navigator.clipboard.writeText(linkToCopy).then(() => {
          alert('Link copiado al portapapeles');
        }).catch(() => {
          
          prompt('Copia este link:', linkToCopy);
        });
      },
      error: () => {
        
        navigator.clipboard.writeText(publicUrl).then(() => {
          alert('Link copiado al portapapeles');
        }).catch(() => {
          prompt('Copia este link:', publicUrl);
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/panel/encuestas']);
  }

  getQuestionTypeLabel(type: QuestionType): string {
    const labels: Record<QuestionType, string> = {
      'text': 'Texto',
      'multiple_choice': 'Opción Múltiple',
      'multiple_select': 'Selección Múltiple',
      'scale': 'Escala Numérica',
      'candidate_vote': 'Voto por Candidato'
    };
    return labels[type] || type;
  }

  // Función trackBy para opciones de respuesta (choices)
  trackByChoice(index: number, choice: string): any {
    return index;
  }

  // Función trackBy para candidatos
  trackByCandidate(index: number, candidate: any): any {
    return index;
  }

  // Método para actualizar opción sin perder el foco
  updateChoice(question: Question, index: number, value: string): void {
    if (question.options?.choices && question.options.choices[index] !== undefined) {
      question.options.choices[index] = value;
    }
  }

  // Método para agregar una nueva opción y enfocar el input
  addChoice(question: Question): void {
    if (!question.options) {
      question.options = { choices: [] };
    }
    if (!question.options.choices) {
      question.options.choices = [];
    }
    
    // Agregar opción vacía para que solo muestre el placeholder
    question.options.choices.push('');
    const newIndex = question.options.choices.length - 1;
    this.lastAddedChoiceInfo = { questionId: question.id, index: newIndex };
    
    setTimeout(() => {
      if (this.lastAddedChoiceInfo) {
        const questionElement = document.querySelector(`[data-question-id="${this.lastAddedChoiceInfo.questionId}"]`);
        if (questionElement) {
          const inputs = questionElement.querySelectorAll('input[type="text"][placeholder*="Opción"]');
          if (inputs.length > this.lastAddedChoiceInfo.index) {
            const targetInput = inputs[this.lastAddedChoiceInfo.index] as HTMLInputElement;
            if (targetInput) {
              targetInput.focus();
            }
          }
        }
        this.lastAddedChoiceInfo = null;
      }
    }, 10);
  }
}

