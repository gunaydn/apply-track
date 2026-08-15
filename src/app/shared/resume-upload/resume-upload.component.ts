import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-resume-upload',
  templateUrl: './resume-upload.component.html',
})
export class ResumeUploadComponent {
  @Input() isUploading = false;

  @Output() fileSelected = new EventEmitter<File | null>();

  selectedFile: File | null = null;
  error = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.error = '';
    this.selectedFile = null;
    this.fileSelected.emit(null);

    if (!file) {
      return;
    }

    const isPdf =
      file.type === 'application/pdf' &&
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      this.error = 'Only PDF files are allowed.';
      input.value = '';
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      this.error = 'The PDF file must be smaller than 5 MB.';
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.fileSelected.emit(file);
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.error = '';
    this.fileSelected.emit(null);

    const input = document.getElementById(
      'resume-upload-input'
    ) as HTMLInputElement | null;

    if (input) {
      input.value = '';
    }
  }
}
