// src/main.ts
import 'dotenv/config'
import { createApp } from './infrastructure/http/app'
import { prisma } from './infrastructure/database/prisma'

const PORT = process.env.PORT ?? 3000

async function bootstrap() {
  // Testa conexão com o banco antes de subir
  await prisma.$connect()
  console.log('✅ Database connected')

  const app = createApp()

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`   Environment: ${process.env.NODE_ENV ?? 'development'}`)
  })
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err)
  process.exit(1)
})
