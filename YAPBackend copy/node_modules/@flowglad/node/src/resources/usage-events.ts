// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class UsageEvents extends APIResource {
  /**
   * Create Usage Event
   */
  create(body: UsageEventCreateParams, options?: RequestOptions): APIPromise<UsageEventCreateResponse> {
    return this._client.post('/api/v1/usage-events', { body, ...options });
  }

  /**
   * Get Usage Event
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<UsageEventRetrieveResponse> {
    return this._client.get(path`/api/v1/usage-events/${id}`, options);
  }
}

export interface UsageEventCreateResponse {
  usageEvent: UsageEventCreateResponse.UsageEvent;
}

export namespace UsageEventCreateResponse {
  export interface UsageEvent {
    id: string;

    amount: number;

    /**
     * The billing period the usage belongs to. If the usage occurs in a date that is
     * outside of the current billing period, the usage will still be attached to the
     * current billing peirod.
     */
    billingPeriodId: string | null;

    createdAt: string;

    createdByCommit: string | null;

    customerId: string;

    livemode: boolean;

    priceId: string;

    /**
     * Properties for the usage event. Only required when using the
     * "count_distinct_properties" aggregation type.
     */
    properties: { [key: string]: unknown };

    subscriptionId: string;

    /**
     * A unique identifier for the transaction. This is used to prevent duplicate usage
     * events from being created.
     */
    transactionId: string;

    updatedAt: string | null;

    updatedByCommit: string | null;

    /**
     * The date the usage occurred. If the usage occurs in a date that is outside of
     * the current billing period, the usage will still be attached to the current
     * billing peirod.
     */
    usageDate: string;

    usageMeterId: string;
  }
}

export interface UsageEventRetrieveResponse {
  usageEvent: UsageEventRetrieveResponse.UsageEvent;
}

export namespace UsageEventRetrieveResponse {
  export interface UsageEvent {
    id: string;

    amount: number;

    /**
     * The billing period the usage belongs to. If the usage occurs in a date that is
     * outside of the current billing period, the usage will still be attached to the
     * current billing peirod.
     */
    billingPeriodId: string | null;

    createdAt: string;

    createdByCommit: string | null;

    customerId: string;

    livemode: boolean;

    priceId: string;

    /**
     * Properties for the usage event. Only required when using the
     * "count_distinct_properties" aggregation type.
     */
    properties: { [key: string]: unknown };

    subscriptionId: string;

    /**
     * A unique identifier for the transaction. This is used to prevent duplicate usage
     * events from being created.
     */
    transactionId: string;

    updatedAt: string | null;

    updatedByCommit: string | null;

    /**
     * The date the usage occurred. If the usage occurs in a date that is outside of
     * the current billing period, the usage will still be attached to the current
     * billing peirod.
     */
    usageDate: string;

    usageMeterId: string;
  }
}

export interface UsageEventCreateParams {
  usageEvent: UsageEventCreateParams.UsageEvent;
}

export namespace UsageEventCreateParams {
  export interface UsageEvent {
    amount: number;

    priceId: string;

    subscriptionId: string;

    /**
     * A unique identifier for the transaction. This is used to prevent duplicate usage
     * events from being created.
     */
    transactionId: string;

    /**
     * Properties for the usage event. Only required when using the
     * "count_distinct_properties" aggregation type.
     */
    properties?: { [key: string]: unknown } | null;

    /**
     * The date the usage occurred in unix epoch milliseconds. If not provided, the
     * current timestamp will be used.
     */
    usageDate?: number;
  }
}

export declare namespace UsageEvents {
  export {
    type UsageEventCreateResponse as UsageEventCreateResponse,
    type UsageEventRetrieveResponse as UsageEventRetrieveResponse,
    type UsageEventCreateParams as UsageEventCreateParams,
  };
}
