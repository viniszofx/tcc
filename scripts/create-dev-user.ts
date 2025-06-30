import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDevUser() {
  try {
    // Verificar se o usuário de desenvolvimento já existe
    const existingUser = await prisma.userProfile.findUnique({
      where: { id: '550e8400-e29b-41d4-a716-446655440000' }
    })

    if (existingUser) {
      console.log('Usuário de desenvolvimento já existe:', existingUser.email)
      return
    }

    // Criar usuário de desenvolvimento
    const devUser = await prisma.userProfile.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Usuário de Desenvolvimento',
        email: 'dev@example.com',
        description: 'Usuário para testes de desenvolvimento',
        active: true
      }
    })

    console.log('Usuário de desenvolvimento criado:', devUser.email)
  } catch (error) {
    console.error('Erro ao criar usuário de desenvolvimento:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDevUser()
