/* eslint-disable functional/functional-parameters */
import {
  BAD_REQUEST,
  getStatusText,
  OK,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from 'http-status-codes';

import {
  CreateUrlResponsePayload,
  StatsResponsePayload,
  GetUrlByHashResponsePayload,
} from './handler';

type ResponsePayload =
  | CreateUrlResponsePayload
  | StatsResponsePayload
  | GetUrlByHashResponsePayload;

type Response = {
  readonly statusCode: number;
  readonly headers: { readonly [key: string]: string };
  readonly body: string;
};

export const respondOk = (data: ResponsePayload): Response => ({
  statusCode: OK,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const respondBadRequest = (): Response => ({
  statusCode: BAD_REQUEST,
  headers: { 'Content-Type': 'text/plain' },
  body: getStatusText(BAD_REQUEST),
});

export const respondNotFound = (): Response => ({
  statusCode: NOT_FOUND,
  headers: { 'Content-Type': 'text/plain' },
  body: getStatusText(NOT_FOUND),
});

export const respondInternalError = (): Response => ({
  statusCode: INTERNAL_SERVER_ERROR,
  headers: { 'Content-Type': 'text/plain' },
  body: getStatusText(INTERNAL_SERVER_ERROR),
});
