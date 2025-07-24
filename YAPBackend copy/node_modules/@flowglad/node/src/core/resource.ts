// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { Flowglad } from '../client';

export abstract class APIResource {
  protected _client: Flowglad;

  constructor(client: Flowglad) {
    this._client = client;
  }
}
