// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Catalogs extends APIResource {
  /**
   * Create Catalog
   */
  create(body: CatalogCreateParams, options?: RequestOptions): APIPromise<CatalogCreateResponse> {
    return this._client.post('/api/v1/catalogs', { body, ...options });
  }

  /**
   * Get Catalog
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<CatalogRetrieveResponse> {
    return this._client.get(path`/api/v1/catalogs/${id}`, options);
  }

  /**
   * Update Catalog
   */
  update(id: string, body: CatalogUpdateParams, options?: RequestOptions): APIPromise<CatalogUpdateResponse> {
    return this._client.put(path`/api/v1/catalogs/${id}`, { body, ...options });
  }

  /**
   * List Catalogs
   */
  list(
    query: CatalogListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<CatalogListResponse> {
    return this._client.get('/api/v1/catalogs', { query, ...options });
  }

  /**
   * Clone a Catalog
   */
  clone(id: string, body: CatalogCloneParams, options?: RequestOptions): APIPromise<CatalogCloneResponse> {
    return this._client.post(path`/api/v1/catalogs/${id}/clone`, { body, ...options });
  }

  /**
   * Get Default Catalog for Organization
   */
  retrieveDefault(options?: RequestOptions): APIPromise<CatalogRetrieveDefaultResponse> {
    return this._client.get('/api/v1/catalogs/default', options);
  }
}

export interface CatalogCreateResponse {
  catalog: CatalogCreateResponse.Catalog;
}

export namespace CatalogCreateResponse {
  export interface Catalog {
    id: string;

    /**
     * safeZodDate
     */
    createdAt: (string & {}) | string;

    createdByCommit: string | null;

    isDefault: boolean;

    livemode: boolean;

    name: string;

    organizationId: string;

    /**
     * safeZodDate
     */
    updatedAt: (string & {}) | string | null;

    updatedByCommit: string | null;
  }
}

export interface CatalogRetrieveResponse {
  catalog: CatalogRetrieveResponse.Catalog;
}

export namespace CatalogRetrieveResponse {
  export interface Catalog {
    id: string;

    /**
     * safeZodDate
     */
    createdAt: (string & {}) | string;

    createdByCommit: string | null;

    isDefault: boolean;

    livemode: boolean;

    name: string;

    organizationId: string;

    products: Array<Catalog.Product>;

    /**
     * safeZodDate
     */
    updatedAt: (string & {}) | string | null;

    updatedByCommit: string | null;

    usageMeters: Array<Catalog.UsageMeter>;

    /**
     * The default product for the catalog. If no product is explicitly set as default,
     * will return undefined.
     */
    defaultProduct?: Catalog.DefaultProduct;
  }

  export namespace Catalog {
    export interface Product {
      id: string;

      active: boolean;

      catalogId: string;

      /**
       * safeZodDate
       */
      createdAt: (string & {}) | string;

      createdByCommit: string | null;

      default: boolean;

      /**
       * The default price for the product. If no price is explicitly set as default,
       * will return the first price created for the product..
       */
      defaultPrice: Product.SubscriptionPrice | Product.SinglePaymentPrice | Product.UsagePrice;

      description: string | null;

      displayFeatures: Array<Product.DisplayFeature> | null;

      imageURL: string | null;

      livemode: boolean;

      name: string;

      organizationId: string;

      pluralQuantityLabel: string | null;

      prices: Array<Product.SubscriptionPrice | Product.SinglePaymentPrice | Product.UsagePrice>;

      singularQuantityLabel: string | null;

      slug: string | null;

      /**
       * safeZodDate
       */
      updatedAt: (string & {}) | string;

      updatedByCommit: string | null;
    }

    export namespace Product {
      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        /**
         * safeZodPositiveInteger
         */
        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        /**
         * safeZodPositiveInteger
         */
        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        /**
         * safeZodPositiveInteger
         */
        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }

      export interface DisplayFeature {
        enabled: boolean;

        label: string;

