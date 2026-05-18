import { defineConfig, loadEnv, Modules } from "@medusajs/framework/utils";

// 加载环境变量
loadEnv(process.env.NODE_ENV || "development", process.cwd());

const sessionCookieSameSite =
  process.env.SESSION_COOKIE_SAME_SITE === "none" ||
  process.env.SESSION_COOKIE_SAME_SITE === "strict"
    ? process.env.SESSION_COOKIE_SAME_SITE
    : "lax";

// Medusa v2 项目配置
module.exports = defineConfig({
  // 项目配置
  projectConfig: {
    // 数据库配置
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      pool: {
        min: Number(process.env.DATABASE_POOL_MIN || 2),
        max: Number(process.env.DATABASE_POOL_MAX || 20),
      },
    },
    redisUrl: process.env.REDIS_URL,
    cookieOptions: {
      secure: process.env.SESSION_COOKIE_SECURE === "true",
      sameSite: sessionCookieSameSite,
    },

    // HTTP 服务配置
    http: {
      // 认证配置：每个角色可用的认证方式
      authMethodsPerActor: {
        // Keep the staging environment on the built-in auth flow until
        // custom providers are validated against the current Medusa APIs.
        customer: ["emailpass"],
        // 管理员角色：仅支持邮箱密码登录
        user: ["emailpass"],
      },

      // JWT 配置
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
      // CORS 配置（允许小程序域名访问）
      storeCors: process.env.STORE_CORS || "http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000",
      authCors: process.env.AUTH_CORS || "http://localhost:8000",
    },
  },

  admin: {
    path: "/app",
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },

  // 模块配置
  modules: {
    // === 认证模块 (Auth Module) ===
    [Modules.AUTH]: {
      resolve: "@medusajs/medusa/auth",
      options: {
        // 配置认证提供商列表
        providers: [
          // 1. 邮箱密码认证（默认）
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
            options: {},
          },
        ],
      },
    },
    [Modules.CACHE]: {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    [Modules.EVENT_BUS]: {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          redisUrl: process.env.REDIS_URL,
        },
      },
    },

    // === 其他模块配置示例 ===
    // 可以根据需要取消注释和配置

    // [Modules.CUSTOMER]: {
    //   resolve: "@medusajs/medusa/customer",
    // },

    // [Modules.CART]: {
    //   resolve: "@medusajs/medusa/cart",
    // },

    // [Modules.PRODUCT]: {
    //   resolve: "@medusajs/medusa/product",
    // },
  },
});
