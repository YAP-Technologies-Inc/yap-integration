// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class InvoiceLineItems extends APIResource {
  /**
   * Get Invoice Line Item
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<InvoiceLineItemRetrieveResponse> {
    return this._client.get(path`/api/v1/invoice-line-items/${id}`, options);
  }

  /**
   * List Invoice Line Items
   */
  list(
    query: InvoiceLineItemListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<InvoiceLineItemListResponse> {
    return this._client.get('/api/v1/invoice-line-items', { query, ...options });
  }
}

/**
 * A static invoice line item, representing a fixed fee component of an invoice.
 */
export type InvoiceLineItemRetrieveResponse =
  | InvoiceLineItemRetrieveResponse.StaticInvoiceLineItem
  | InvoiceLineItemRetrieveResponse.UsageInvoiceLineItem;

export namespace InvoiceLineItemRetrieveResponse {
  /**
   * A static invoice line item, representing a fixed fee component of an invoice.
   */
  export interface StaticInvoiceLineItem {
    id: string;

    createdAt: string;

    createdByCommit: string | null;

    description: string | null;

    invoiceId: string;

    livemode: boolean;

    price: number;

    priceId: string | null;

    /**
     * safeZodPositiveInteger
     */
    quantity: number;

    type: 'static';

    updatedAt: string | null;

    updatedByCommit: string | null;
  }

  /**
   * A usage-based invoice line item, where charges are based on recorded usage
   * events.
   */
  export interface UsageInvoiceLineItem {
    id: string;

    createdAt: string;

    createdByCommit: string | null;

    description: string | null;

    invoiceId: string;

    livemode: boolean;

    price: number;

    priceId: string | null;

    /**
     * safeZodPositiveInteger
     */
    quantity: number;

    type: 'usage';

    updatedAt: string | null;

    updatedByCommit: string | null;
  }
}

export interface InvoiceLineItemListResponse {
  data: Array<
    InvoiceLineItemListResponse.StaticInvoiceLineItem | InvoiceLineItemListResponse.UsageInvoiceLineItem
  >;

  hasMore: boolean;

  total: number;

  currentCursor?: string;

  nextCursor?: string;
}

export namespace InvoiceLineItemListResponse {
  /**
   * A static invoice line item, representing a fixed fee component of an invoice.
   */
  export interface StaticInvoiceLineItem {
    id: string;

    createdAt: string;

    createdByCommit: string | null;

    description: string | null;

    invoiceId: string;

    livemode: boolean;

    price: number;

    priceId: string | null;

    /**
     * safeZodPositiveInteger
     */
    quantity: number;

    type: 'static';

    updatedAt: string | null;

    updatedByCommit: string | null;
  }

  /**
   * A usage-based invoice line item, where charges are based on recorded usage
   * events.
   */
  export interface UsageInvoiceLineItem {
    id: string;

    createdAt: string;

    createdByCommit: string | null;

    description: string | null;

    invoiceId: string;

    livemode: boolean;

    price: number;

    priceId: string | null;

    /**
     * safeZodPositiveInteger
     */
    quantity: number;

    type: 'usage';

    updatedAt: string | null;

    updatedByCommit: string | null;
  }
}

export interface InvoiceLineItemListParams {
  cursor?: string;

  limit?: number;
}

export declare namespace InvoiceLineItems {
  export {
    type InvoiceLineItemRetrieveResponse as InvoiceLineItemRetrieveResponse,
    type InvoiceLineItemListResponse as InvoiceLineItemListResponse,
    type InvoiceLineItemListParams as InvoiceLineItemListParams,
  };
}
