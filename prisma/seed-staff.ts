import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const staffData = [
  { code: '1', name: '社扱い' },
  { code: '2', name: '千葉 久男' },
  { code: '3', name: '町井 宏行' },
  { code: '4', name: '小野木省吾' },
  { code: '5', name: '小野木完司' },
  { code: '6', name: '野口 隆史' },
  { code: '7', name: '本田　一夫' },
  { code: '8', name: '第一防災' },
  { code: '9', name: '一林　貴也' },
  { code: '10', name: '一林　勝明' },
  { code: '11', name: '宮崎　慶一' },
  { code: '12', name: '小野木　由加' },
  { code: '13', name: '古村　和範' },
  { code: '14', name: '猪上　和志' },
  { code: '15', name: '野坂　伸悦' },
  { code: '16', name: '加藤　悠紀' },
  { code: '17', name: '尾関　亮太' },
  { code: '18', name: '上谷　兆治' },
  { code: '19', name: '鈴木　聖満' },
  { code: '20', name: '本田　光' },
  { code: '21', name: '大沼　孝洋' },
  { code: '23', name: '井上　明宏' },
  { code: '24', name: '町井' },
  { code: '25', name: '宮崎　慶一' },
  { code: '26', name: '上杉　克彦' },
  { code: '27', name: 'ｸﾘｰﾝｺｰﾎﾟﾚｰｼｮﾝ' },
  { code: '30', name: '水野　伸悟' },
  { code: '31', name: '佐藤　建斗' },
  { code: '32', name: '川江　亜土史' },
  { code: '33', name: '高橋　裕也' },
  { code: '34', name: '町井　拓馬' },
  { code: '35', name: '寺田　恭平' },
  { code: '36', name: '宮下　順' },
  { code: '41', name: '社扱(千葉)' },
  { code: '42', name: '社扱(町井)' },
  { code: '43', name: '社扱(完司)' },
  { code: '46', name: '社扱(野口)' },
  { code: '47', name: '社扱(第一防災)（使用禁止）' },
  { code: '48', name: '社扱(宮崎)' },
  { code: '49', name: '社扱(鈴木)' },
  { code: '50', name: '社扱(古村)' },
  { code: '51', name: '防災ｴﾝｼﾞﾆｱﾘﾝｸﾞ宮崎' },
  { code: '52', name: '防災ｴﾝｼﾞﾆｱﾘﾝｸﾞ野口' },
  { code: '53', name: '防災ｴﾝｼﾞﾆｱﾘﾝｸﾞ町井' },
  { code: '54', name: '社扱（町井　拓馬）' },
  { code: '55', name: '社扱（上杉）' },
  { code: '57', name: '社扱（尾関）' },
  { code: '58', name: '防災ｴﾝｼﾞﾆｱﾘﾝｸﾞ　町井 拓馬' },
  { code: '77', name: '社扱（ｸﾘｰﾝｺｰﾎﾟﾚｰｼｮﾝ）' },
  { code: '88', name: '社扱(第一防災)' }
];

async function seedStaff() {
  console.log('担当者マスターデータを投入開始...');

  // 既存データをクリア
  await prisma.staff.deleteMany({});
  console.log('既存の担当者データを削除しました');

  // 新しいデータを投入
  for (const staff of staffData) {
    await prisma.staff.create({
      data: {
        code: staff.code,
        name: staff.name,
        salesCommission: false,
        inspectionApproval: 'なし'
      }
    });
    console.log(`担当者を登録: ${staff.code} - ${staff.name}`);
  }

  console.log(`担当者マスターデータの投入が完了しました。総件数: ${staffData.length}`);
}

seedStaff()
  .catch((e) => {
    console.error('エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });