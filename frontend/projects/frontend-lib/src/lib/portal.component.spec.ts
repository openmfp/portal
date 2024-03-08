import { CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing'; // 1
import { PortalComponent } from './portal.component';
import { LuigiComponent } from './luigi/luigi.component';

describe('PortalComponent', () => {
  let fixture;
  let portal: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        PortalComponent,
        LuigiComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(PortalComponent, {
        add: { encapsulation: ViewEncapsulation.None },
      })
      .compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(PortalComponent);
    portal = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });
  it('should create the portal', () => {
    expect(portal).toBeTruthy();
  });
});
