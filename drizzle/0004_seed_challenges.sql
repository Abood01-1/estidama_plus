-- Phase 4 seed: one active challenge per required concept.
-- Safe to re-run: INSERT IGNORE skips existing titles.
INSERT IGNORE INTO `daily_challenges` (`title`, `description`, `category`, `targetReduction`, `reward`) VALUES
('تحدي خفض الكربون', 'قلل بصمتك الكربونية اليومية عبر خيارات منخفضة الانبعاثات', 'carbon', 100, 150),
('تحدي النقل المستدام', 'استخدم المشي أو الدراجة أو النقل العام بدلاً من السيارة', 'transport', 100, 150),
('تحدي توفير الطاقة', 'قلل استهلاك الكهرباء بإطفاء الأجهزة غير الضرورية', 'electricity', 100, 200),
('تحدي توفير المياه', 'قلل استهلاك المياه اليوم', 'water', 100, 120),
('تحدي إعادة التدوير', 'أعد تدوير النفايات وقلل الهدر اليوم', 'waste', 100, 180),
('تحدي الوعي البيئي', 'اقرأ نصيحة بيئية وطبق إجراءً صديقاً للبيئة اليوم', 'education', 100, 80);
