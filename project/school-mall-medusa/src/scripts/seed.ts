import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createProductCategoriesWorkflow,
  createInventoryItemsWorkflow,
  createShippingProfilesWorkflow,
  updateStoresWorkflow,
  createFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  createApiKeysWorkflow,
  createDefaultsWorkflow,
  createCustomerAccountWorkflow,
} from "@medusajs/medusa/core-flows";
import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
  GEO_ZONE_TYPES,
} from "@medusajs/framework/utils";
import { Logger } from "@medusajs/framework/types";

const DEFAULT_SCHOOL_ADMIN_EMAIL = "admin@school-mall.com";
const DEFAULT_SCHOOL_ADMIN_PASSWORD = "school-mall-2024";

/**
 * Seed demo data for School Mall
 * Creates: region, sales channel, stock location, product category,
 * sample products, shipping options, pickup points, admin user
 */
export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger;
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Seeding School Mall demo data...");

  // ─── Step 0: Create defaults (store, currencies) ───
  logger.info("Creating defaults...");
  await createDefaultsWorkflow(container).run({
    input: {
      store: {
        supported_currencies: [
          { currency_code: "cny", is_default: true },
        ],
        default_sales_channel_id: undefined,
        default_region_id: undefined,
      },
    },
  });

  // ─── Step 1: Create Region (China) ───
  logger.info("Creating region: China...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "中国大陆",
          currency_code: "cny",
          automatic_taxes: true,
          tax_code: "default",
          tax_rate: 0,
          gift_cards_taxable: false,
          countries: ["cn"],
          payment_providers: [],
          fulfillment_providers: [],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info(`Region created: ${region.name} (${region.id})`);

  // ─── Step 2: Create Sales Channel ───
  logger.info("Creating sales channel: WeChat Mini Program...");
  const { result: salesChannelResult } = await createSalesChannelsWorkflow(
    container
  ).run({
    input: {
      sales_channels_data: [
        {
          name: "微信小程序商城",
          description: "School Mall WeChat Mini Program sales channel",
          is_default: true,
        },
      ],
    },
  });
  const salesChannel = salesChannelResult[0];
  logger.info(`Sales channel created: ${salesChannel.name} (${salesChannel.id})`);

  // ─── Step 3: Create Stock Location ───
  logger.info("Creating stock location: School Main Warehouse...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "校园主仓库",
          address: {
            address_1: "学校后勤中心1楼",
            city: "北京市",
            province: "北京市",
            country_code: "cn",
            postal_code: "100000",
            phone: "010-12345678",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];
  logger.info(`Stock location created: ${stockLocation.name} (${stockLocation.id})`);

  // ─── Step 4: Link Sales Channel to Stock Location ───
  logger.info("Linking sales channel to stock location...");
  await remoteLink.create({
    [Modules.SALES_CHANNEL]: {
      sales_channel_id: salesChannel.id,
    },
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
  });

  // ─── Step 5: Create Fulfillment Set & Service Zone ───
  logger.info("Creating fulfillment set...");
  const { result: fulfillmentSetResult } = await createFulfillmentSetWorkflow(
    container
  ).run({
    input: {
      data: {
        name: "校园配送",
        type: "school-delivery",
        service_zones: [
          {
            name: "校园服务区",
            geo_zones: [
              {
                type: GEO_ZONE_TYPES.COUNTRY,
                country_code: "cn",
              },
            ],
          },
        ],
      },
    },
  });
  const fulfillmentSet = fulfillmentSetResult;
  logger.info(`Fulfillment set created: ${fulfillmentSet.name} (${fulfillmentSet.id})`);

  // Link fulfillment set to stock location
  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  // ─── Step 6: Create Shipping Profiles ───
  logger.info("Creating shipping profiles...");
  const { result: shippingProfileResult } = await createShippingProfilesWorkflow(
    container
  ).run({
    input: {
      data: [
        {
          name: "默认配送配置",
          type: "default",
        },
      ],
    },
  });
  const shippingProfile = shippingProfileResult[0];

  const { result: giftCardProfileResult } = await createShippingProfilesWorkflow(
    container
  ).run({
    input: {
      data: [
        {
          name: "礼品卡配送配置",
          type: "gift_card",
        },
      ],
    },
  });
  const giftCardProfile = giftCardProfileResult[0];

  // ─── Step 7: Create Shipping Options ───
  logger.info("Creating shipping options (logistics/self-pickup/delivery)...");
  await createShippingOptionsWorkflow(container).run({
    input: [
      // Option 1: Express Logistics
      {
        name: "快递物流",
        price_type: "flat",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        provider_id: "manual_manual",
        type: {
          label: "快递物流",
          description: "通过第三方快递配送至指定地址",
          code: "express-logistics",
        },
        prices: [
          { currency_code: "cny", amount: 800 }, // 8 CNY
        ],
        rules: [
          { attribute: "enabled", operator: "eq", value: "true" },
          { attribute: "item_total", operator: "gt", value: "0" },
        ],
      },
      // Option 2: Self Pickup
      {
        name: "自提点取货",
        price_type: "flat",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        provider_id: "manual_manual",
        type: {
          label: "自提点取货",
          description: "到校园指定自提点领取商品",
          code: "self-pickup",
        },
        prices: [
          { currency_code: "cny", amount: 0 }, // Free
        ],
        rules: [
          { attribute: "enabled", operator: "eq", value: "true" },
        ],
      },
      // Option 3: Door-to-door Delivery
      {
        name: "送货上门",
        price_type: "flat",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        provider_id: "manual_manual",
        type: {
          label: "送货上门",
          description: "配送至宿舍或教学楼",
          code: "door-delivery",
        },
        prices: [
          { currency_code: "cny", amount: 300 }, // 3 CNY
        ],
        rules: [
          { attribute: "enabled", operator: "eq", value: "true" },
          { attribute: "item_total", operator: "gt", value: "0" },
        ],
      },
    ],
  });
  logger.info("3 shipping options created");

  // ─── Step 8: Create Product Category ───
  logger.info("Creating product category...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "学习用品",
          description: "学生日常学习所需的文具、书籍等",
          handle: "study-supplies",
          is_active: true,
          is_internal: false,
          rank: 0,
        },
      ],
    },
  });
  const category = categoryResult[0];
  logger.info(`Category created: ${category.name} (${category.id})`);

  // ─── Step 9: Create Products ───
  logger.info("Creating sample products...");

  // Product 1: Notebook
  const { result: product1Result } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "精品笔记本套装",
          handle: "premium-notebook-set",
          description: "A5尺寸优质纸张笔记本，包含5本不同颜色封面，适合课堂笔记和日常记录。",
          subtitle: "5本装",
          status: ProductStatus.PUBLISHED,
          categories: [{ id: category.id }],
          sales_channels: [{ id: salesChannel.id }],
          images: [
            {
              url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800",
              alt: "精品笔记本套装",
            },
          ],
          options: [
            {
              title: "规格",
              values: ["标准版", "加厚版"],
            },
          ],
          variants: [
            {
              title: "标准版",
              sku: "NB-SET-STD-001",
              allow_backorder: false,
              manage_inventory: true,
              inventory_quantity: 100,
              prices: [{ currency_code: "cny", amount: 2990 }], // 29.90 CNY
              options: [{ option: "规格", value: "标准版" }],
            },
            {
              title: "加厚版",
              sku: "NB-SET-PLUS-001",
              allow_backorder: false,
              manage_inventory: true,
              inventory_quantity: 50,
              prices: [{ currency_code: "cny", amount: 3990 }], // 39.90 CNY
              options: [{ option: "规格", value: "加厚版" }],
            },
          ],
          weight: 500,
          height: 25,
          width: 18,
          length: 3,
          origin_country: "cn",
          material: "paper",
        },
      ],
    },
  });
  const product1 = product1Result[0];
  logger.info(`Product created: ${product1.title} (${product1.id})`);

  // Product 2: Pen Set
  const { result: product2Result } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "进口中性笔套装",
          handle: "imported-gel-pen-set",
          description: "日本进口0.5mm中性笔，书写流畅不洇墨，包含黑、蓝、红三色各2支。",
          subtitle: "6支装",
          status: ProductStatus.PUBLISHED,
          categories: [{ id: category.id }],
          sales_channels: [{ id: salesChannel.id }],
          images: [
            {
              url: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800",
              alt: "进口中性笔套装",
            },
          ],
          options: [
            {
              title: "颜色",
              values: ["混色", "全黑"],
            },
          ],
          variants: [
            {
              title: "混色",
              sku: "PEN-GEL-MIX-001",
              allow_backorder: false,
              manage_inventory: true,
              inventory_quantity: 200,
              prices: [{ currency_code: "cny", amount: 1890 }], // 18.90 CNY
              options: [{ option: "颜色", value: "混色" }],
            },
            {
              title: "全黑",
              sku: "PEN-GEL-BLK-001",
              allow_backorder: false,
              manage_inventory: true,
              inventory_quantity: 150,
              prices: [{ currency_code: "cny", amount: 1690 }], // 16.90 CNY
              options: [{ option: "颜色", value: "全黑" }],
            },
          ],
          weight: 100,
          height: 15,
          width: 8,
          length: 2,
          origin_country: "jp",
          material: "plastic",
        },
      ],
    },
  });
  const product2 = product2Result[0];
  logger.info(`Product created: ${product2.title} (${product2.id})`);

  // ─── Step 10: Create Inventory Items for stock management ───
  logger.info("Creating inventory items...");

  // Create inventory items and link to variants
  const inventoryModuleService = container.resolve(Modules.INVENTORY);
  const productModuleService = container.resolve(Modules.PRODUCT);

  // Get all variants
  const variants1 = await productModuleService.listProductVariants({
    product_id: product1.id,
  });
  const variants2 = await productModuleService.listProductVariants({
    product_id: product2.id,
  });
  const allVariants = [...variants1, ...variants2];

  for (const variant of allVariants) {
    const inventoryItem = await inventoryModuleService.createInventoryItems({
      sku: variant.sku,
      title: variant.title,
      requires_shipping: true,
      weight: variant.weight || 100,
      origin_country: variant.origin_country || "cn",
    });

    // Create inventory level
    await inventoryModuleService.createInventoryLevels({
      inventory_item_id: inventoryItem.id,
      location_id: stockLocation.id,
      stocked_quantity: variant.inventory_quantity || 100,
    });

    // Link inventory item to variant
    await remoteLink.create({
      [Modules.PRODUCT]: {
        variant_id: variant.id,
      },
      [Modules.INVENTORY]: {
        inventory_item_id: inventoryItem.id,
      },
    });

    logger.info(`  Inventory item linked: ${variant.sku} -> ${inventoryItem.id}`);
  }

  // ─── Step 11: Create Pickup Points ───
  logger.info("Creating pickup points...");
  const pickupModuleService = container.resolve("schoolPickup");
  if (pickupModuleService) {
    try {
      await pickupModuleService.createPickupPoints([
        {
          name: "第一教学楼自提柜",
          address: "第一教学楼A区大厅",
          description: "位于一楼大厅左侧智能快递柜区域，支持24小时自助取件",
          business_hours: "08:00-22:00",
          contact_phone: "010-11111111",
          is_enabled: true,
          sort_order: 1,
          metadata: { building: "教学楼A区", floor: "1F", location_type: "locker" },
        },
        {
          name: "学生服务中心",
          address: "学生活动中心201室",
          description: "学生服务中心前台，请在工作时间前往领取",
          business_hours: "09:00-17:30",
          contact_phone: "010-22222222",
          is_enabled: true,
          sort_order: 2,
          metadata: { building: "学生活动中心", floor: "2F", location_type: "counter" },
        },
        {
          name: "南区宿舍驿站",
          address: "南区宿舍区3号楼底商",
          description: "南区宿舍区快递驿站，靠近3号宿舍楼，支持晚间取件",
          business_hours: "09:00-21:00",
          contact_phone: "010-33333333",
          is_enabled: true,
          sort_order: 3,
          metadata: { building: "南区3号楼", floor: "1F", location_type: "station" },
        },
      ]);
      logger.info("3 pickup points created");
    } catch (e) {
      logger.warn(`Pickup module not available yet: ${(e as Error).message}`);
    }
  }

  // ─── Step 12: Update Store ───
  logger.info("Updating store settings...");
  await updateStoresWorkflow(container).run({
    input: {
      selector: {},
      update: {
        default_region_id: region.id,
        default_sales_channel_id: salesChannel.id,
        supported_currencies: [
          { currency_code: "cny", is_default: true },
        ],
        name: "校园商城",
      },
    },
  });

  // ─── Step 13: Create Admin User ───
  logger.info("Creating admin user...");
  try {
    const authModuleService = container.resolve(Modules.AUTH);
    const userModuleService = container.resolve(Modules.USER);

    // Register admin user with emailpass provider
    const authUser = await authModuleService.register("emailpass", {
      body: {
        email: DEFAULT_SCHOOL_ADMIN_EMAIL,
        password: DEFAULT_SCHOOL_ADMIN_PASSWORD,
      },
    });

    // Create the user entity
    await userModuleService.createUsers({
      id: authUser.authIdentity.entity_id,
      email: DEFAULT_SCHOOL_ADMIN_EMAIL,
      first_name: "School",
      last_name: "Admin",
    });

    logger.info(`Admin user created: ${DEFAULT_SCHOOL_ADMIN_EMAIL}`);
  } catch (e) {
    logger.warn(`Admin user creation skipped: ${(e as Error).message}`);
  }

  // ─── Step 14: Create API Key for WeChat Mini Program ───
  logger.info("Creating publishable API key...");
  try {
    const apiKeyModuleService = container.resolve(Modules.API_KEY);
    const apiKey = await apiKeyModuleService.createApiKeys({
      title: "微信小程序 Publishable Key",
      type: "publishable",
      created_by: "",
    });

    // Link API key to sales channel
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        api_key: apiKey.id,
        sales_channels: [{ id: salesChannel.id }],
      },
    });

    logger.info(`Publishable API Key created: ${apiKey.id}`);
    logger.info(`
╔════════════════════════════════════════════════════════════╗
║               School Mall Seed Complete!                   ║
╠════════════════════════════════════════════════════════════╣
║  Admin:     admin@school-mall.com                          ║
║  Password:  school-mall-2024                               ║
║  Region:    ${region.name.padEnd(50)} ║
║  Sales Ch:  ${salesChannel.name.padEnd(50)} ║
║  Products:  ${product1.title}, ${product2.title}   ║
║  Shipping:  快递物流(8元) / 自提点取货(免费) / 送货上门(3元)       ║
╚════════════════════════════════════════════════════════════╝
    `);
  } catch (e) {
    logger.warn(`API Key creation skipped: ${(e as Error).message}`);
  }

  logger.info("School Mall demo data seeded successfully!");
}