        details?: string | null;
      }

      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }
    }

    export interface UsageMeter {
      id: string;

      /**
       * The type of aggregation to perform on the usage meter. Defaults to "sum", which
       * aggregates all the usage event amounts for the billing period.
       * "count_distinct_properties" counts the number of distinct properties in the
       * billing period for a given meter.
       */
      aggregationType: 'sum' | 'count_distinct_properties';

      catalogId: string;

      createdAt: string;

      createdByCommit: string | null;

      livemode: boolean;

      name: string;

      organizationId: string;

      slug: string;

      updatedAt: string | null;

      updatedByCommit: string | null;
    }

    /**
     * The default product for the catalog. If no product is explicitly set as default,
     * will return undefined.
     */
    export interface DefaultProduct {
      id: string;

      active: boolean;

      catalogId: string;

      /**
       * safeZodDate
       */
      createdAt: (string & {}) | string;

      createdByCommit: string | null;

      default: boolean;

      /**
       * The default price for the product. If no price is explicitly set as default,
       * will return the first price created for the product..
       */
      defaultPrice:
        | DefaultProduct.SubscriptionPrice
        | DefaultProduct.SinglePaymentPrice
        | DefaultProduct.UsagePrice;

      description: string | null;

      displayFeatures: Array<DefaultProduct.DisplayFeature> | null;

      imageURL: string | null;

      livemode: boolean;

      name: string;

      organizationId: string;

      pluralQuantityLabel: string | null;

      prices: Array<
        DefaultProduct.SubscriptionPrice | DefaultProduct.SinglePaymentPrice | DefaultProduct.UsagePrice
      >;

      singularQuantityLabel: string | null;

      slug: string | null;

      /**
       * safeZodDate
       */
      updatedAt: (string & {}) | string;

      updatedByCommit: string | null;
    }

    export namespace DefaultProduct {
      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }

      export interface DisplayFeature {
        enabled: boolean;

        label: string;

        details?: string | null;
      }

      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }
    }
  }
}

export interface CatalogUpdateResponse {
  catalog: CatalogUpdateResponse.Catalog;
}

export namespace CatalogUpdateResponse {
  export interface Catalog {
    id: string;

    /**
     * safeZodDate
     */
    createdAt: (string & {}) | string;

    createdByCommit: string | null;

    isDefault: boolean;

    livemode: boolean;

    name: string;

    organizationId: string;

    /**
     * safeZodDate
     */
    updatedAt: (string & {}) | string | null;

    updatedByCommit: string | null;
  }
}

export interface CatalogListResponse {
  data: Array<CatalogListResponse.Data>;

  hasMore: boolean;

  total: number;

  currentCursor?: string;

  nextCursor?: string;
}

export namespace CatalogListResponse {
  export interface Data {
    id: string;

    /**
     * safeZodDate
     */
    createdAt: (string & {}) | string;

    createdByCommit: string | null;

    isDefault: boolean;

    livemode: boolean;

    name: string;

    organizationId: string;

    /**
     * safeZodDate
     */
    updatedAt: (string & {}) | string | null;

    updatedByCommit: string | null;
  }
}

export interface CatalogCloneResponse {
  catalog: CatalogCloneResponse.Catalog;
}

export namespace CatalogCloneResponse {
  export interface Catalog {
    id: string;

    /**
     * safeZodDate
     */
    createdAt: (string & {}) | string;

    createdByCommit: string | null;

    isDefault: boolean;

    livemode: boolean;

    name: string;

    organizationId: string;

    products: Array<Catalog.Product>;

    /**
     * safeZodDate
     */
    updatedAt: (string & {}) | string | null;

    updatedByCommit: string | null;

    usageMeters: Array<Catalog.UsageMeter>;

    /**
     * The default product for the catalog. If no product is explicitly set as default,
     * will return undefined.
     */
    defaultProduct?: Catalog.DefaultProduct;
  }

  export namespace Catalog {
    export interface Product {
      id: string;

      active: boolean;

      catalogId: string;

      /**
       * safeZodDate
       */
      createdAt: (string & {}) | string;

      createdByCommit: string | null;

      default: boolean;

      /**
       * The default price for the product. If no price is explicitly set as default,
       * will return the first price created for the product..
       */
      defaultPrice: Product.SubscriptionPrice | Product.SinglePaymentPrice | Product.UsagePrice;

      description: string | null;

      displayFeatures: Array<Product.DisplayFeature> | null;

      imageURL: string | null;

      livemode: boolean;

      name: string;

      organizationId: string;

      pluralQuantityLabel: string | null;

      prices: Array<Product.SubscriptionPrice | Product.SinglePaymentPrice | Product.UsagePrice>;

