// データベース初期化・シードデータ投入
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 データベースの初期化を開始...');

  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // 1. 管理者ユーザーの作成
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      userId: 'admin',
      password: hashedPassword,
      authority: '管理者',
    },
  });

  console.log('👤 管理者ユーザーを作成しました:', adminUser.username);

  // 2. サンプル担当者の作成
  const staffMembers = [
    {
      code: 'STAFF001',
      name: '田中太郎',
      salesCommission: true,
      inspectionApproval: '主任',
    },
    {
      code: 'STAFF002',
      name: '佐藤花子',
      salesCommission: true,
      inspectionApproval: 'なし',
    },
    {
      code: 'STAFF003',
      name: '鈴木一郎',
      salesCommission: false,
      inspectionApproval: '課長',
    },
  ];

  for (const staffData of staffMembers) {
    await prisma.staff.upsert({
      where: { code: staffData.code },
      update: {},
      create: staffData,
    });
  }

  console.log('👷 担当者を作成しました（3名）');

  // 3. サンプル得意先の作成
  const customers = [
    {
      code: 'CUST001',
      name: '株式会社サンプル商事',
      honorific: '御中',
      postalCode: '123-4567',
      address: '東京都渋谷区サンプル1-2-3',
      tel: '03-1234-5678',
      email: 'sample@example.com',
      contactPerson: '佐藤花子',
      closingDate: 25,
      paymentDate: 10,
      comment: 'メイン取引先',
    },
    {
      code: 'CUST002',
      name: 'テストビル管理株式会社',
      honorific: '御中',
      postalCode: '456-7890',
      address: '神奈川県横浜市港北区テスト2-3-4',
      tel: '045-2345-6789',
      email: 'info@testbuild.com',
      contactPerson: '山田次郎',
      closingDate: 31,
      paymentDate: 15,
      comment: '定期点検契約先',
    },
    {
      code: 'CUST003',
      name: '有限会社デモマンション',
      honorific: '御中',
      postalCode: '789-0123',
      address: '大阪府大阪市中央区デモ3-4-5',
      tel: '06-3456-7890',
      email: 'contact@demo-mansion.co.jp',
      contactPerson: '高橋三郎',
      closingDate: 20,
      paymentDate: 25,
      comment: '新築マンション管理',
    },
  ];

  for (const customerData of customers) {
    await prisma.customer.upsert({
      where: { code: customerData.code },
      update: {},
      create: customerData,
    });
  }

  console.log('🏢 得意先を作成しました（3件）');

  // 4. サンプル仕入先の作成
  const suppliers = [
    {
      code: 'SUPP001',
      name: '消防機器販売株式会社',
      honorific: '御中',
      postalCode: '456-7890',
      address: '愛知県名古屋市中区仕入1-2-3',
      tel: '052-1234-5678',
      email: 'order@supplier.com',
      contactPerson: '山田次郎',
      comment: '主要仕入先',
    },
    {
      code: 'SUPP002',
      name: '防災設備工業株式会社',
      honorific: '御中',
      postalCode: '567-8901',
      address: '兵庫県神戸市中央区工業4-5-6',
      tel: '078-2345-6789',
      email: 'sales@bousai-kogyo.co.jp',
      contactPerson: '伊藤四郎',
      comment: 'スプリンクラー専門',
    },
  ];

  for (const supplierData of suppliers) {
    await prisma.supplier.upsert({
      where: { code: supplierData.code },
      update: {},
      create: supplierData,
    });
  }

  console.log('🏭 仕入先を作成しました（2件）');

  // 5. サンプル商品の作成
  const supplier1 = await prisma.supplier.findUnique({ where: { code: 'SUPP001' } });
  const supplier2 = await prisma.supplier.findUnique({ where: { code: 'SUPP002' } });

  const products = [
    {
      code: 'PROD001',
      name: '消火器ABC粉末10型',
      unit: '本',
      category: '消火器',
      price: 15000,
      purchasePrice: 12000,
      stockQuantity: 50,
      supplierId: supplier1!.id,
    },
    {
      code: 'PROD002',
      name: '自動火災報知設備感知器',
      unit: '個',
      category: '火災報知設備',
      price: 25000,
      purchasePrice: 20000,
      stockQuantity: 30,
      supplierId: supplier1!.id,
    },
    {
      code: 'PROD003',
      name: 'スプリンクラーヘッド',
      unit: '個',
      category: 'スプリンクラー',
      price: 8000,
      purchasePrice: 6000,
      stockQuantity: 100,
      supplierId: supplier2!.id,
    },
    {
      code: 'PROD004',
      name: '消火栓ホース',
      unit: '本',
      category: '消火栓設備',
      price: 12000,
      purchasePrice: 9000,
      stockQuantity: 25,
      supplierId: supplier1!.id,
    },
    {
      code: 'PROD005',
      name: '誘導灯LED型',
      unit: '個',
      category: '避難設備',
      price: 18000,
      purchasePrice: 14000,
      stockQuantity: 40,
      supplierId: supplier2!.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { code: productData.code },
      update: {},
      create: productData,
    });
  }

  console.log('📦 商品を作成しました（5件）');

  // 6. サンプル受注データの作成
  const customer1 = await prisma.customer.findUnique({ where: { code: 'CUST001' } });
  const customer2 = await prisma.customer.findUnique({ where: { code: 'CUST002' } });
  const staff1 = await prisma.staff.findUnique({ where: { code: 'STAFF001' } });

  const orders = [
    {
      orderNo: 'ORD001',
      customerId: customer1!.id,
      projectName: '消火器定期点検・交換作業',
      orderDate: new Date('2024-08-01'),
      deliveryDate: new Date('2024-08-15'),
      salesAmount: 180000,
      status: '受注',
      staffId: staff1!.id,
    },
    {
      orderNo: 'ORD002',
      customerId: customer2!.id,
      projectName: '自動火災報知設備新設工事',
      orderDate: new Date('2024-08-10'),
      deliveryDate: new Date('2024-09-30'),
      salesAmount: 850000,
      status: '進行中',
      staffId: staff1!.id,
    },
  ];

  for (const orderData of orders) {
    await prisma.order.upsert({
      where: { orderNo: orderData.orderNo },
      update: {},
      create: orderData,
    });
  }

  console.log('📋 受注データを作成しました（2件）');

  // 7. サンプル日程データの作成
  const order1 = await prisma.order.findUnique({ where: { orderNo: 'ORD001' } });
  
  const schedules = [
    {
      scheduleDate: new Date('2024-08-30'),
      startTime: '09:00',
      endTime: '17:00',
      orderId: order1!.id,
      customerId: customer1!.id,
      projectName: '消火器交換作業',
      location: 'オフィスビル A棟',
      staffId: staff1!.id,
      workType: '消火器交換',
      amount: 120000,
      status: '予定',
      note: '全フロア対象',
    },
    {
      scheduleDate: new Date('2024-08-31'),
      startTime: '10:00',
      endTime: '15:00',
      customerId: customer2!.id,
      projectName: '定期点検作業',
      location: 'ショッピングモール',
      staffId: staff1!.id,
      workType: '定期点検',
      status: '予定',
      note: '年次点検',
    },
    {
      scheduleDate: new Date('2024-09-01'),
      startTime: '08:30',
      endTime: '16:30',
      projectName: '新設工事',
      location: '新築マンション',
      staffId: staff1!.id,
      workType: '新設工事',
      amount: 450000,
      status: '予定',
      note: '火災報知設備設置',
    },
  ];

  for (const scheduleData of schedules) {
    await prisma.schedule.create({
      data: scheduleData,
    });
  }

  console.log('📅 日程データを作成しました（3件）');

  console.log('🎉 データベースの初期化が完了しました！');
  console.log('');
  console.log('📝 管理者ログイン情報:');
  console.log('   ユーザーID: admin');
  console.log('   パスワード: admin123');
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });