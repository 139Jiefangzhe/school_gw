process.env.MEDUSA_WORKER_MODE = "server"

const { initializeContainer } = require("@medusajs/medusa/dist/loaders")
const { ContainerRegistrationKeys } = require("@medusajs/framework/utils")
const { MedusaModule } = require("@medusajs/modules-sdk")
const migrateCommand = require("@medusajs/medusa/dist/commands/db/migrate")

const originalMigrateUp = MedusaModule.migrateUp.bind(MedusaModule)

MedusaModule.migrateUp = async (options: any) => {
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
