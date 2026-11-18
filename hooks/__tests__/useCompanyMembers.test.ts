import useCompanyMembers from '@/hooks/useCompanyMembers';
import CompaniesService from '@/services/companies/Companies.service';
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/services/companies/Companies.service');
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));
jest.mock('@/context/CompaniesContext', () => ({
  useCompanies: () => ({ activeCompany: { id: 'company-1' } }),
}));

const mockedCompanies = CompaniesService as jest.Mocked<typeof CompaniesService>;

const member = (userId: string, role: CompanyRole): CompanyMember => ({
  userId,
  name: 'N',
  surnames: 'S',
  email: `${userId}@x.com`,
  role,
});

describe('useCompanyMembers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deriva el rol del usuario actual de la lista de miembros', async () => {
    mockedCompanies.listMembers.mockResolvedValueOnce([member('user-1', 'DEALER'), member('user-2', 'OWNER')]);

    const { result } = renderHook(() => useCompanyMembers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedCompanies.listMembers).toHaveBeenCalledWith('company-1');
    expect(result.current.myRole).toBe('DEALER');
    expect(result.current.canManageRoutes).toBe(false);
    expect(result.current.members).toHaveLength(2);
  });

  it('OWNER y ADMIN pueden gestionar rutas', async () => {
    mockedCompanies.listMembers.mockResolvedValueOnce([member('user-1', 'ADMIN')]);

    const { result } = renderHook(() => useCompanyMembers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.canManageRoutes).toBe(true);
  });

  it('sin rol conocido (falla la carga) no concede permisos de gestión', async () => {
    mockedCompanies.listMembers.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useCompanyMembers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.myRole).toBeUndefined();
    expect(result.current.canManageRoutes).toBe(false);
  });
});
