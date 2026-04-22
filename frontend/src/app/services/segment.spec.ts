import { TestBed } from '@angular/core/testing';

import { Segment } from './segment';

describe('Segment', () => {
  let service: Segment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Segment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