      singularQuantityLabel: string | null;

      slug: string | null;

      /**
       * safeZodDate
       */
      updatedAt: (string & {}) | string;

      updatedByCommit: string | null;
    }

    export namespace Product {
      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        /**
         * safeZodPositiveInteger
         */
        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        /**
         * safeZodPositiveInteger
         */
        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        /**
         * safeZodPositiveInteger
         */
        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }

      export interface DisplayFeature {
        enabled: boolean;

        label: string;

        details?: string | null;
      }

      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }
    }

    export interface UsageMeter {
      id: string;

      /**
       * The type of aggregation to perform on the usage meter. Defaults to "sum", which
       * aggregates all the usage event amounts for the billing period.
       * "count_distinct_properties" counts the number of distinct properties in the
       * billing period for a given meter.
       */
      aggregationType: 'sum' | 'count_distinct_properties';

      catalogId: string;

      createdAt: string;

      createdByCommit: string | null;

      livemode: boolean;

      name: string;

      organizationId: string;

      slug: string;

      updatedAt: string | null;

      updatedByCommit: string | null;
    }

    /**
     * The default product for the catalog. If no product is explicitly set as default,
     * will return undefined.
     */
    export interface DefaultProduct {
      id: string;

      active: boolean;

      catalogId: string;

      /**
       * safeZodDate
       */
      createdAt: (string & {}) | string;

      createdByCommit: string | null;

      default: boolean;

      /**
       * The default price for the product. If no price is explicitly set as default,
       * will return the first price created for the product..
       */
      defaultPrice:
        | DefaultProduct.SubscriptionPrice
        | DefaultProduct.SinglePaymentPrice
        | DefaultProduct.UsagePrice;

      description: string | null;

      displayFeatures: Array<DefaultProduct.DisplayFeature> | null;

      imageURL: string | null;

      livemode: boolean;

      name: string;

      organizationId: string;

      pluralQuantityLabel: string | null;

      prices: Array<
        DefaultProduct.SubscriptionPrice | DefaultProduct.SinglePaymentPrice | DefaultProduct.UsagePrice
      >;

      singularQuantityLabel: string | null;

      slug: string | null;

      /**
       * safeZodDate
       */
      updatedAt: (string & {}) | string;

      updatedByCommit: string | null;
    }

    export namespace DefaultProduct {
      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }

      export interface DisplayFeature {
        enabled: boolean;

        label: string;

        details?: string | null;
      }

      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }
    }
  }
}

export interface CatalogRetrieveDefaultResponse {
  catalog: CatalogRetrieveDefaultResponse.Catalog;
}

export namespace CatalogRetrieveDefaultResponse {
  export interface Catalog {
    id: string;

    /**
     * safeZodDate
     */
    createdAt: (string & {}) | string;

    createdByCommit: string | null;

    isDefault: boolean;

    livemode: boolean;

    name: string;

    organizationId: string;

    products: Array<Catalog.Product>;

    /**
     * safeZodDate
     */
    updatedAt: (string & {}) | string | null;

    updatedByCommit: string | null;

    usageMeters: Array<Catalog.UsageMeter>;

    /**
     * The default product for the catalog. If no product is explicitly set as default,
     * will return undefined.
     */
    defaultProduct?: Catalog.DefaultProduct;
  }

  export namespace Catalog {
    export interface Product {
      id: string;

      active: boolean;

      catalogId: string;

      /**
       * safeZodDate
       */
      createdAt: (string & {}) | string;

      createdByCommit: string | null;

      default: boolean;

      /**
       * The default price for the product. If no price is explicitly set as default,
       * will return the first price created for the product..
       */
      defaultPrice: Product.SubscriptionPrice | Product.SinglePaymentPrice | Product.UsagePrice;

      description: string | null;

      displayFeatures: Array<Product.DisplayFeature> | null;

      imageURL: string | null;

      livemode: boolean;

      name: string;

      organizationId: string;

      pluralQuantityLabel: string | null;

      prices: Array<Product.SubscriptionPrice | Product.SinglePaymentPrice | Product.UsagePrice>;

      singularQuantityLabel: string | null;

      slug: string | null;

      /**
       * safeZodDate
       */
      updatedAt: (string & {}) | string;

      updatedByCommit: string | null;
    }

