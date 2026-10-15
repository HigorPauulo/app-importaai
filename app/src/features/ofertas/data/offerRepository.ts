import type { SQLiteDatabase } from 'expo-sqlite';

import type { OfferListItem } from '../domain/offerList';

export async function listOffers(db: SQLiteDatabase): Promise<OfferListItem[]> {
  return db.getAllAsync<OfferListItem>(
    `select o.id, o.product_group_id as groupId, g.name as groupName, o.store_id as storeId, s.name as storeName,
            o.price_minor as priceMinor, o.shipping_minor as shippingMinor, o.currency, c.minor_units as minorUnits,
            o.purchase_id as purchaseId
       from offers o
       join product_groups g on g.id = o.product_group_id and g.deleted_at is null
       join stores s on s.id = o.store_id
       join currencies c on c.code = o.currency
      where o.deleted_at is null`,
  );
}

