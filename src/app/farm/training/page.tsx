'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { TierProgress } from '@/components/farm/TierProgress';
import { FARMER_TIERS, TIER_ORDER, type FarmerTier } from '@/lib/farmer-tiers';

// ── Types ─────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  difficulty: string;
  lesson_count: number;
  tier_unlock: string;
  slug: string;
  category: string;
}

interface CourseCompletion {
  id: string;
  course_id: string;
  user_id: string;
  completed_at: string;
  course_title: string;
  tier_unlocked: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string[];
  keyTakeaways: string[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface CourseContent {
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

// ── Lesson Content for Fallback Courses ──────────────────────────────────

const COURSE_LESSON_CONTENT: Record<string, CourseContent> = {
  'fallback-farm-basics': {
    lessons: [
      {
        id: 'fb-1',
        title: 'Understanding Your Soil Type',
        content: [
          'Soil is the foundation of all farming. In Africa, farmers encounter a wide range of soil types depending on their region. The three main soil textures are sandy, clay, and loam, each with different water-holding capacity, drainage, and nutrient profiles.',
          'Sandy soils are common in the Sahel and parts of Southern Africa. They drain quickly but lose nutrients fast. Clay soils, found in river valleys and parts of East Africa, hold water well but can become waterlogged and hard to work. Loam soils, a mix of sand, silt, and clay, are considered ideal for most crops.',
          'To test your soil type at home, take a handful of moist soil and squeeze it. Sandy soil falls apart immediately. Clay soil holds its shape and feels sticky. Loam soil holds together loosely but crumbles when poked. Knowing your soil type helps you choose the right crops and amendments.',
          'Different crops thrive in different soils. Cassava and groundnuts do well in sandy soils. Rice and sugarcane prefer clay. Maize, beans, and most vegetables perform best in loam. Understanding your soil is the first step to better yields.',
        ],
        keyTakeaways: [
          'Three main soil types: sandy (drains fast), clay (holds water), loam (balanced)',
          'Simple squeeze test can identify your soil type in the field',
          'Match your crop selection to your soil type for better yields',
        ],
      },
      {
        id: 'fb-2',
        title: 'Soil pH and Nutrient Testing',
        content: [
          'Soil pH measures how acidic or alkaline your soil is, on a scale from 0 to 14. Most crops grow best in soil with a pH between 5.5 and 7.0. If your soil is too acidic or too alkaline, plants cannot absorb nutrients properly, even if those nutrients are present in the soil.',
          'In many parts of tropical Africa, soils tend to be acidic due to heavy rainfall leaching away calcium and magnesium. You can test soil pH using simple kits available at agricultural extension offices, or by sending samples to a soil laboratory. Some farmers use litmus paper strips as an affordable first step.',
          'To correct acidic soil (pH below 5.5), apply agricultural lime. For alkaline soil (above 7.5), add sulfur or organic matter. The amount needed depends on your starting pH and soil type. Your local extension officer can advise on the right quantity for your conditions.',
          'Beyond pH, the three critical nutrients to test are Nitrogen (N), Phosphorus (P), and Potassium (K). Nitrogen supports leaf growth, phosphorus aids root and flower development, and potassium strengthens overall plant health. Regular testing every one to two seasons helps you apply only what your soil actually needs, saving money and preventing pollution.',
        ],
        keyTakeaways: [
          'Most crops need soil pH between 5.5 and 7.0',
          'Apply lime for acidic soil, sulfur or compost for alkaline soil',
          'Test for N-P-K levels to apply only the fertilizers you actually need',
        ],
      },
      {
        id: 'fb-3',
        title: 'Composting and Organic Matter',
        content: [
          'Compost is decomposed organic material that acts as a natural fertilizer and soil conditioner. It improves soil structure, adds beneficial microorganisms, and provides slow-release nutrients. For African smallholder farmers, composting is one of the most cost-effective ways to improve soil health.',
          'To start composting, collect a mix of "green" materials (fresh plant waste, kitchen scraps, manure) and "brown" materials (dry leaves, straw, maize stalks). Layer them in a pile or pit about one meter square. Keep the pile moist but not waterlogged, and turn it every two weeks to add oxygen. Good compost is ready in two to three months.',
          'Animal manure from cattle, goats, and chickens is an excellent compost ingredient common across African farms. However, fresh manure should never be applied directly to crops, as it can burn plant roots and carry pathogens. Composting manure for at least eight weeks kills harmful organisms and makes the nutrients more plant-available.',
          'Apply compost before planting by spreading a layer two to five centimeters thick and mixing it into the top 15 centimeters of soil. For established crops, apply compost as a top dressing around the base of plants. Even small amounts make a significant difference. A single wheelbarrow of compost per 10 square meters can visibly improve crop growth within one season.',
        ],
        keyTakeaways: [
          'Mix green (wet, nitrogen-rich) and brown (dry, carbon-rich) materials for good compost',
          'Turn the pile every two weeks; compost is ready in two to three months',
          'Never apply fresh manure directly to crops; always compost it first',
        ],
      },
      {
        id: 'fb-4',
        title: 'Cover Crops and Green Manure',
        content: [
          'Cover crops are plants grown specifically to protect and enrich the soil, rather than for harvest. When ploughed back into the soil, they become "green manure." This technique is widely used across Africa to restore soil fertility between main cropping seasons and to reduce erosion during heavy rains.',
          'Leguminous cover crops such as cowpea, mucuna (velvet bean), lablab, and Crotalaria are particularly valuable because they fix atmospheric nitrogen into the soil through symbiotic bacteria in their root nodules. A single season of mucuna can add 80 to 150 kilograms of nitrogen per hectare, equivalent to several bags of synthetic fertilizer.',
          'Beyond nitrogen fixation, cover crops suppress weeds by shading the ground, prevent erosion by holding soil in place during storms, and improve soil structure as their roots create channels for water infiltration. In semi-arid regions, cover crops can also help retain soil moisture through reduced evaporation.',
          'To use cover crops effectively, plant them immediately after harvesting your main crop. Allow them to grow for six to twelve weeks. Before they set seed, cut them down and either incorporate them into the soil or leave them as mulch on the surface. Planning your rotation to include cover crops at least once a year can dramatically reduce your need for purchased fertilizers over time.',
        ],
        keyTakeaways: [
          'Leguminous cover crops (cowpea, mucuna, lablab) fix nitrogen naturally',
          'Cover crops suppress weeds, prevent erosion, and improve water infiltration',
          'Plant after main harvest and incorporate into soil before they set seed',
        ],
      },
    ],
    quiz: [
      {
        question: 'Which soil type drains quickly but loses nutrients fast?',
        options: ['Clay soil', 'Sandy soil', 'Loam soil', 'Peat soil'],
        correctIndex: 1,
      },
      {
        question: 'What should you add to acidic soil (pH below 5.5) to raise the pH?',
        options: ['More manure', 'Agricultural lime', 'Sulfur', 'Sand'],
        correctIndex: 1,
      },
      {
        question: 'Why should fresh animal manure NOT be applied directly to crops?',
        options: [
          'It has no nutrients',
          'It attracts pests',
          'It can burn roots and carry pathogens',
          'It makes soil too alkaline',
        ],
        correctIndex: 2,
      },
    ],
  },

  'fallback-financial-literacy': {
    lessons: [
      {
        id: 'fl-1',
        title: 'Why Farm Records Matter',
        content: [
          'Farm record keeping is the practice of writing down everything that happens on your farm: what you plant, what you spend, what you earn, and what you harvest. Many African farmers rely on memory alone, but as operations grow beyond subsistence, accurate records become essential for making profitable decisions.',
          'Records help you understand which crops are profitable and which are not. Without written data, a farmer might continue growing a crop that actually costs more to produce than it earns. With records, you can compare the cost of seeds, fertilizer, and labor against revenue from sales to see your true profit or loss for each enterprise.',
          'Banks and microfinance institutions require records before approving agricultural loans. They want to see evidence that your farm generates income and that you manage money responsibly. A farmer with six months of organized income and expense records has a much stronger loan application than one who can only estimate figures from memory.',
          'Start simple. Use a notebook with columns for date, description, money in, and money out. Record every transaction the day it happens. Even mobile phone notes work. The key is consistency. Within one season of recording, you will have clear visibility into your farm business that most of your neighbors lack.',
        ],
        keyTakeaways: [
          'Records reveal which crops are truly profitable versus which ones lose money',
          'Lenders require documented income and expense history for loan approval',
          'Start with a simple notebook: date, description, money in, money out',
        ],
      },
      {
        id: 'fl-2',
        title: 'Income and Expense Tracking',
        content: [
          'Income tracking captures all money flowing into your farm. This includes crop sales, livestock sales, eggs, milk, honey, value-added products, government subsidies, and any services you provide to other farmers. Record the date, item sold, quantity, price per unit, total received, and buyer name for every transaction.',
          'Expense tracking captures everything you spend. Common farm expenses include seeds, fertilizer, pesticides, fuel, equipment rental, hired labor, transport, veterinary costs, land rent, and loan repayments. Record the date, item purchased, quantity, unit cost, total paid, and supplier for each expense.',
          'Separate your farm expenses from your household expenses. Many smallholder farmers mix the two, making it impossible to know whether the farm itself is profitable. Keep a separate notebook or account for farm transactions only. If you use farm produce at home, record it as a withdrawal at market value.',
          'At the end of each month, total your income and expenses. The difference is your monthly cash flow. Positive cash flow means your farm earned more than it spent. Negative cash flow means you need to investigate why costs exceeded revenue. Track this monthly pattern over a full year to see seasonal trends and plan your cash needs in advance.',
        ],
        keyTakeaways: [
          'Record every sale with date, quantity, price, and buyer details',
          'Keep farm finances strictly separate from household spending',
          'Calculate monthly cash flow to spot problems early and plan ahead',
        ],
      },
      {
        id: 'fl-3',
        title: 'Calculating Profit per Hectare',
        content: [
          'Profit per hectare is the most important metric for comparing crop performance on your farm. It tells you how much money each unit of land actually earns after all costs are deducted. Without this number, you cannot make rational decisions about what to plant next season.',
          'To calculate profit per hectare, first total all income from that hectare of crop: the harvest quantity multiplied by the selling price. Then total all costs: land preparation, seeds, fertilizer, pesticides, labor for planting, weeding, and harvesting, plus transport and storage. Subtract total costs from total income to get your net profit per hectare.',
          'Compare profit per hectare across your different crops. You might find that a "low-value" crop like beans actually generates higher profit per hectare than a "high-value" crop like tomatoes, because tomatoes have much higher input costs and post-harvest losses. These insights only become visible when you calculate systematically.',
          'Use this metric to plan your next season. Allocate more land to crops with higher profit per hectare, while maintaining some diversity for food security and risk management. Also factor in labor intensity: a crop that earns slightly less per hectare but requires half the labor might be the smarter choice if labor is your biggest constraint.',
        ],
        keyTakeaways: [
          'Profit per hectare = total income from crop minus total costs on that land',
          'Lower-value crops may actually be more profitable when all costs are counted',
          'Use profit data to allocate land, but maintain crop diversity for risk management',
        ],
      },
      {
        id: 'fl-4',
        title: 'Preparing for Loan Applications',
        content: [
          'Agricultural loans can transform a farm by funding irrigation equipment, improved seeds, storage facilities, or land expansion. However, African smallholder farmers are often rejected because they cannot demonstrate creditworthiness. Preparing a strong application starts months before you walk into the bank.',
          'Gather at least six months of organized farm records showing consistent income. Prepare a simple one-page farm profile: your name, location, farm size, crops grown, average seasonal revenue, and main buyers. Add a brief plan explaining what you will do with the loan and how it will increase your income. For example, buying a water pump will extend your growing season and generate an estimated additional revenue that covers the loan repayment.',
          'Understand the loan terms before applying. Key factors include the interest rate (annual percentage), repayment schedule (monthly, quarterly, or after harvest), collateral requirements (land title, group guarantee, or savings), and penalties for late payment. Compare offers from multiple institutions: commercial banks, microfinance organizations, savings cooperatives (SACCOs), and mobile lending platforms.',
          'Consider starting with smaller loans to build a repayment track record. Successful repayment of a small loan makes you eligible for larger amounts in subsequent cycles. Many cooperative-based lending programs offer lower rates and flexible repayment terms aligned with harvest seasons, which can be a better fit for smallholder farmers than standard monthly bank repayments.',
        ],
        keyTakeaways: [
          'Prepare six-plus months of farm records and a simple farm profile before applying',
          'Always compare interest rates and repayment terms across multiple lenders',
          'Start small to build a repayment history, then access larger loans in future cycles',
        ],
      },
    ],
    quiz: [
      {
        question: 'What is the most important reason to keep farm records?',
        options: [
          'To impress your neighbors',
          'To know which crops are truly profitable',
          'Government requires it by law',
          'To track the weather',
        ],
        correctIndex: 1,
      },
      {
        question: 'What should you calculate to compare performance across different crops?',
        options: ['Total farm income', 'Profit per hectare', 'Total seeds planted', 'Number of laborers'],
        correctIndex: 1,
      },
      {
        question: 'What is the recommended minimum record-keeping period before applying for a farm loan?',
        options: ['One week', 'One month', 'Six months', 'Five years'],
        correctIndex: 2,
      },
    ],
  },

  'fallback-digital-agriculture': {
    lessons: [
      {
        id: 'da-1',
        title: 'Drip Irrigation Basics',
        content: [
          'Drip irrigation delivers water directly to the root zone of each plant through a network of tubes, pipes, and emitters. Unlike flood irrigation, which wastes 40 to 60 percent of water to evaporation and runoff, drip systems can achieve 90 to 95 percent water efficiency. For African farmers facing increasing water scarcity, this technology is transformative.',
          'A basic drip system consists of a water source (tank, borehole, or river), a filter to prevent clogging, a main supply line, sub-main lines running along crop rows, and drip emitters or drip tape that release water slowly at each plant. Low-pressure systems using elevated tanks (gravity-fed) are affordable and require no electricity, making them ideal for off-grid smallholder farms.',
          'The cost of a basic gravity-fed drip system for a quarter-hectare plot ranges from $100 to $300 USD depending on the region. While this is a significant investment for smallholders, the savings in water, reduced labor for watering, and increased yields typically pay back the investment within one to two seasons, especially for high-value vegetables and fruits.',
          'Maintenance is critical for drip system longevity. Flush the lines weekly to prevent sediment buildup. Check emitters monthly for clogs, cleaning them with a thin wire or replacing them. Use filtration appropriate to your water source: mesh filters for clean borehole water, disc or sand filters for river water. A well-maintained system lasts five to ten years.',
        ],
        keyTakeaways: [
          'Drip irrigation uses 90-95% of water efficiently versus 40-60% for flood irrigation',
          'Gravity-fed systems need no electricity and cost $100-300 for a quarter hectare',
          'Flush lines weekly and check emitters monthly to prevent clogs and extend system life',
        ],
      },
      {
        id: 'da-2',
        title: 'Rainwater Harvesting',
        content: [
          'Rainwater harvesting captures and stores rain for use during dry periods. In much of sub-Saharan Africa, rainfall is concentrated in distinct wet seasons, and the ability to store water from these periods determines whether a farmer can grow crops year-round or is limited to a single rainy season.',
          'Roof catchment is the simplest method: gutters channel rain from a building roof into storage tanks or underground cisterns. A 100-square-meter roof in an area receiving 800mm of annual rainfall can capture up to 64,000 liters per year. Even a small iron-roofed house can supply enough water for a kitchen garden through the dry season.',
          'Field-level rainwater harvesting includes techniques like contour bunds (low earthen walls along slope contours), half-moon micro-catchments, and zai pits (planting pits that concentrate water and compost). These ancient techniques, practiced across the Sahel for centuries, dramatically improve crop survival in semi-arid zones where rainfall is erratic.',
          'Storage options range from ferrocement tanks and plastic drums for roof catchment to farm ponds lined with clay or plastic sheeting for larger volumes. When choosing a storage method, consider your budget, the volume needed, evaporation losses (open ponds lose significant water), and local materials available. Community-scale storage dams and sand dams are effective for group water projects.',
        ],
        keyTakeaways: [
          'A 100m2 roof in an 800mm rainfall zone can capture 64,000 liters per year',
          'Contour bunds, half-moons, and zai pits are proven Sahel water harvesting methods',
          'Match your storage method to budget, volume needs, and locally available materials',
        ],
      },
      {
        id: 'da-3',
        title: 'Mulching for Moisture Retention',
        content: [
          'Mulching is the practice of covering the soil surface around plants with organic or inorganic material to reduce evaporation, suppress weeds, and moderate soil temperature. In hot African climates, unmulched soil can lose 5 to 10 millimeters of water per day to evaporation. A good mulch layer cuts this by 50 to 70 percent.',
          'Organic mulch materials available on most African farms include dried grass, crop residues (maize stalks, rice straw, bean vines), dried leaves, and wood chips. Apply a layer 5 to 10 centimeters thick around plants, keeping mulch a few centimeters away from stems to prevent rot. As organic mulch decomposes, it feeds the soil with nutrients and supports beneficial soil organisms.',
          'Plastic mulch (polyethylene film) is used in commercial horticulture for high-value crops like strawberries and peppers. Black plastic suppresses weeds and warms soil. Silver-colored film repels certain insect pests. While effective, plastic mulch is more expensive, creates waste that does not decompose, and is less suitable for subsistence farming systems.',
          'Timing matters. Apply mulch after planting and initial watering, once seedlings are established. For perennial crops like fruit trees, maintain mulch year-round in a wide circle extending to the tree canopy drip line. Combine mulching with drip irrigation for maximum water efficiency. Farmers using both techniques together often reduce water use by 60 to 80 percent compared to overhead irrigation on bare soil.',
        ],
        keyTakeaways: [
          'Mulching reduces soil water loss by 50-70% in hot climates',
          'Use locally available materials: dried grass, crop residues, leaves at 5-10cm depth',
          'Combine mulching with drip irrigation for 60-80% water savings over bare-soil methods',
        ],
      },
      {
        id: 'da-4',
        title: 'Scheduling Irrigation by Crop Stage',
        content: [
          'Different crops have different water needs at different growth stages. Providing the right amount of water at the right time is called irrigation scheduling. Poor scheduling either wastes water during low-demand periods or causes yield-reducing stress during critical growth stages.',
          'Most cereal crops (maize, sorghum, millet) have four key stages: germination and establishment (moderate water need), vegetative growth (increasing need), flowering and grain fill (maximum need, the critical period), and maturation (decreasing need, often irrigation stops). Missing water during flowering can reduce yields by 40 to 60 percent, even if water was adequate at all other stages.',
          'Vegetable crops generally need consistent moisture throughout their cycle, but fruiting vegetables (tomatoes, peppers, eggplant) are especially sensitive during flower set and fruit development. Irregular watering during these stages causes blossom end rot, cracking, and poor fruit quality. Leafy vegetables (kale, spinach, lettuce) need steady shallow irrigation since their roots are concentrated in the top 30 centimeters.',
          'Simple tools for scheduling include the hand-feel method (squeeze soil to assess moisture), tensiometers (tubes that measure soil suction), and crop evapotranspiration (ET) tables provided by agricultural agencies. As a general rule, irrigate when the top 10 centimeters of soil feels dry for shallow-rooted crops, or when the top 20 to 30 centimeters feels dry for deeper-rooted crops. Water deeply but less frequently to encourage deep root growth.',
        ],
        keyTakeaways: [
          'Crop water needs vary by growth stage; flowering is usually the most critical period',
          'Missing irrigation during flowering can cut yields by 40-60% even if other stages are fine',
          'Water deeply but less frequently to encourage strong, deep root development',
        ],
      },
    ],
    quiz: [
      {
        question: 'What water efficiency can drip irrigation achieve compared to flood irrigation?',
        options: ['40-50%', '60-70%', '90-95%', '100%'],
        correctIndex: 2,
      },
      {
        question: 'By how much can mulching reduce soil water loss in hot climates?',
        options: ['10-20%', '25-35%', '50-70%', '90-100%'],
        correctIndex: 2,
      },
      {
        question: 'Which crop growth stage is typically the most critical for irrigation?',
        options: ['Germination', 'Vegetative growth', 'Flowering and grain fill', 'Maturation'],
        correctIndex: 2,
      },
    ],
  },

  'fallback-advanced-trading': {
    lessons: [
      {
        id: 'at-1',
        title: 'Common Fungal Diseases in Africa',
        content: [
          'Fungal diseases are the most prevalent crop diseases in African agriculture, responsible for estimated yield losses of 10 to 30 percent annually. Warm, humid conditions that characterize much of tropical and subtropical Africa create ideal environments for fungal pathogens to thrive and spread rapidly through crop fields.',
          'Maize Lethal Necrosis (caused by a virus-fungus complex) and Grey Leaf Spot are devastating maize diseases across East and Southern Africa. Coffee Berry Disease threatens the livelihoods of millions of coffee farmers in Ethiopia, Kenya, and Tanzania. Black Sigatoka ravages banana plantations, while cassava anthracnose causes significant losses in West and Central Africa.',
          'Early identification is critical. Look for these warning signs: unusual spots or lesions on leaves (often with defined margins or concentric rings), powdery or downy coatings on leaf surfaces, wilting despite adequate water, rotting of stems or fruits with fuzzy growth, and yellowing or browning patterns that do not match nutrient deficiency symptoms.',
          'Prevention starts with resistant varieties, which are often available from national agricultural research institutions. Practice crop rotation so fungal spores in the soil do not accumulate. Remove and destroy (do not compost) infected plant material. Ensure adequate spacing between plants for air circulation. If fungal disease is established, consult your extension officer about appropriate fungicide options before applying any chemicals.',
        ],
        keyTakeaways: [
          'Fungal diseases cause 10-30% yield losses in Africa; warm humid conditions accelerate spread',
          'Watch for leaf spots, powdery coatings, wilting, and unusual rotting patterns',
          'Use resistant varieties, crop rotation, and remove infected material as first defenses',
        ],
      },
      {
        id: 'at-2',
        title: 'Bacterial and Viral Infections',
        content: [
          'Bacterial diseases in African crops include Bacterial Wilt of tomatoes and potatoes, Banana Xanthomonas Wilt (BXW), and Cassava Bacterial Blight. These diseases spread through contaminated tools, infected planting material, rain splash, and insect vectors. Unlike fungal diseases, bacterial infections cannot be treated with fungicides once established.',
          'Viral diseases are among the most destructive in African agriculture. Cassava Mosaic Disease (CMD) and Cassava Brown Streak Disease (CBSD) together threaten the food security of 300 million people who depend on cassava. Maize Streak Virus, transmitted by leafhoppers, and Tomato Yellow Leaf Curl Virus, spread by whiteflies, are also widespread and devastating.',
          'Viral diseases are identified by mosaic patterns (mottled light and dark patches on leaves), leaf curling, stunting, and deformation of fruits. There are no cures for plant viruses once a plant is infected. Control focuses entirely on prevention: using certified virus-free planting material, controlling insect vectors, removing and destroying infected plants promptly, and planting resistant varieties.',
          'Hygiene is your strongest weapon against both bacterial and viral diseases. Sterilize cutting tools between plants using bleach solution or a flame. Do not save seed from infected plants. Buy certified planting material from reputable sources. Manage insect vectors (whiteflies, aphids, leafhoppers) to break transmission cycles. Report unusual disease outbreaks to your local extension office so they can respond before it spreads through the community.',
        ],
        keyTakeaways: [
          'Bacterial and viral crop diseases have no chemical cure once plants are infected',
          'Prevention is everything: certified planting material, tool hygiene, vector control',
          'Report unusual disease patterns to extension services to protect the wider community',
        ],
      },
      {
        id: 'at-3',
        title: 'Integrated Pest Management (IPM)',
        content: [
          'Integrated Pest Management is a sustainable approach that combines multiple strategies to manage pests while minimizing chemical use, cost, and environmental harm. IPM does not reject chemicals entirely, but positions them as a last resort after other methods have been tried. This approach is particularly suited to African smallholder farming where chemical inputs are expensive and often misused.',
          'The IPM pyramid has four levels. The base is prevention: choose resistant varieties, practice crop rotation, maintain healthy soil, and plant at optimal timing to avoid peak pest seasons. The second level is monitoring: regularly scout your fields to detect pests early and identify whether they have reached levels that justify action (the economic threshold).',
          'The third level is biological and cultural control. Encourage natural predators like ladybugs, lacewings, parasitic wasps, and spiders by maintaining field margins with flowering plants. Use trap crops to lure pests away from your main crop. Practice push-pull technology, developed in East Africa, which uses Napier grass (pull) and Desmodium (push) to manage stem borers and Striga weed in maize simultaneously.',
          'Chemical control sits at the top of the pyramid, used only when other methods are insufficient and pest damage exceeds the economic threshold. When chemicals are necessary, use targeted products (not broad-spectrum), apply at the correct dosage and timing, rotate chemical classes to prevent resistance, and always follow safety guidelines including protective equipment. Never apply pesticides within the pre-harvest interval for your crop.',
        ],
        keyTakeaways: [
          'IPM uses chemicals only as a last resort after prevention, monitoring, and biological control',
          'Push-pull technology (Napier grass + Desmodium) controls stem borers and Striga in maize',
          'When chemicals are needed, use targeted products, correct dosage, and follow safety intervals',
        ],
      },
      {
        id: 'at-4',
        title: 'When to Use Chemical vs Organic Treatment',
        content: [
          'The decision between chemical and organic disease and pest treatment depends on several factors: the severity of the problem, the crop value, available resources, market requirements, and long-term soil health goals. There is no single right answer; successful farmers learn when each approach is appropriate.',
          'Organic treatments should be your first line of defense for most situations. Neem oil and neem leaf extracts are effective against a wide range of insect pests and some fungal diseases. Wood ash mixed with water controls some soft-bodied insects. Chili-garlic sprays repel many pests. Trichoderma (a beneficial fungus) applied to soil prevents several root diseases. These treatments are low-cost, locally available, and safe for the environment.',
          'Chemical treatments become necessary when organic methods cannot contain a rapidly spreading epidemic that threatens significant yield loss, when you are dealing with regulated quarantine pests that must be eradicated, or when the economic value of the crop justifies the additional expense. Commercial export crops often require chemical treatments to meet international phytosanitary standards.',
          'If you choose chemical treatment, always positively identify the pest or disease first. Using the wrong chemical wastes money and may worsen the problem by killing beneficial organisms. Buy from licensed dealers, check expiry dates, read and follow label instructions precisely, wear protective clothing, and store chemicals safely away from food, water, and children. Keep records of all chemical applications, as buyers and certification programs increasingly require spray records.',
        ],
        keyTakeaways: [
          'Organic treatments (neem, wood ash, chili-garlic, Trichoderma) should be the first approach',
          'Use chemicals only when organic methods fail and economic loss justifies the cost',
          'Always identify the specific pest/disease before choosing any treatment; record all applications',
        ],
      },
    ],
    quiz: [
      {
        question: 'What is the primary defense against plant viral diseases?',
        options: [
          'Fungicide spray',
          'Prevention (certified seed, vector control, removing infected plants)',
          'Antibiotics',
          'Extra irrigation',
        ],
        correctIndex: 1,
      },
      {
        question: 'In IPM, when should chemical pesticides be used?',
        options: [
          'At the first sign of any pest',
          'Every two weeks as a preventive spray',
          'Only as a last resort when other methods are insufficient',
          'Only during the rainy season',
        ],
        correctIndex: 2,
      },
      {
        question: 'Which organic pest treatment is effective against a wide range of insects and some fungi?',
        options: ['Sugar water', 'Neem oil', 'Salt solution', 'Cooking oil'],
        correctIndex: 1,
      },
    ],
  },
};

// Helper: get lesson content for a course, generating generic content if not found
function getCourseContent(courseId: string, course: Course): CourseContent {
  if (COURSE_LESSON_CONTENT[courseId]) return COURSE_LESSON_CONTENT[courseId];

  // Generate generic lessons for DB-sourced courses
  const lessonCount = Math.min(course.lesson_count || 4, 5);
  const lessons: Lesson[] = [];
  for (let i = 0; i < lessonCount; i++) {
    lessons.push({
      id: `${courseId}-gen-${i}`,
      title: `${course.title} - Module ${i + 1}`,
      content: [
        `Welcome to module ${i + 1} of ${course.title}. This lesson covers essential concepts for the ${course.category} area of African farming.`,
        `As you progress through this module, pay attention to how these concepts apply to your specific farming context and region. Every farm is different, and the best farmers adapt general knowledge to their local conditions.`,
        `Discuss what you learn here with other farmers in your cooperative or community. Sharing knowledge multiplies its impact across the farming community.`,
      ],
      keyTakeaways: [
        `Core concept ${i + 1} for ${course.category}`,
        'Apply these ideas to your specific farm conditions',
        'Share knowledge with your farming community',
      ],
    });
  }
  return {
    lessons,
    quiz: [
      {
        question: `What is the main focus of the ${course.title} course?`,
        options: [course.category, 'Cooking', 'Transportation', 'Entertainment'],
        correctIndex: 0,
      },
      {
        question: 'Why is it important to adapt knowledge to your local conditions?',
        options: [
          'It is not important',
          'Every farm and region is different',
          'Only for export farms',
          'Only during dry season',
        ],
        correctIndex: 1,
      },
      {
        question: 'What multiplies the impact of farming knowledge?',
        options: [
          'Keeping it secret',
          'Writing it in English only',
          'Sharing with other farmers',
          'Posting on social media',
        ],
        correctIndex: 2,
      },
    ],
  };
}

// ── Hardcoded Fallback Courses ────────────────────────────────────────────

const FALLBACK_COURSES: Course[] = [
  {
    id: 'fallback-farm-basics',
    title: 'Soil Health Fundamentals',
    description:
      'Learn about soil types, pH testing, composting, and cover crops to build the foundation for productive African farming.',
    duration_hours: 2,
    difficulty: 'Beginner',
    lesson_count: 4,
    tier_unlock: 'sprout',
    slug: 'farm-basics',
    category: 'Foundation',
  },
  {
    id: 'fallback-financial-literacy',
    title: 'Financial Record Keeping',
    description:
      'Master farm record keeping, income and expense tracking, profit analysis, and loan preparation.',
    duration_hours: 3,
    difficulty: 'Beginner',
    lesson_count: 4,
    tier_unlock: 'growth',
    slug: 'financial-literacy',
    category: 'Finance',
  },
  {
    id: 'fallback-digital-agriculture',
    title: 'Water Conservation',
    description:
      'Drip irrigation, rainwater harvesting, mulching techniques, and crop-stage irrigation scheduling.',
    duration_hours: 4,
    difficulty: 'Intermediate',
    lesson_count: 4,
    tier_unlock: 'harvest',
    slug: 'digital-agriculture',
    category: 'Technology',
  },
  {
    id: 'fallback-advanced-trading',
    title: 'Crop Disease Identification',
    description:
      'Identify fungal, bacterial, and viral crop diseases. Learn integrated pest management and treatment decisions.',
    duration_hours: 5,
    difficulty: 'Advanced',
    lesson_count: 4,
    tier_unlock: 'pioneer',
    slug: 'advanced-trading',
    category: 'Commerce',
  },
];

// ── Tier → Course Mapping ─────────────────────────────────────────────────

const TIER_COURSE_MAP: Record<string, string> = {
  'farm-basics': 'sprout',
  'financial-literacy': 'growth',
  'digital-agriculture': 'harvest',
  'advanced-trading': 'pioneer',
};

const TIER_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  sprout: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  growth: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  harvest: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  pioneer: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
};

// ── Component ─────────────────────────────────────────────────────────────

export default function TrainingPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [completions, setCompletions] = useState<CourseCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<FarmerTier>('seedling');
  const [celebrateCourse, setCelebrateCourse] = useState<string | null>(null);

  // ── Lesson viewer state ────────────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [lessonCompletions, setLessonCompletions] = useState<Record<string, Set<string>>>({});
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // ── Fetch courses: site_config → courses table → hardcoded fallback ───

  const fetchCourses = useCallback(async () => {
    try {
      // 1. Check site_config for admin-managed training catalog
      const { data: configRow } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'training_catalog')
        .single();

      if (configRow?.value) {
        const parsed = typeof configRow.value === 'string'
          ? JSON.parse(configRow.value)
          : configRow.value;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: Course[] = parsed.map((c: Record<string, unknown>, idx: number) => ({
            id: (c.id as string) || `config-${idx}`,
            title: (c.title as string) || '',
            description: (c.description as string) || '',
            duration_hours: Number(c.duration_hours) || Math.round((Number(c.duration_minutes) || 120) / 60),
            difficulty: (c.difficulty as string) || 'Beginner',
            lesson_count: Number(c.lesson_count) || Number(c.modules_count) || 5,
            tier_unlock: (c.tier_unlock as string) || TIER_COURSE_MAP[((c.category as string) || '').toLowerCase().replace(/\s+/g, '-')] || 'sprout',
            slug: (c.slug as string) || ((c.category as string) || '').toLowerCase().replace(/\s+/g, '-') || `course-${idx}`,
            category: (c.category as string) || 'General',
          }));
          setCourses(mapped);
          return;
        }
      }
    } catch {
      // site_config fetch failed — fall through to courses table
    }

    try {
      // 2. Fetch from courses table
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        setCourses(FALLBACK_COURSES);
      } else {
        // Map DB courses to our Course shape, fallback where needed
        interface CourseDbRow {
          id: string;
          title: string;
          description: string | null;
          duration_minutes: number | null;
          difficulty: string | null;
          modules_count: number | null;
          category: string | null;
        }
        const mapped: Course[] = (data as CourseDbRow[]).map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description || '',
          duration_hours: Math.round((c.duration_minutes || 120) / 60),
          difficulty: c.difficulty || 'Beginner',
          lesson_count: c.modules_count || 5,
          tier_unlock: TIER_COURSE_MAP[c.category?.toLowerCase().replace(/\s+/g, '-') ?? ''] || 'sprout',
          slug: c.category?.toLowerCase().replace(/\s+/g, '-') || c.id,
          category: c.category || 'General',
        }));
        setCourses(mapped.length > 0 ? mapped : FALLBACK_COURSES);
      }
    } catch {
      setCourses(FALLBACK_COURSES);
    }
  }, [supabase]);

  // ── Fetch completions ─────────────────────────────────────────────────

  const fetchCompletions = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('course_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (data) {
        setCompletions(data as CourseCompletion[]);
      }
    } catch {
      // Completions table may not exist yet — silent fail
    }
  }, [supabase, user]);

  // ── Load lesson progress from localStorage ─────────────────────────────

  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`afu_lesson_progress_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string[]>;
        const mapped: Record<string, Set<string>> = {};
        for (const [courseId, lessonIds] of Object.entries(parsed)) {
          mapped[courseId] = new Set(lessonIds);
        }
        setLessonCompletions(mapped);
      }
    } catch {
      // Silent fail — localStorage may be unavailable
    }
  }, [user]);

  const saveLessonProgress = useCallback(
    (updated: Record<string, Set<string>>) => {
      if (!user) return;
      try {
        const serializable: Record<string, string[]> = {};
        for (const [courseId, lessonIds] of Object.entries(updated)) {
          serializable[courseId] = Array.from(lessonIds);
        }
        localStorage.setItem(`afu_lesson_progress_${user.id}`, JSON.stringify(serializable));
      } catch {
        // Silent fail
      }
    },
    [user]
  );

  // ── Lesson viewer helpers ─────────────────────────────────────────────

  const openCourse = (course: Course) => {
    setSelectedCourse(course);
    // Start at first incomplete lesson
    const content = getCourseContent(course.id, course);
    const completed = lessonCompletions[course.id] || new Set<string>();
    const firstIncomplete = content.lessons.findIndex((l) => !completed.has(l.id));
    setCurrentLessonIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setShowCertificate(false);
  };

  const closeCourseViewer = () => {
    setSelectedCourse(null);
    setCurrentLessonIndex(0);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setShowCertificate(false);
  };

  const completeLesson = (courseId: string, lessonId: string) => {
    setLessonCompletions((prev) => {
      const updated = { ...prev };
      const courseSet = new Set(prev[courseId] || []);
      courseSet.add(lessonId);
      updated[courseId] = courseSet;
      saveLessonProgress(updated);
      return updated;
    });
  };

  const getLessonProgress = (courseId: string, totalLessons: number) => {
    const completed = lessonCompletions[courseId]?.size || 0;
    return { completed, total: totalLessons, percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0 };
  };

  const getQuizScore = (courseId: string) => {
    const content = getCourseContent(courseId, selectedCourse!);
    let correct = 0;
    content.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) correct++;
    });
    return { correct, total: content.quiz.length };
  };

  // ── Determine current tier from completions ───────────────────────────

  useEffect(() => {
    const completedSlugs = new Set(completions.map((c) => c.tier_unlocked));
    let tier: FarmerTier = 'seedling';
    if (completedSlugs.has('pioneer')) tier = 'pioneer';
    else if (completedSlugs.has('harvest')) tier = 'harvest';
    else if (completedSlugs.has('growth')) tier = 'growth';
    else if (completedSlugs.has('sprout')) tier = 'sprout';
    setCurrentTier(tier);
  }, [completions]);

  // ── Initial load ──────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchCompletions()]);
      setLoading(false);
    };
    load();
  }, [fetchCourses, fetchCompletions]);

  // ── Complete a course ─────────────────────────────────────────────────

  const completeCourse = async (course: Course) => {
    if (!user) return;
    setCompleting(course.id);

    try {
      await supabase.from('course_completions').insert({
        course_id: course.id,
        user_id: user.id,
        completed_at: new Date().toISOString(),
        course_title: course.title,
        tier_unlocked: course.tier_unlock,
      });

      setCelebrateCourse(course.id);
      setTimeout(() => setCelebrateCourse(null), 2500);
      await fetchCompletions();
    } catch {
      // Silent fail
    }
    setCompleting(null);
  };

  const isCompleted = (courseId: string) =>
    completions.some((c) => c.course_id === courseId);

  // ── Group courses by tier ─────────────────────────────────────────────

  const coursesByTier = TIER_ORDER.slice(1).map((tier) => ({
    tier,
    config: FARMER_TIERS[tier],
    courses: courses.filter((c) => c.tier_unlock === tier),
  }));

  const completedCourses = completions;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0F1A2E] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, #5DB347 0%, transparent 50%), radial-gradient(circle at 70% 80%, #449933 0%, transparent 50%)',
          }}
        />
        <div className="relative px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Training Hub
            </h1>
            <p className="text-white/60 text-sm sm:text-base max-w-2xl">
              Complete courses to unlock new tiers and platform features. Each
              course advances your farming journey on the AFU platform.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Tier Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl shadow-black/10"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">{FARMER_TIERS[currentTier].emoji}</span>
            Your Progress
          </h2>
          <TierProgress
            currentTier={currentTier}
            totalXp={completions.length * 100}
            totalCoursesCompleted={completions.length}
          />
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-[#5DB347] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/50 text-sm">Loading courses...</p>
            </div>
          </div>
        )}

        {/* Course Sections by Tier */}
        {!loading &&
          coursesByTier.map(({ tier, config, courses: tierCourses }, sectionIdx) => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + sectionIdx * 0.1 }}
            >
              {/* Tier Section Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg"
                  style={{ backgroundColor: `${config.color}25` }}
                >
                  {config.emoji}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Unlock {config.name} Tier
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: `${config.color}25`,
                        color: config.color,
                      }}
                    >
                      {config.description}
                    </span>
                  </h2>
                  <p className="text-white/40 text-xs">
                    Complete the course below to unlock {config.name} features
                  </p>
                </div>
              </div>

              {/* Course Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tierCourses.length === 0 && (
                  <div className="col-span-full bg-white/5 rounded-2xl p-6 text-center border border-white/5">
                    <p className="text-white/30 text-sm">
                      No courses available for this tier yet.
                    </p>
                  </div>
                )}
                {tierCourses.map((course, idx) => {
                  const completed = isCompleted(course.id);
                  const isCelebrating = celebrateCourse === course.id;
                  const tierStyle = TIER_BADGE_STYLES[course.tier_unlock] || TIER_BADGE_STYLES.sprout;
                  const difficultyStyle = DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.Beginner;

                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={`relative group bg-white/[0.07] backdrop-blur-xl rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 ${
                        completed
                          ? 'border-[#5DB347]/30 bg-[#5DB347]/[0.05]'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Celebration Overlay */}
                      <AnimatePresence>
                        {isCelebrating && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-3xl backdrop-blur-sm"
                          >
                            <motion.div
                              initial={{ scale: 0.5, y: 20 }}
                              animate={{ scale: 1, y: 0 }}
                              className="text-center"
                            >
                              <motion.span
                                className="text-5xl block mb-2"
                                animate={{
                                  rotate: [0, -15, 15, -15, 0],
                                  scale: [1, 1.3, 1],
                                }}
                                transition={{ duration: 0.6 }}
                              >
                                {config.emoji}
                              </motion.span>
                              <p className="text-white font-bold text-sm">
                                Course Completed!
                              </p>
                              <p className="text-[#5DB347] text-xs font-semibold mt-1">
                                {config.name} tier unlocked
                              </p>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Completed Badge */}
                      {completed && (
                        <div className="absolute top-3 right-3">
                          <div className="w-7 h-7 rounded-full bg-[#5DB347] flex items-center justify-center shadow-lg shadow-[#5DB347]/30">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Tier Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                        >
                          {config.emoji} Unlocks {config.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyStyle}`}
                        >
                          {course.difficulty}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-[#5DB347] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Meta Row */}
                      <div className="flex items-center gap-3 mb-4 text-white/40 text-[11px]">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {course.duration_hours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          {course.lesson_count} lessons
                        </span>
                      </div>

                      {/* Action Button */}
                      {(() => {
                        const progress = getLessonProgress(course.id, getCourseContent(course.id, course).lessons.length);
                        if (completed) {
                          return (
                            <button
                              onClick={() => openCourse(course)}
                              className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#5DB347] bg-[#5DB347]/10 border border-[#5DB347]/20 transition-all duration-300 hover:bg-[#5DB347]/20 flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Completed — Review
                            </button>
                          );
                        }
                        return (
                          <div className="space-y-2">
                            {progress.completed > 0 && (
                              <div>
                                <div className="flex justify-between text-[10px] text-white/40 mb-1">
                                  <span>{progress.completed}/{progress.total} lessons</span>
                                  <span>{progress.percent}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#5DB347] rounded-full transition-all duration-500"
                                    style={{ width: `${progress.percent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => openCourse(course)}
                              disabled={!user}
                              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: 'linear-gradient(135deg, #5DB347, #449933)',
                                boxShadow: '0 4px 15px rgba(93, 179, 71, 0.3)',
                              }}
                            >
                              {progress.completed > 0 ? 'Continue Course' : 'Start Course'}
                            </button>
                          </div>
                        );
                      })()}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

        {/* Completed Courses Section */}
        {!loading && completedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#5DB347]/20 flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-[#5DB347]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Completed Courses
                </h2>
                <p className="text-white/40 text-xs">
                  {completedCourses.length} course
                  {completedCourses.length !== 1 ? 's' : ''} completed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedCourses.map((completion, idx) => {
                const tierConfig = FARMER_TIERS[completion.tier_unlocked as FarmerTier];
                return (
                  <motion.div
                    key={completion.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-[#5DB347]/[0.07] backdrop-blur-xl rounded-2xl p-4 border border-[#5DB347]/20 flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{
                        backgroundColor: tierConfig ? `${tierConfig.color}20` : '#5DB34720',
                      }}
                    >
                      {tierConfig?.emoji || '✓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {completion.course_title}
                      </p>
                      <p className="text-[10px] text-white/40">
                        Completed{' '}
                        {new Date(completion.completed_at).toLocaleDateString()}
                        {tierConfig && (
                          <span className="ml-1.5" style={{ color: tierConfig.color }}>
                            — {tierConfig.name} unlocked
                          </span>
                        )}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-[#5DB347] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state when not logged in */}
        {!loading && !user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 text-center"
          >
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Sign in to track your progress
            </h3>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              Create an account or sign in to start courses, earn XP, and unlock
              new tiers on the AFU platform.
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Lesson Viewer Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCourse && (() => {
          const courseContent = getCourseContent(selectedCourse.id, selectedCourse);
          const lessons = courseContent.lessons;
          const completedLessons = lessonCompletions[selectedCourse.id] || new Set<string>();
          const allLessonsDone = lessons.every((l) => completedLessons.has(l.id));
          const courseAlreadyCompleted = isCompleted(selectedCourse.id);
          const currentLesson = lessons[currentLessonIndex];
          const tierConfig = FARMER_TIERS[selectedCourse.tier_unlock as FarmerTier];
          const progress = getLessonProgress(selectedCourse.id, lessons.length);

          return (
            <motion.div
              key="lesson-viewer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm py-4 px-4"
              onClick={(e) => { if (e.target === e.currentTarget) closeCourseViewer(); }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl bg-[#0F1A2E] border border-white/10 rounded-3xl shadow-2xl shadow-black/30 overflow-hidden my-4"
              >
                {/* Header */}
                <div className="relative px-6 py-5 border-b border-white/10 bg-white/[0.03]">
                  <button
                    onClick={closeCourseViewer}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: tierConfig ? `${tierConfig.color}25` : '#5DB34725' }}
                    >
                      {tierConfig?.emoji || '📚'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
                      <p className="text-white/40 text-xs">{selectedCourse.category} &middot; {selectedCourse.difficulty} &middot; {selectedCourse.duration_hours}h</p>
                    </div>
                  </div>
                  {/* Course progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#5DB347] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percent}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs text-white/50 font-medium whitespace-nowrap">
                      {progress.completed}/{progress.total} lessons
                    </span>
                  </div>
                </div>

                {/* Body: Sidebar + Content */}
                <div className="flex flex-col md:flex-row min-h-[60vh]">
                  {/* Lesson sidebar */}
                  <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02] p-4 space-y-1 flex-shrink-0 overflow-y-auto max-h-[30vh] md:max-h-[70vh]">
                    <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2 px-2">
                      Course Outline
                    </p>
                    {lessons.map((lesson, idx) => {
                      const done = completedLessons.has(lesson.id);
                      const isCurrent = !showQuiz && !showCertificate && idx === currentLessonIndex;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => { setCurrentLessonIndex(idx); setShowQuiz(false); setShowCertificate(false); }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-200 flex items-center gap-2.5 ${
                            isCurrent
                              ? 'bg-[#5DB347]/20 text-white border border-[#5DB347]/30'
                              : done
                              ? 'text-white/60 hover:bg-white/5'
                              : 'text-white/40 hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                            done
                              ? 'bg-[#5DB347] text-white'
                              : isCurrent
                              ? 'bg-[#5DB347]/30 text-[#5DB347]'
                              : 'bg-white/10 text-white/30'
                          }`}>
                            {done ? (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      );
                    })}
                    {/* Quiz entry in sidebar */}
                    <div className="pt-2 mt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          if (allLessonsDone) {
                            setShowQuiz(true);
                            setShowCertificate(false);
                          }
                        }}
                        disabled={!allLessonsDone}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-200 flex items-center gap-2.5 ${
                          showQuiz
                            ? 'bg-amber-500/20 text-white border border-amber-500/30'
                            : allLessonsDone
                            ? 'text-white/60 hover:bg-white/5'
                            : 'text-white/20 cursor-not-allowed'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] ${
                          showQuiz ? 'bg-amber-500/30 text-amber-400' : allLessonsDone ? 'bg-amber-500/10 text-amber-500/50' : 'bg-white/5 text-white/15'
                        }`}>
                          ?
                        </div>
                        <span className="truncate">Final Quiz</span>
                        {!allLessonsDone && (
                          <svg className="w-3 h-3 ml-auto text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Main content area */}
                  <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
                    <AnimatePresence mode="wait">
                      {/* ── Certificate View ── */}
                      {showCertificate && (
                        <motion.div
                          key="certificate"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex flex-col items-center justify-center py-10 text-center"
                        >
                          <div className="w-24 h-24 rounded-full bg-[#5DB347]/20 flex items-center justify-center mb-6">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1, rotate: [0, -10, 10, -5, 0] }}
                              transition={{ duration: 0.6, delay: 0.2 }}
                              className="text-5xl"
                            >
                              🏆
                            </motion.div>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Course Complete!</h3>
                          <p className="text-white/60 text-sm mb-1">
                            Congratulations on completing
                          </p>
                          <p className="text-[#5DB347] font-bold text-lg mb-4">{selectedCourse.title}</p>
                          {tierConfig && (
                            <div
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                              style={{ backgroundColor: `${tierConfig.color}20`, color: tierConfig.color }}
                            >
                              {tierConfig.emoji} {tierConfig.name} Tier Unlocked
                            </div>
                          )}
                          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 max-w-sm w-full mb-6">
                            <div className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Certificate of Completion</div>
                            <div className="text-white font-bold text-base mb-1">{selectedCourse.title}</div>
                            <div className="text-white/40 text-xs mb-3">AFU Training Hub</div>
                            <div className="h-px bg-white/10 mb-3" />
                            <div className="text-white/50 text-xs">
                              Completed on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                          </div>
                          <button
                            onClick={closeCourseViewer}
                            className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #5DB347, #449933)', boxShadow: '0 4px 15px rgba(93, 179, 71, 0.3)' }}
                          >
                            Back to Training Hub
                          </button>
                        </motion.div>
                      )}

                      {/* ── Quiz View ── */}
                      {showQuiz && !showCertificate && (
                        <motion.div
                          key="quiz"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-sm">
                              📝
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Final Quiz</h3>
                              <p className="text-white/40 text-xs">Test your knowledge — 3 questions</p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {courseContent.quiz.map((q, qIdx) => (
                              <div key={qIdx} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-sm font-semibold text-white mb-3">
                                  <span className="text-white/30 mr-2">Q{qIdx + 1}.</span>
                                  {q.question}
                                </p>
                                <div className="space-y-2">
                                  {q.options.map((option, oIdx) => {
                                    const selected = quizAnswers[qIdx] === oIdx;
                                    const isCorrect = oIdx === q.correctIndex;
                                    let optionStyle = 'border-white/10 hover:border-white/20 text-white/70 hover:text-white';
                                    if (quizSubmitted) {
                                      if (isCorrect) optionStyle = 'border-[#5DB347]/50 bg-[#5DB347]/10 text-[#5DB347]';
                                      else if (selected && !isCorrect) optionStyle = 'border-red-500/50 bg-red-500/10 text-red-400';
                                      else optionStyle = 'border-white/5 text-white/30';
                                    } else if (selected) {
                                      optionStyle = 'border-[#5DB347]/40 bg-[#5DB347]/10 text-white';
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        onClick={() => {
                                          if (!quizSubmitted) {
                                            setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
                                          }
                                        }}
                                        disabled={quizSubmitted}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xs border transition-all duration-200 flex items-center gap-3 ${optionStyle}`}
                                      >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                                          selected ? 'border-current bg-current/20' : 'border-current/30'
                                        }`}>
                                          {String.fromCharCode(65 + oIdx)}
                                        </div>
                                        {option}
                                        {quizSubmitted && isCorrect && (
                                          <svg className="w-4 h-4 ml-auto text-[#5DB347]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Quiz actions */}
                          <div className="mt-6 flex items-center gap-3">
                            {!quizSubmitted ? (
                              <button
                                onClick={() => setQuizSubmitted(true)}
                                disabled={Object.keys(quizAnswers).length < courseContent.quiz.length}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)', boxShadow: '0 4px 15px rgba(93, 179, 71, 0.3)' }}
                              >
                                Submit Answers
                              </button>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 text-sm">
                                  {(() => {
                                    const score = getQuizScore(selectedCourse.id);
                                    const passed = score.correct >= Math.ceil(score.total * 0.6);
                                    return (
                                      <span className={`font-bold ${passed ? 'text-[#5DB347]' : 'text-amber-400'}`}>
                                        {score.correct}/{score.total} correct {passed ? '— Passed!' : '— Try again'}
                                      </span>
                                    );
                                  })()}
                                </div>
                                {(() => {
                                  const score = getQuizScore(selectedCourse.id);
                                  const passed = score.correct >= Math.ceil(score.total * 0.6);
                                  if (passed && !courseAlreadyCompleted) {
                                    return (
                                      <button
                                        onClick={async () => {
                                          await completeCourse(selectedCourse);
                                          setShowQuiz(false);
                                          setShowCertificate(true);
                                        }}
                                        disabled={completing === selectedCourse.id}
                                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
                                        style={{ background: 'linear-gradient(135deg, #5DB347, #449933)', boxShadow: '0 4px 15px rgba(93, 179, 71, 0.3)' }}
                                      >
                                        {completing === selectedCourse.id ? (
                                          <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Completing...
                                          </span>
                                        ) : (
                                          'Complete Course & Get Certificate'
                                        )}
                                      </button>
                                    );
                                  } else if (passed && courseAlreadyCompleted) {
                                    return (
                                      <button
                                        onClick={() => { setShowQuiz(false); setShowCertificate(true); }}
                                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#5DB347] bg-[#5DB347]/10 border border-[#5DB347]/20 hover:bg-[#5DB347]/20 transition-all"
                                      >
                                        View Certificate
                                      </button>
                                    );
                                  } else {
                                    return (
                                      <button
                                        onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 transition-all"
                                      >
                                        Retry Quiz
                                      </button>
                                    );
                                  }
                                })()}
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* ── Lesson Content View ── */}
                      {!showQuiz && !showCertificate && currentLesson && (
                        <motion.div
                          key={`lesson-${currentLessonIndex}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {/* Lesson header */}
                          <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-wider mb-2">
                            <span>Lesson {currentLessonIndex + 1} of {lessons.length}</span>
                            {completedLessons.has(currentLesson.id) && (
                              <span className="text-[#5DB347] normal-case tracking-normal flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Completed
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-5">{currentLesson.title}</h3>

                          {/* Lesson paragraphs */}
                          <div className="space-y-4 mb-6">
                            {currentLesson.content.map((paragraph, pIdx) => (
                              <p key={pIdx} className="text-white/70 text-sm leading-relaxed">
                                {paragraph}
                              </p>
                            ))}
                          </div>

                          {/* Key Takeaways */}
                          <div className="bg-[#5DB347]/[0.07] rounded-2xl p-5 border border-[#5DB347]/20 mb-6">
                            <h4 className="text-sm font-bold text-[#5DB347] mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              Key Takeaways
                            </h4>
                            <ul className="space-y-2">
                              {currentLesson.keyTakeaways.map((takeaway, tIdx) => (
                                <li key={tIdx} className="text-white/60 text-xs leading-relaxed flex items-start gap-2">
                                  <span className="text-[#5DB347] mt-0.5 flex-shrink-0">&#9679;</span>
                                  {takeaway}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Lesson actions */}
                          <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                            <button
                              onClick={() => { setCurrentLessonIndex((prev) => Math.max(0, prev - 1)); }}
                              disabled={currentLessonIndex === 0}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/50 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              Previous
                            </button>

                            <div className="flex items-center gap-2">
                              {!completedLessons.has(currentLesson.id) && (
                                <button
                                  onClick={() => {
                                    completeLesson(selectedCourse.id, currentLesson.id);
                                    // Auto-advance to next lesson or quiz
                                    if (currentLessonIndex < lessons.length - 1) {
                                      setTimeout(() => setCurrentLessonIndex((prev) => prev + 1), 300);
                                    }
                                  }}
                                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
                                  style={{ background: 'linear-gradient(135deg, #5DB347, #449933)', boxShadow: '0 4px 12px rgba(93, 179, 71, 0.3)' }}
                                >
                                  Complete Lesson
                                </button>
                              )}

                              {currentLessonIndex < lessons.length - 1 ? (
                                <button
                                  onClick={() => setCurrentLessonIndex((prev) => prev + 1)}
                                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 bg-white/10 hover:bg-white/15 transition-all flex items-center gap-1.5"
                                >
                                  Next
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              ) : allLessonsDone ? (
                                <button
                                  onClick={() => { setShowQuiz(true); setQuizAnswers({}); setQuizSubmitted(false); }}
                                  className="px-5 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                                >
                                  Take Quiz
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
