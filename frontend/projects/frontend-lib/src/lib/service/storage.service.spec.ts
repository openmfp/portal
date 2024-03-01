import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService],
    }).compileComponents();

    service = TestBed.inject(StorageService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should empty dxp storage in local storage', () => {
    const storage = jest.spyOn(localStorage, 'removeItem');

    service.clearDxpStorage();

    expect(storage).toHaveBeenCalledWith('dxp.currentProject');
    expect(storage).toHaveBeenCalledWith('dxp.currentNodes');
    expect(storage).toHaveBeenCalledWith('dxp.projects');
    expect(storage).toHaveBeenCalledWith('dxp.rawNodesConfig');
    expect(storage).toHaveBeenCalledWith('dxp.preloadUrls');
    expect(storage).toHaveBeenCalledWith('dxp.contextSwitcherLabels');
  });

  it('should empty dxp config attributes in local storage', () => {
    const storage = jest.spyOn(localStorage, 'removeItem');

    service.clearDXPConfigStorage();

    expect(storage).toHaveBeenCalledWith('dxp.currentNodes');
    expect(storage).toHaveBeenCalledWith('dxp.projects');
    expect(storage).toHaveBeenCalledWith('dxp.rawNodesConfig');
    expect(storage).toHaveBeenCalledWith('dxp.preloadUrls');
    expect(storage).toHaveBeenCalledWith('dxp.contextSwitcherLabels');
  });
});
