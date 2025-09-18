import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateStaffActive() {
  console.log('担当者の在職状況を更新開始...');

  try {
    // 全ての担当者を在職中（isActive: true）に更新
    const updateResult = await prisma.staff.updateMany({
      data: {
        isActive: true
      }
    });

    console.log(`${updateResult.count}人の担当者を在職中に更新しました`);
    console.log('担当者の在職状況更新が完了しました');
  } catch (error) {
    console.error('更新エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateStaffActive();