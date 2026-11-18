const mockPurchases = {
  configure: jest.fn(),
  setLogLevel: jest.fn(),
  logIn: jest.fn(),
  getAppUserID: jest.fn(),
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
};
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: mockPurchases,
  LOG_LEVEL: { DEBUG: 'DEBUG' },
}));
jest.mock('@/config/env', () => ({
  __esModule: true,
  default: { revenueCatIosKey: 'ios-key', revenueCatAndroidKey: 'android-key', isDevelopment: false },
}));

const load = () => {
  let svc!: typeof import('@/services/purchases/RevenueCat.service').default;
  jest.isolateModules(() => {
    svc = require('@/services/purchases/RevenueCat.service').default;
  });
  return svc;
};

describe('RevenueCatService', () => {
  let service: ReturnType<typeof load>;
  let appUserId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    service = load();
    appUserId = '';
    mockPurchases.getAppUserID.mockImplementation(async () => appUserId);
    mockPurchases.logIn.mockImplementation(async (id: string) => {
      appUserId = id;
    });
    mockPurchases.configure.mockImplementation(({ appUserID }: any) => {
      appUserId = appUserID;
    });
  });

  it('first identify configures with the appUserID and never logs in', async () => {
    await service.identify('a');
    expect(mockPurchases.configure).toHaveBeenCalledTimes(1);
    expect(mockPurchases.configure).toHaveBeenCalledWith(expect.objectContaining({ appUserID: 'a' }));
    expect(mockPurchases.logIn).not.toHaveBeenCalled();
    expect(service.isConfigured()).toBe(true);
  });

  it('identify with another id logs in; same id is a no-op', async () => {
    await service.identify('a');
    await service.identify('a');
    expect(mockPurchases.logIn).not.toHaveBeenCalled();
    await service.identify('b');
    expect(mockPurchases.logIn).toHaveBeenCalledTimes(1);
    expect(mockPurchases.logIn).toHaveBeenCalledWith('b');
    expect(mockPurchases.configure).toHaveBeenCalledTimes(1);
  });

  it('never configures without an appUserID and has no logOut', async () => {
    await service.identify('a');
    await service.identify('b');
    for (const [arg] of mockPurchases.configure.mock.calls) {
      expect(arg.appUserID).toBeTruthy();
    }
    expect((service as any).logOut).toBeUndefined();
    expect((mockPurchases as any).logOut).toBeUndefined();
  });

  it('currentAppUserId is null before configure, then the SDK id', async () => {
    expect(await service.currentAppUserId()).toBeNull();
    expect(mockPurchases.getAppUserID).not.toHaveBeenCalled();
    await service.identify('a');
    expect(await service.currentAppUserId()).toBe('a');
  });

  it('refuses offerings and purchases before configure', async () => {
    await expect(service.getCreditsOffering()).rejects.toThrow(/not configured/);
    await expect(service.purchasePackage({} as any)).rejects.toThrow(/not configured/);
    expect(mockPurchases.getOfferings).not.toHaveBeenCalled();
    expect(mockPurchases.purchasePackage).not.toHaveBeenCalled();
  });

  it('fetches the credits offering by identifier once configured', async () => {
    mockPurchases.getOfferings.mockResolvedValue({ all: { delivo_credits: { id: 'x' } } });
    await service.identify('a');
    expect(await service.getCreditsOffering()).toEqual({ id: 'x' });
  });
});
