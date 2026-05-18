process.env.MEDUSA_WORKER_MODE = "server"

const { initializeContainer } = require("/app/node_modules/@medusajs/medusa/dist/loaders/index.js")
const { ContainerRegistrationKeys } = require("/app/node_modules/@medusajs/utils/dist/index.js")
const medusaApp = require("/app/node_modules/@medusajs/modules-sdk/dist/medusa-app.js")
const { MedusaModule } = require("/app/node_modules/@medusajs/modules-sdk/dist/medusa-module.js")

async function main() {
  const directory = process.cwd()
  const container = await initializeContainer(directory)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    await medusaApp.MedusaAppMigrateUp({
      sharedContainer: container,
      cwd: directory,
      modulesConfig: container.resolve(ContainerRegistrationKeys.CONFIG_MODULE).modules,
    })
  } catch (error) {
    console.log("MIGRATE_UP_ABORTED", error?.message || String(error))
  }

  const resolutions = MedusaModule.moduleResolutions_ || MedusaModule["moduleResolutions_"]
  if (!resolutions) {
    console.log("NO_RESOLUTION_MAP")
    return
  }

  for (const [key, value] of resolutions.entries()) {
    console.log("RESOLUTION_KEY", key)
    console.dir(value, { depth: 3 })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
