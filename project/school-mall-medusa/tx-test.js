const { ModulesSdkUtils } = require("/app/node_modules/@medusajs/utils/dist/index.js")

const knex = ModulesSdkUtils.createPgConnection({
  clientUrl: process.env.DATABASE_URL,
  pool: { min: 1, max: 1 },
})

async function main() {
  console.log("DB", process.env.DATABASE_URL)
  console.log("BEFORE_TX")

  await knex.transaction(async (trx) => {
    console.log("IN_TX")
    const result = await trx.raw("select 1 as x")
    console.log("RAW", JSON.stringify(result.rows || result))
  })

  console.log("AFTER_TX")
  await knex.destroy()
}

main().catch(async (error) => {
  console.error(error)
  try {
    await knex.destroy()
  } catch {}
  process.exit(1)
})
