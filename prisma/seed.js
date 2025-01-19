import {PrismaClient} from '@prisma/client'

const prisma=new PrismaClient()

prisma.team.create({
    data: {
        name: 'ADMIN TEAM',
        id: process.env.ADMIN_TEAM_ID,
        shortCode: process.env.ADMIN_TEAM_ID,
        checkedIn: true
    }
}).then(() => {
    console.log('Admin team created successfully')
}).catch((e) => {
    console.error('Error creating admin team:', e)
}).finally(() => {
    prisma.$disconnect()
})