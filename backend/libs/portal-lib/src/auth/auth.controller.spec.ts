import { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { FrameModule } from '../frame.module';
import { AuthCallback } from './authCallback';
import { AUTH_CALLBACK_INJECTION_TOKEN } from '../injectionTokens';
import { IasService } from './ias.service';
import { HttpException } from '@nestjs/common';
import { KubeConfigProvider } from '../k8s/kubeconfig-provider';
import { KubeConfig } from '@kubernetes/client-node';

describe('AuthController', () => {
  let controller: AuthController;
  let authCallback: AuthCallback;
  let requestMock: Request;
  let responseMock: Response;
  let iasServiceMock: IasService;

  beforeEach(async () => {
    iasServiceMock = mock<IasService>();
    const module: TestingModule = await Test.createTestingModule({
      imports: [FrameModule.create({})],
    })
      .overrideProvider(IasService)
      .useValue(iasServiceMock)
      .overrideProvider(KubeConfigProvider)
      .useValue({
        getKubeConfig: function () {
          return mock<KubeConfig>();
        },
      })
      .compile();
    controller = module.get<AuthController>(AuthController);
    authCallback = module.get<AuthCallback>(AUTH_CALLBACK_INJECTION_TOKEN);
    requestMock = mock<Request>();
    responseMock = mock<Response>();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get the config for tenant', async () => {
    // arrange
    const callback = jest.spyOn(authCallback, 'callback');
    const getTokenForCode = jest.spyOn(iasServiceMock, 'exchangeTokenForCode');
    requestMock.query = { code: 'foo' };
    const idToken = 'id_token';
    getTokenForCode.mockResolvedValue({
      id_token: idToken,
      refresh_token: 'ref',
      expires_in: '12312',
      access_token: 'access',
    });

    // act
    const iasResponse = await controller.auth(requestMock, responseMock);

    // assert
    expect(callback).toHaveBeenCalledWith(idToken);
    expect(getTokenForCode).toHaveBeenCalledWith(
      requestMock,
      responseMock,
      'foo'
    );
    expect(iasResponse.refresh_token).toBeUndefined();
  });

  it('should return a bad request when there was no code provided', async () => {
    // arrange
    const callback = jest.spyOn(authCallback, 'callback');
    const getTokenForCode = jest.spyOn(iasServiceMock, 'exchangeTokenForCode');
    requestMock.query = {};

    // act
    const response = controller.auth(requestMock, responseMock);

    // assert
    await expect(response).rejects.toThrow(HttpException);
    await expect(response).rejects.toThrow(
      "no 'code' was provided in the query"
    );
    expect(callback).not.toHaveBeenCalledWith(requestMock);
    expect(getTokenForCode).not.toHaveBeenCalledWith(
      requestMock,
      responseMock,
      'foo'
    );
  });

  it('should refresh the token', async () => {
    // arrange
    const exchangeTokenForRefreshToken = jest.spyOn(
      iasServiceMock,
      'exchangeTokenForRefreshToken'
    );
    const getAuthCookie = jest.spyOn(iasServiceMock, 'getAuthCookie');
    getAuthCookie.mockReturnValue('authCookie');
    const callback = jest.spyOn(authCallback, 'callback');
    const idToken = 'id_token';
    exchangeTokenForRefreshToken.mockResolvedValue({
      id_token: idToken,
      refresh_token: 'ref',
      expires_in: '12312',
      access_token: 'access',
    });

    // act
    const iasResponse = await controller.refresh(requestMock, responseMock);

    // assert
    expect(callback).toHaveBeenCalledWith(idToken);
    expect(exchangeTokenForRefreshToken).toHaveBeenCalledWith(
      requestMock,
      responseMock,
      'authCookie'
    );
    expect(iasResponse.refresh_token).toBeUndefined();
  });

  it('should return a bad request when there was no auth cookie provided', async () => {
    // arrange
    const exchangeTokenForRefreshToken = jest.spyOn(
      iasServiceMock,
      'exchangeTokenForRefreshToken'
    );
    const getAuthCookie = jest.spyOn(iasServiceMock, 'getAuthCookie');
    getAuthCookie.mockReturnValue(undefined);
    const callback = jest.spyOn(authCallback, 'callback');

    // act
    const response = controller.refresh(requestMock, responseMock);

    // assert
    await expect(response).rejects.toThrow(HttpException);
    await expect(response).rejects.toThrow('the user is not logged in');
    expect(callback).not.toHaveBeenCalledWith(requestMock);
    expect(exchangeTokenForRefreshToken).not.toHaveBeenCalled();
  });

  it('should remove the auth cookies on ias error', async () => {
    // arrange
    const exchangeTokenForRefreshToken = jest.spyOn(
      iasServiceMock,
      'exchangeTokenForRefreshToken'
    );
    const removeAuthCookies = jest.spyOn(iasServiceMock, 'removeAuthCookies');
    const getAuthCookie = jest.spyOn(iasServiceMock, 'getAuthCookie');
    getAuthCookie.mockReturnValue('authCookie');
    const callback = jest.spyOn(authCallback, 'callback');
    exchangeTokenForRefreshToken.mockRejectedValue(new Error('error'));

    // act
    const response = controller.refresh(requestMock, responseMock);

    // assert
    await expect(response).rejects.toThrow(Error);
    await expect(response).rejects.toThrow('error');
    expect(callback).not.toHaveBeenCalledWith(requestMock);
    expect(exchangeTokenForRefreshToken).toHaveBeenCalledWith(
      requestMock,
      responseMock,
      'authCookie'
    );
    expect(removeAuthCookies).toHaveBeenCalledWith(responseMock);
  });
});
