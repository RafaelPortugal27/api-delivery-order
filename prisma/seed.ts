import { PrismaClient, StoreUserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Criar store demo
  const store = await prisma.store.upsert({
    where: { slug: 'burguer-house' },
    update: {},
    create: {
      name: 'Burguer House',
      slug: 'burguer-house',
      description: 'Os melhores burguers da cidade!',
      phone: '+5511999999999',
      isActive: true,
    },
  })

  // Criar owner da store
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await prisma.storeUser.upsert({
    where: { email_storeId: { email: 'admin@burguerhouse.com', storeId: store.id } },
    update: {},
    create: {
      storeId: store.id,
      name: 'Admin',
      email: 'admin@burguerhouse.com',
      password: hashedPassword,
      role: StoreUserRole.OWNER,
    },
  })

  // Criar categorias
  const catBurguers = await prisma.category.create({
    data: { storeId: store.id, name: 'Burguers', order: 1 },
  })
  const catBebidas = await prisma.category.create({
    data: { storeId: store.id, name: 'Bebidas', order: 2 },
  })

  // Criar produtos
  await prisma.product.createMany({
    data: [
      {
        storeId: store.id,
        categoryId: catBurguers.id,
        name: 'Classic Burguer',
        description: 'Pão brioche, blend 180g, queijo, alface e tomate',
        price: 28.9,
      },
      {
        storeId: store.id,
        categoryId: catBurguers.id,
        name: 'Smash Burguer',
        description: 'Pão brioche, dois smash 90g, queijo americano, molho especial',
        price: 34.9,
      },
      {
        storeId: store.id,
        categoryId: catBebidas.id,
        name: 'Refrigerante Lata',
        description: 'Coca-Cola, Pepsi ou Guaraná - 350ml',
        price: 6.0,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed concluído!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
