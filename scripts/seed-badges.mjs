import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const BADGES = [
  {
    name: 'البداية الخضراء',
    description: 'حقق أول 100 نقطة',
    icon: '🌱',
    requirement: 100,
    type: 'points',
    color: '#00ff00',
  },
  {
    name: 'محارب الاستدامة',
    description: 'جمع 500 نقطة',
    icon: '⚔️',
    requirement: 500,
    type: 'points',
    color: '#ff007f',
  },
  {
    name: 'بطل الكوكب',
    description: 'جمع 1000 نقطة',
    icon: '🌍',
    requirement: 1000,
    type: 'points',
    color: '#00ffff',
  },
  {
    name: 'مقلل الانبعاثات',
    description: 'قلل بصمتك بنسبة 20%',
    icon: '📉',
    requirement: 20,
    type: 'reduction',
    color: '#ffff00',
  },
  {
    name: 'الرياح الخضراء',
    description: 'أكمل 7 تحديات متتالية',
    icon: '💨',
    requirement: 7,
    type: 'streak',
    color: '#00ff7f',
  },
  {
    name: 'سفير الاستدامة',
    description: 'وصل إلى المستوى 10',
    icon: '👑',
    requirement: 10,
    type: 'special',
    color: '#ff00ff',
  },
];

async function seedBadges() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    for (const badge of BADGES) {
      await connection.execute(
        'INSERT INTO badges (name, description, icon, requirement, type, color) VALUES (?, ?, ?, ?, ?, ?)',
        [badge.name, badge.description, badge.icon, badge.requirement, badge.type, badge.color]
      );
      console.log(`✓ تم إضافة شارة: ${badge.name}`);
    }
    console.log('\n✅ تم إضافة جميع الشارات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في إضافة الشارات:', error);
  } finally {
    await connection.end();
  }
}

seedBadges();
