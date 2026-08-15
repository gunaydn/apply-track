import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';

import * as pdfjsLib from 'pdfjs-dist';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

@Component({
  selector: 'app-resume-viewer',
  templateUrl: './resume-viewer.component.html',
})
export class ResumeViewerComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() fileUrl = '';

  @ViewChildren('pdfCanvas')
  canvasElements!: QueryList<ElementRef<HTMLCanvasElement>>;

  pageNumbers: number[] = [];

  isLoading = false;
  error = '';

  private pdfDocument: any = null;

  private resizeObserver?: ResizeObserver;
  private resizeTimeout?: ReturnType<typeof setTimeout>;

  private isRendering = false;
  private renderRequested = false;

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['fileUrl'] && this.fileUrl) {
      await this.loadPdf();
    }
  }

  ngAfterViewInit(): void {
    /*
     * pageNumbers değişip canvas elementleri DOM'a eklendiğinde
     * ilk render burada başlar.
     */
    this.canvasElements.changes.subscribe(() => {
      void this.renderPages();

      this.observeCanvasContainer();
    });

    /*
     * Responsive resize durumlarında PDF'i yeniden render eder.
     * Debounce sayesinde peş peşe render başlamaz.
     */
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.pdfDocument) {
        return;
      }

      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
        void this.renderPages();
      }, 150);
    });

    this.observeCanvasContainer();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    if (this.pdfDocument) {
      void this.pdfDocument.destroy();
      this.pdfDocument = null;
    }
  }

  private observeCanvasContainer(): void {
    if (!this.resizeObserver) {
      return;
    }

    this.resizeObserver.disconnect();

    const firstCanvas = this.canvasElements?.first?.nativeElement;

    const container = firstCanvas?.parentElement;

    if (container) {
      this.resizeObserver.observe(container);
    }
  }

  private async loadPdf(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    this.pageNumbers = [];

    try {
      /*
       * Önceden açık PDF varsa temizle.
       */
      if (this.pdfDocument) {
        await this.pdfDocument.destroy();
        this.pdfDocument = null;
      }

      const loadingTask = pdfjsLib.getDocument({
        url: this.fileUrl,
      });

      this.pdfDocument = await loadingTask.promise;

      this.pageNumbers = Array.from(
        {
          length: this.pdfDocument.numPages,
        },
        (_, index) => index + 1
      );

      this.isLoading = false;

      /*
       * Burada renderPages çağırmıyoruz.
       *
       * pageNumbers değişince canvas DOM'a gelecek ve
       * canvasElements.changes ilk render'ı başlatacak.
       */
    } catch (error) {
      console.error('PDF loading error:', error);

      this.isLoading = false;
      this.error = 'CV could not be displayed.';
    }
  }

  private async renderPages(): Promise<void> {
    if (!this.pdfDocument || !this.canvasElements?.length) {
      return;
    }

    /*
     * Halihazırda render varsa ikinci bir render başlatma.
     * Sadece render bittikten sonra tekrar yapılması gerektiğini işaretle.
     */
    if (this.isRendering) {
      this.renderRequested = true;
      return;
    }

    this.isRendering = true;
    this.renderRequested = false;

    try {
      const canvases = this.canvasElements.toArray();

      for (let index = 0; index < canvases.length; index++) {
        const pageNumber = index + 1;

        const canvas = canvases[index].nativeElement;

        const page = await this.pdfDocument.getPage(pageNumber);

        const baseViewport = page.getViewport({
          scale: 1,
        });

        const container = canvas.parentElement;

        if (!container) {
          continue;
        }

        const containerWidth = container.clientWidth;

        if (!containerWidth) {
          continue;
        }

        const scale = containerWidth / baseViewport.width;

        const viewport = page.getViewport({
          scale,
        });

        const pixelRatio = window.devicePixelRatio || 1;

        /*
         * Canvas'ın gerçek pixel çözünürlüğü.
         * Retina / yüksek DPI ekranlarda bulanıklığı engeller.
         */
        canvas.width = Math.floor(viewport.width * pixelRatio);

        canvas.height = Math.floor(viewport.height * pixelRatio);

        /*
         * Görsel boyutu CSS kontrol ediyor.
         *
         * Mobile:
         * width: 100%
         *
         * Desktop:
         * parent max-width tarafından sınırlandırılır.
         */
        canvas.style.width = '100%';
        canvas.style.height = 'auto';

        const context = canvas.getContext('2d');

        if (!context) {
          continue;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: context,
          viewport,
          transform:
            pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined,
        });

        /*
         * Bu işlem bitmeden for döngüsü sonraki sayfaya geçmez.
         * Aynı canvas'a ikinci render da başlayamaz.
         */
        await renderTask.promise;
      }
    } catch (error) {
      console.error('PDF render error:', error);
    } finally {
      this.isRendering = false;

      /*
       * Render devam ederken resize tetiklendiyse
       * sadece bir kez daha render et.
       */
      if (this.renderRequested) {
        this.renderRequested = false;

        this.resizeTimeout = setTimeout(() => {
          void this.renderPages();
        }, 50);
      }
    }
  }
}
