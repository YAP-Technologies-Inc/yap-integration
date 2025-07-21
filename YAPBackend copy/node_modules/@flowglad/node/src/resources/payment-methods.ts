// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class PaymentMethods extends APIResource {
  /**
   * Get Payment Method
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<PaymentMethodRetrieveResponse> {
    return this._client.get(path`/api/v1/payment-methods/${id}`, options);
  }

  /**
   * List Payment Methods
   */
  list(
    query: PaymentMethodListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PaymentMethodListResponse> {
    return this._client.get('/api/v1/payment-methods', { query, ...options });
  }
}

export interface PaymentMethodRetrieveResponse {
  paymentMethod: PaymentMethodRetrieveResponse.PaymentMethod;
}

export namespace PaymentMethodRetrieveResponse {
  export interface PaymentMethod {
    id: string;

    billingDetails: PaymentMethod.BillingDetails;

    createdAt: string;

    createdByCommit: string | null;

    customerId: string;

    default: boolean;

    livemode: boolean;

    metadata: { [key: string]: unknown } | null;

    paymentMethodData: { [key: string]: unknown };

    type: 'card' | 'us_bank_account' | 'sepa_debit';

    updatedAt: string | null;

    updatedByCommit: string | null;
  }

  export namespace PaymentMethod {
    export interface BillingDetails {
      address: BillingDetails.Address;

      email: string | null;

      name: string | null;
    }

    export namespace BillingDetails {
      export interface Address {
        city: string | null;

        country: string;

        line1: string | null;

        line2: string | null;

        postal_code: string | null;

        state: string | null;

        address?: Address.Address | null;

        name?: string;
      }

      export namespace Address {
        export interface Address {
          city: string | null;

          country: string;

          line1: string | null;

          line2: string | null;

          postal_code: string | null;

          state: string | null;

          name?: string;
        }
      }
    }
  }
}

export interface PaymentMethodListResponse {
  data: Array<PaymentMethodListResponse.Data>;

  hasMore: boolean;

  total: number;

  currentCursor?: string;

  nextCursor?: string;
}

export namespace PaymentMethodListResponse {
  export interface Data {
    id: string;

    billingDetails: Data.BillingDetails;

    createdAt: string;

    createdByCommit: string | null;

    customerId: string;

    default: boolean;

    livemode: boolean;

    metadata: { [key: string]: unknown } | null;

    paymentMethodData: { [key: string]: unknown };

    type: 'card' | 'us_bank_account' | 'sepa_debit';

    updatedAt: string | null;

    updatedByCommit: string | null;
  }

  export namespace Data {
    export interface BillingDetails {
      address: BillingDetails.Address;

      email: string | null;

      name: string | null;
    }

    export namespace BillingDetails {
      export interface Address {
        city: string | null;

        country: string;

        line1: string | null;

        line2: string | null;

        postal_code: string | null;

        state: string | null;

        address?: Address.Address | null;

        name?: string;
      }

      export namespace Address {
        export interface Address {
          city: string | null;

          country: string;

          line1: string | null;

          line2: string | null;

          postal_code: string | null;

          state: string | null;

          name?: string;
        }
      }
    }
  }
}

export interface PaymentMethodListParams {
  cursor?: string;

  limit?: number;
}

export declare namespace PaymentMethods {
  export {
    type PaymentMethodRetrieveResponse as PaymentMethodRetrieveResponse,
    type PaymentMethodListResponse as PaymentMethodListResponse,
    type PaymentMethodListParams as PaymentMethodListParams,
  };
}
