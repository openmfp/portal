import { CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing'; // 1
import { FrameComponent } from './frame.component';
import { LuigiComponent } from './luigi/luigi.component';

describe('FrameComponent', () => {
  let fixture;
  let frame: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        FrameComponent,
        LuigiComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(FrameComponent, {
        add: { encapsulation: ViewEncapsulation.None },
      })
      .compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(FrameComponent);
    frame = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });
  it('should create the frame', () => {
    expect(frame).toBeTruthy();
  });
});