    export namespace Product {
      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        /**
         * safeZodPositiveInteger
         */
        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        /**
         * safeZodPositiveInteger
         */
        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        /**
         * safeZodPositiveInteger
         */
        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }

      export interface DisplayFeature {
        enabled: boolean;

        label: string;

        details?: string | null;
      }

      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }
    }

    export interface UsageMeter {
      id: string;

      /**
       * The type of aggregation to perform on the usage meter. Defaults to "sum", which
       * aggregates all the usage event amounts for the billing period.
       * "count_distinct_properties" counts the number of distinct properties in the
       * billing period for a given meter.
       */
      aggregationType: 'sum' | 'count_distinct_properties';

      catalogId: string;

      createdAt: string;

      createdByCommit: string | null;

      livemode: boolean;

      name: string;

      organizationId: string;

      slug: string;

      updatedAt: string | null;

      updatedByCommit: string | null;
    }

    /**
     * The default product for the catalog. If no product is explicitly set as default,
     * will return undefined.
     */
    export interface DefaultProduct {
      id: string;

      active: boolean;

      catalogId: string;

      /**
       * safeZodDate
       */
      createdAt: (string & {}) | string;

      createdByCommit: string | null;

      default: boolean;

      /**
       * The default price for the product. If no price is explicitly set as default,
       * will return the first price created for the product..
       */
      defaultPrice:
        | DefaultProduct.SubscriptionPrice
        | DefaultProduct.SinglePaymentPrice
        | DefaultProduct.UsagePrice;

      description: string | null;

      displayFeatures: Array<DefaultProduct.DisplayFeature> | null;

      imageURL: string | null;

      livemode: boolean;

      name: string;

      organizationId: string;

      pluralQuantityLabel: string | null;

      prices: Array<
        DefaultProduct.SubscriptionPrice | DefaultProduct.SinglePaymentPrice | DefaultProduct.UsagePrice
      >;

      singularQuantityLabel: string | null;

      slug: string | null;

      /**
       * safeZodDate
       */
      updatedAt: (string & {}) | string;

      updatedByCommit: string | null;
    }

    export namespace DefaultProduct {
      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }

      export interface DisplayFeature {
        enabled: boolean;

        label: string;

        details?: string | null;
      }

      /**
       * A subscription price, which will have details on the interval, default trial
       * period, and setup fee (if any).
       */
      export interface SubscriptionPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        /**
         * safeZodPositiveInteger
         */
        setupFeeAmount: number | 0 | null;

        slug: string | null;

        /**
         * safeZodPositiveInteger
         */
        trialPeriodDays: number | 0 | null;

        type: 'subscription';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullishString
         */
        overagePriceId?: string | null;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A single payment price, which only gets paid once. Subscriptions cannot be made
       * from single payment prices. Purchases, though, can.
       */
      export interface SinglePaymentPrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'single_payment';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodNullOrUndefined
         */
        intervalCount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        intervalUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        startsWithCreditTrial?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageEventsPerUnit?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        usageMeterId?: 'null' | null | unknown;
      }

      /**
       * A usage price, which describes the price per unit of usage of a product.
       */
      export interface UsagePrice {
        id: string;

        active: boolean;

        createdAt: string;

        createdByCommit: string | null;

        currency:
          | 'USD'
          | 'AED'
          | 'AFN'
          | 'ALL'
          | 'AMD'
          | 'ANG'
          | 'AOA'
          | 'ARS'
          | 'AUD'
          | 'AWG'
          | 'AZN'
          | 'BAM'
          | 'BBD'
          | 'BDT'
          | 'BGN'
          | 'BIF'
          | 'BMD'
          | 'BND'
          | 'BOB'
          | 'BRL'
          | 'BSD'
          | 'BWP'
          | 'BYN'
          | 'BZD'
          | 'CAD'
          | 'CDF'
          | 'CHF'
          | 'CLP'
          | 'CNY'
          | 'COP'
          | 'CRC'
          | 'CVE'
          | 'CZK'
          | 'DJF'
          | 'DKK'
          | 'DOP'
          | 'DZD'
          | 'EGP'
          | 'ETB'
          | 'EUR'
          | 'FJD'
          | 'FKP'
          | 'GBP'
          | 'GEL'
          | 'GIP'
          | 'GMD'
          | 'GNF'
          | 'GTQ'
          | 'GYD'
          | 'HKD'
          | 'HNL'
          | 'HTG'
          | 'HUF'
          | 'IDR'
          | 'ILS'
          | 'INR'
          | 'ISK'
          | 'JMD'
          | 'JPY'
          | 'KES'
          | 'KGS'
          | 'KHR'
          | 'KMF'
          | 'KRW'
          | 'KYD'
          | 'KZT'
          | 'LAK'
          | 'LBP'
          | 'LKR'
          | 'LRD'
          | 'LSL'
          | 'MAD'
          | 'MDL'
          | 'MGA'
          | 'MKD'
          | 'MMK'
          | 'MNT'
          | 'MOP'
          | 'MUR'
          | 'MVR'
          | 'MWK'
          | 'MXN'
          | 'MYR'
          | 'MZN'
          | 'NAD'
          | 'NGN'
          | 'NIO'
          | 'NOK'
          | 'NPR'
          | 'NZD'
          | 'PAB'
          | 'PEN'
          | 'PGK'
          | 'PHP'
          | 'PKR'
          | 'PLN'
          | 'PYG'
          | 'QAR'
          | 'RON'
          | 'RSD'
          | 'RUB'
          | 'RWF'
          | 'SAR'
          | 'SBD'
          | 'SCR'
          | 'SEK'
          | 'SGD'
          | 'SHP'
          | 'SLE'
          | 'SOS'
          | 'SRD'
          | 'STD'
          | 'SZL'
          | 'THB'
          | 'TJS'
          | 'TOP'
          | 'TRY'
          | 'TTD'
          | 'TWD'
          | 'TZS'
          | 'UAH'
          | 'UGX'
          | 'UYU'
          | 'UZS'
          | 'VND'
          | 'VUV'
          | 'WST'
          | 'XAF'
          | 'XCD'
          | 'XOF'
          | 'XPF'
          | 'YER'
          | 'ZAR'
          | 'ZMW';

        /**
         * safeZodPositiveInteger
         */
        intervalCount: number;

        intervalUnit: 'day' | 'week' | 'month' | 'year';

        isDefault: boolean;

        livemode: boolean;

        name: string | null;

        productId: string;

        slug: string | null;

        type: 'usage';

        unitPrice: number;

        updatedAt: string | null;

        updatedByCommit: string | null;

        /**
         * safeZodPositiveInteger
         */
        usageEventsPerUnit: number;

        /**
         * The usage meter that uses this price. All usage events on that meter must be
         * associated with a price that is also associated with that usage meter.
         */
        usageMeterId: string;

        /**
         * safeZodNullOrUndefined
         */
        overagePriceId?: 'null' | null | unknown;

        /**
         * safeZodNullOrUndefined
         */
        setupFeeAmount?: 'null' | null | unknown;

        startsWithCreditTrial?: boolean | null;

        /**
         * safeZodNullOrUndefined
         */
        trialPeriodDays?: 'null' | null | unknown;
      }
    }
  }
}

export interface CatalogCreateParams {
  catalog: CatalogCreateParams.Catalog;
}

export namespace CatalogCreateParams {
  export interface Catalog {
    name: string;

    isDefault?: boolean;
  }
}

export interface CatalogUpdateParams {
  catalog: CatalogUpdateParams.Catalog;
}

export namespace CatalogUpdateParams {
  export interface Catalog {
    id: string;

    isDefault?: boolean;

    name?: string;
  }
}

export interface CatalogListParams {
  cursor?: string;

  limit?: number;
}

export interface CatalogCloneParams {
  name: string;
}

export declare namespace Catalogs {
  export {
    type CatalogCreateResponse as CatalogCreateResponse,
    type CatalogRetrieveResponse as CatalogRetrieveResponse,
    type CatalogUpdateResponse as CatalogUpdateResponse,
    type CatalogListResponse as CatalogListResponse,
    type CatalogCloneResponse as CatalogCloneResponse,
    type CatalogRetrieveDefaultResponse as CatalogRetrieveDefaultResponse,
    type CatalogCreateParams as CatalogCreateParams,
    type CatalogUpdateParams as CatalogUpdateParams,
    type CatalogListParams as CatalogListParams,
    type CatalogCloneParams as CatalogCloneParams,
  };
}
