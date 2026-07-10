import { invokeLLM } from "./_core/llm";
import { CARBON_FACTORS, REDUCTION_TIPS } from "@shared/carbon-constants";

export interface CarbonData {
  transport: number;
  electricity: number;
  water: number;
  food: number;
  waste: number;
}

export async function generateAIRecommendations(
  carbonData: CarbonData,
  userInfo?: { name?: string; location?: string }
): Promise<string> {
  const total = Object.values(carbonData).reduce((a, b) => a + b, 0);
  const percentages = {
    transport: ((carbonData.transport / total) * 100).toFixed(1),
    electricity: ((carbonData.electricity / total) * 100).toFixed(1),
    water: ((carbonData.water / total) * 100).toFixed(1),
    food: ((carbonData.food / total) * 100).toFixed(1),
    waste: ((carbonData.waste / total) * 100).toFixed(1),
  };

  const systemPrompt = `أنت مستشار استدامة بيئية متخصص في الإمارات العربية المتحدة. 
تقدم توصيات مخصصة وعملية لتقليل البصمة الكربونية بناءً على نمط حياة المستخدم.
يجب أن تكون التوصيات:
1. محددة وقابلة للتطبيق فوراً
2. مخصصة لنمط الحياة الإماراتي
3. تركز على المجالات ذات الأثر الأكبر
4. تتضمن معلومات عن التوفير المحتمل
5. باللغة العربية الفصحى`;

  const userPrompt = `بناءً على بيانات البصمة الكربونية التالية:
- إجمالي البصمة: ${total.toFixed(2)} طن CO₂/سنة
- المواصلات: ${carbonData.transport.toFixed(2)} طن (${percentages.transport}%)
- الكهرباء والطاقة: ${carbonData.electricity.toFixed(2)} طن (${percentages.electricity}%)
- المياه: ${carbonData.water.toFixed(2)} طن (${percentages.water}%)
- الغذاء: ${carbonData.food.toFixed(2)} طن (${percentages.food}%)
- النفايات: ${carbonData.waste.toFixed(2)} طن (${percentages.waste}%)

${userInfo?.name ? `المستخدم: ${userInfo.name}` : ""}
${userInfo?.location ? `الموقع: ${userInfo.location}` : "الموقع: الإمارات العربية المتحدة"}

يرجى تقديم 5 توصيات محددة وعملية لتقليل البصمة الكربونية، مع التركيز على المجالات التي تساهم أكثر في الانبعاثات.
يجب أن تتضمن كل توصية:
1. الإجراء المحدد
2. التأثير المتوقع (بالطن CO₂ المتوقع توفيره سنوياً)
3. المدة الزمنية للتطبيق
4. التكلفة/الفائدة الاقتصادية إن أمكن`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    if (response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content;
      return typeof content === 'string' ? content : 'تم توليد التوصيات';
    }
    return 'لم تتمكن من توليد التوصيات';
  } catch (error: any) {
    console.error("Error generating AI recommendations:", error);
    return generateFallbackRecommendations(carbonData, percentages);
  }
}

function generateFallbackRecommendations(
  carbonData: CarbonData,
  percentages: Record<string, string>
): string {
  const recommendations: string[] = [];

  // Find top 3 categories
  const categories = [
    { key: "transport", label: "المواصلات", value: carbonData.transport },
    { key: "electricity", label: "الكهرباء", value: carbonData.electricity },
    { key: "water", label: "المياه", value: carbonData.water },
    { key: "food", label: "الغذاء", value: carbonData.food },
    { key: "waste", label: "النفايات", value: carbonData.waste },
  ].sort((a, b) => b.value - a.value);

  categories.slice(0, 3).forEach((category) => {
    const tips = REDUCTION_TIPS[category.key as keyof typeof REDUCTION_TIPS];
    if (tips && tips.length > 0) {
      recommendations.push(`**${category.label}** (${percentages[category.key]}% من الانبعاثات):\n${tips[0]}`);
    }
  });

  return `التوصيات الأساسية لتقليل بصمتك الكربونية:\n\n${recommendations.join("\n\n")}`;
}
