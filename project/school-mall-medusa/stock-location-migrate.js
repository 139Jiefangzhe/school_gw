process.env.MEDUSA_WORKER_MODE = "server"

const { initializeContainer } = require("/app/node_modules/@medusajs/medusa/dist/loaders/index.js")
const { MedusaModule } = require("/app/node_modules/@medusajs/modules-sdk/dist/medusa-module.js")

async function main() {
  const container = await initializeContainer(process.cwd())
  const resolution = MedusaModule.getModuleResolutions("stock_location")

  if (!resolution) {
    throw new Error("stock_location resolution not found")
  }

  resolution.options ??= {}
  resolution.options.database ??= {
    clientUrl: process.env.DATABASE_URL,
  }

  console.log("MIGRATE_STOCK_LOCATION_START")

  const result = await MedusaModule.migrateUp({
    moduleKey: resolution.definition.key,
    modulePath: resolution.resolutionPath,
    container,
    options: resolution.options,
    moduleExports: resolution.moduleExports,
    cwd: process.cwd(),
  })

  console.log("MIGRATE_STOCK_LOCATION_DONE", JSON.stringify(result))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
