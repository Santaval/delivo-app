import { AxiosError } from "axios";
import BaseApiService from "../config/BaseApiService";

interface ApiErrorResponse {
  message: string;
}

export default class AuthService extends BaseApiService {
  /**
   * Logs in a user using their Google account.
   *
   * @param token - The Google authentication token.
   * @returns A promise that resolves to a `User` object upon successful login.
   * @throws An error if the login request fails, with the error message from the API response.
   */
  static async googleAuth(
    token: string,
  ): Promise<{ token: string; user: User }> {
    try {
      const { data } = await this.post<{ token: string; user: User }>(
        `/auth/google`,
        {
          token,
        },
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message);
    }
  }

  /**
   * Logs in a user using their Apple account.
   *
   * @param token - The Apple authentication token.
   * @returns A promise that resolves to a `User` object upon successful login.
   * @throws An error if the login request fails, with the error message from the API response.
   */
  static async appleAuth(
    token: string,
  ): Promise<{ token: string; user: User }> {
    try {
      const { data } = await this.post<{ token: string; user: User }>(
        `/auth/apple`,
        {
          identityToken: token,
        },
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message);
    }
  }

  /**
   * Logs in a user using QA credentials.
   *
   * @param username - The QA username.
   * @param password - The QA password.
   * @returns A promise that resolves to a `User` object upon successful login.
   * @throws An error if the login request fails, with the error message from the API response.
   */
  static async qaLogin(
    username: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    try {
      const { data } = await this.post<{ token: string; user: User }>(
        `/auth/qa`,
        {
          email: username,
          password,
        },
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message);
    }
  }

  /**
   * Retrieves the currently authenticated user's information.
   *
   * @returns A promise that resolves to a `User` object containing the user's details.
   * @throws An error if the request fails, with the error message from the API response.
   */

  static async getUser(): Promise<User> {
    try {
      const { data } = await this.get<User>(`/auth/me`);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message);
    }
  }

  /**
   * Permanently deletes the currently authenticated user's account.
   *
   * @returns A promise that resolves when the account has been deleted.
   * @throws An error if the request fails, with the error message from the API response.
   */
  static async deleteAccount(): Promise<void> {
    try {
      await this.delete<void>(`/me`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message);
    }
  }
}
