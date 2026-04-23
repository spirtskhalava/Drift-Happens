import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SegmentService } from '../../services/segment.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  segments: any[] = [];
  selectedSegment: any = null;
  members: any[] = [];
  message: string = '';
  delta: { added: number; removed: number; evaluatedAt: Date } | null = null;

  constructor(private segmentService: SegmentService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.refreshSegments();
  }

  refreshSegments() {
    this.segmentService.getSegments().subscribe(data => {
      this.segments = data;
      this.cdr.detectChanges();
    });
  }

  selectSegment(segment: any) {
    this.selectedSegment = segment;
    this.delta = null;
    this.segmentService.getMembers(segment.id).subscribe({
      next: data => {
        this.members = data;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('getMembers failed:', err);
        this.members = [];
        this.cdr.detectChanges();
      }
    });
    this.segmentService.getDelta(segment.id).subscribe({
      next: data => {
        this.delta = data;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  onEvaluate(segment: any) {
    if (!this.selectedSegment || this.selectedSegment.id !== segment.id) {
      this.selectSegment(segment);
    }
    this.segmentService.evaluate(segment.id).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.message = '';
          this.selectSegment(segment);
        }, 5500);
      },
      error: err => console.error('evaluate failed:', err)
    });
  }

  simulateTransaction() {
    this.segmentService.simulateTransaction('sim-id-123', 6000).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Simulation failed:', err);
        this.message = 'Error: Could not reach backend';
        this.cdr.detectChanges();
      }
    });
  }
}
