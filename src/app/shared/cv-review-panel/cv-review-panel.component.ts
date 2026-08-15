import { Component, Input } from '@angular/core';
import {
  ResumeAnalysis,
  ResumeAnalysisRecommendation,
  ResumeIssueSeverity,
} from 'src/app/services/resume.service';

@Component({
  selector: 'app-cv-review-panel',
  templateUrl: './cv-review-panel.component.html',
})
export class CvReviewPanelComponent {
  @Input() analysis: ResumeAnalysis | null = null;
  @Input() isAnalyzing = false;
  @Input() errorMessage = '';

  get sortedRecommendations(): ResumeAnalysisRecommendation[] {
    if (!this.analysis?.recommendations?.length) {
      return [];
    }

    return [...this.analysis.recommendations].sort(
      (left, right) => left.priority - right.priority
    );
  }

  severityLabel(severity: ResumeIssueSeverity): string {
    switch (severity) {
      case 'critical':
        return 'Critical';
      case 'important':
        return 'Important';
      case 'nice_to_have':
        return 'Nice to have';
      default:
        return severity;
    }
  }

  severityBadgeClass(severity: ResumeIssueSeverity): string {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 text-red-700 ring-red-100';
      case 'important':
        return 'bg-amber-50 text-amber-700 ring-amber-100';
      case 'nice_to_have':
        return 'bg-slate-100 text-slate-600 ring-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 ring-slate-200';
    }
  }
}
