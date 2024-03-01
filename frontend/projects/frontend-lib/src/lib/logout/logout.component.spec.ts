import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LuigiCoreService } from '../service/luigiCore.service';
import { LogoutComponent } from './logout.component';
import { I18nService } from '../service/i18n.service';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LogoutComponent],
      imports: [RouterTestingModule.withRoutes([], {})],
      providers: [LuigiCoreService, I18nService],
    }).compileComponents();
  });

  beforeEach(() => {
    const luigiCoreService = TestBed.inject(LuigiCoreService);
    const i18nService = TestBed.inject(I18nService);
    jest
      .spyOn(luigiCoreService, 'ux')
      .mockReturnValue({ hideAppLoadingIndicator: () => {} });
    jest.spyOn(luigiCoreService, 'i18n').mockReturnValue({
      getCurrentLocale: () => {
        return '';
      },
    });
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
