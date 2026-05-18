process.env.MEDUSA_WORKER_MODE = "server"

const { initializeContainer } = require("/app/node_modules/@medusajs/medusa/dist/loaders/index.js")
const { ContainerRegistrationKeys } = require("/app/node_modules/@medusajs/utils/dist/index.js")
const { MedusaModule } = require("/app/node_modules/@medusajs/modules-sdk/dist/medusa-module.js")
const migrateCommand = require("/app/node_modules/@medusajs/medusa/dist/commands/db/migrate.js")
const medusaApp = require("/app/node_modules/@medusajs/modules-sdk/dist/medusa-app.js")
const executeWithConcurrencyModule = require("/app/node_modules/@medusajs/utils/dist/common/execute-with-concurrency.js")

const originalMigrateUp = MedusaModule.migrateUp.bind(MedusaModule)
const originalAppMigrateUp = medusaApp.MedusaAppMigrateUp.bind(medusaApp)
const originalGetModuleResolutions = MedusaModule.getModuleResolutions.bind(MedusaModule)
const originalExecuteWithConcurrency = executeWithConcurrencyModule.executeWithConcurrency.bind(executeWithConcurrencyModule)
const modulesUtilsIndex = require("/app/node_modules/@medusajs/utils/dist/index.js")
const originalCreatePgConnection = modulesUtilsIndex.ModulesSdkUtils.createPgConnection.bind(modulesUtilsIndex.ModulesSdkUtils)

medusaApp.MedusaAppMigrateUp = async (options) => {
  console.log("APP_MIGRATE_START")
  const result = await originalAppMigrateUp(options)
  console.log("APP_MIGRATE_DONE")
  return result
}

MedusaModule.getModuleResolutions = (moduleKey) => {
  console.log(`RESOLVE ${moduleKey}`)
  const result = originalGetModuleResolutions(moduleKey)
  console.log(`RESOLVED ${moduleKey} ${!!result}`)
  return result
}

executeWithConcurrencyModule.executeWithConcurrency = async (functions, concurrency) => {
  console.log(`EXEC_WITH_CONCURRENCY count=${functions.length} concurrency=${concurrency}`)
  return originalExecuteWithConcurrency(
    functions.map((fn, index) => async () => {
      console.log(`TASK_START ${index}`)
      const result = await fn()
      console.log(`TASK_DONE ${index}`)
      return result
    }),
    concurrency
  )
}

modulesUtilsIndex.ModulesSdkUtils.createPgConnection = (...args) => {
  const knex = originalCreatePgConnection(...args)
  const originalTransaction = knex.transaction.bind(knex)

  knex.transaction = async (handler, ...rest) => {
    console.log("TX_START")
    return originalTransaction(async (trx) => {
      const originalRaw = trx.raw.bind(trx)
      trx.raw = async (...rawArgs) => {
        const sql = rawArgs[0]
        if (typeof sql === "string" && sql.includes("pg_advisory_xact_lock")) {
          console.log(`LOCK_SQL ${sql}`)
        }
        return originalRaw(...rawArgs)
      }
      const result = await handler(trx)
      console.log("TX_DONE")
      return result
    }, ...rest)
  }

  return knex
}

MedusaModule.migrateUp = async (options) => {
  const startedAt = Date.now()
  console.log(`START ${options.moduleKey}`)

  try {
    const result = await originalMigrateUp(options)
    const names = Array.isArray(result) ? result.map((item) => item.name).join(",") : ""
    console.log(`DONE ${options.moduleKey} ${Date.now() - startedAt}ms ${names}`)
    return result
  } catch (error) {
    console.error(`ERR ${options.moduleKey}`, error)
    throw error
  }
}

async function main() {
  const directory = process.cwd()
  const container = await initializeContainer(directory)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  await migrateCommand.migrate({
    directory,
    skipLinks: true,
    skipScripts: true,
    logger,
    container,
  })

  console.log("MIGRATE_DONE")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
