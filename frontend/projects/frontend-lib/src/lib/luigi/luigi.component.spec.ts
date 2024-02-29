import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LuigiconfigService } from '../service/luigiConfig/luigiconfig.service';
import { LuigiComponent } from './luigi.component';
import { MockProvider } from 'ng-mocks';

describe('LuigiComponent', () => {
  let component: LuigiComponent;
  let fixture: ComponentFixture<LuigiComponent>;
  let luigiconfigService: LuigiconfigService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LuigiComponent],
      providers: [
        MockProvider(LuigiconfigService, {
          setLuigiConfiguration: jest.fn().mockReturnValue(Promise.resolve()),
        }),
      ],
      imports: [],
    }).compileComponents();

    luigiconfigService = TestBed.inject(LuigiconfigService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LuigiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invoke buildConfig', () => {
    expect(luigiconfigService.setLuigiConfiguration).toHaveBeenCalled();
  });
});
