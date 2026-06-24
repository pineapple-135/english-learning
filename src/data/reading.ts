import { ReadingPassage } from '../types';

export const readingPassages: ReadingPassage[] = [
  {
    id: 'reading-coffee',
    title: '咖啡的传奇之旅',
    titleEn: 'The Remarkable Journey of Coffee',
    category: '文化与历史',
    level: 'B1',
    wordCount: 320,
    estimatedTime: 6,
    unlocked: true,
    content: `Have you ever wondered how your morning cup of coffee came to be? The story of coffee is a fascinating one that spans centuries and continents.

According to popular legend, coffee was discovered in the 9th century by an Ethiopian goat herder named Kaldi. He noticed that his goats became unusually energetic after eating the red berries of a certain plant. Curious, Kaldi tried the berries himself and found that they gave him a similar burst of energy. Word of this remarkable discovery quickly spread.

By the 15th century, coffee was being cultivated and traded in the Arabian Peninsula. The first coffee houses, known as "qahveh khaneh", appeared in cities like Mecca and Constantinople. These establishments became important social centres where people gathered to listen to music, play chess, and discuss the news of the day. They were often called "schools of the wise" because of the lively conversations that took place inside.

Coffee reached Europe in the 17th century, brought by Venetian merchants. Although some religious leaders initially condemned the drink as the "bitter invention of Satan", it soon gained popularity. The first coffee house in England opened in Oxford in 1650, and within decades, these establishments had become hubs of intellectual life. Famous figures such as Isaac Newton and Jonathan Swift were known to frequent them.

Today, coffee is one of the most widely consumed beverages in the world, with over two billion cups drunk every single day. From humble beginnings in the highlands of Ethiopia, this remarkable drink has truly conquered the globe.`,
    vocabulary: [
      { word: 'herder', meaning: '牧人；牧民' },
      { word: 'energetic', meaning: '精力充沛的' },
      { word: 'cultivate', meaning: '种植；培养' },
      { word: 'establishment', meaning: '机构； establishments 企业' },
      { word: 'condemn', meaning: '谴责；指责' },
      { word: 'frequent', meaning: '常去；经常光顾' },
      { word: 'humble', meaning: '不起眼的；卑微的' },
      { word: 'beverage', meaning: '饮料' },
    ],
    questions: [
      {
        id: 'coffee-q1',
        type: 'multiple-choice',
        question: 'According to the legend, who first discovered the effects of coffee?',
        options: ['A Venetian merchant', 'An Ethiopian goat herder', 'An Arabian scholar', 'An English philosopher'],
        answer: 1,
        explanation: '第一段明确提到：an Ethiopian goat herder named Kaldi（一位名叫卡尔迪的埃塞俄比亚牧羊人）。',
      },
      {
        id: 'coffee-q2',
        type: 'true-false',
        question: 'The first coffee houses were sometimes referred to as "schools of the wise".',
        options: ['True', 'False'],
        answer: 0,
        explanation: '原文第三段提到 They were often called "schools of the wise"（它们常被称为"智者的学校"），故为 True。',
      },
      {
        id: 'coffee-q3',
        type: 'fill-blank',
        question: 'The first coffee house in England opened in the city of ______ in 1650.',
        answer: 'Oxford',
        explanation: '第四段提到 The first coffee house in England opened in Oxford in 1650。',
      },
      {
        id: 'coffee-q4',
        type: 'multiple-choice',
        question: 'What is the main idea of the passage?',
        options: [
          'How to make the perfect cup of coffee',
          'The history and global spread of coffee',
          'Why coffee is bad for your health',
          'Different types of coffee around the world',
        ],
        answer: 1,
        explanation: '全文讲述咖啡从发现到传播到全球的历史过程，主旨是"咖啡的历史与全球传播"。',
      },
    ],
  },
  {
    id: 'reading-migration',
    title: '动物迁徙的奥秘',
    titleEn: 'The Mystery of Animal Migration',
    category: '自然科学',
    level: 'B1+',
    wordCount: 360,
    estimatedTime: 7,
    unlocked: false,
    content: `Every year, billions of animals undertake incredible journeys across the globe. From the tiny monarch butterfly to the massive humpback whale, migration is one of nature's most spectacular phenomena. But how do these creatures navigate such vast distances with such astonishing precision?

For many years, scientists believed that migratory animals relied on a single navigation method. However, recent research has revealed that most species use a combination of techniques. Birds, for instance, are known to use the position of the sun and stars as a celestial compass. They also possess an internal magnetic sense that allows them to detect the Earth's magnetic field, essentially giving them a built-in GPS system.

The Arctic tern holds the record for the longest migration of any animal. Each year, it travels from its breeding grounds in the Arctic to the Antarctic and back again, a round trip of approximately 71,000 kilometres. Over its lifetime, a single Arctic tern can fly the equivalent of three trips to the moon and back.

What drives animals to undertake such exhausting journeys? The primary motivation is survival. Migration allows species to take advantage of seasonal abundances of food and to avoid harsh winter conditions. For many birds, the longer days in northern summers provide more time to feed their young, increasing the chances of survival.

Unfortunately, human activities are increasingly threatening these ancient migration routes. Habitat destruction, climate change, and the construction of barriers such as highways and dams can disrupt the delicate balance that has evolved over millions of years. Conservationists warn that if we do not take action to protect these routes, we may witness the disappearance of some of nature's most magnificent spectacles within our lifetime.`,
    vocabulary: [
      { word: 'undertake', meaning: '承担；着手做' },
      { word: 'spectacular', meaning: '壮观的；惊人的' },
      { word: 'navigate', meaning: '导航；航行' },
      { word: 'celestial', meaning: '天体的；天空的' },
      { word: 'breeding ground', meaning: '繁殖地' },
      { word: 'abundance', meaning: '丰富；充裕' },
      { word: 'habitat', meaning: '栖息地' },
      { word: 'conservationist', meaning: '自然保护主义者' },
    ],
    questions: [
      {
        id: 'migration-q1',
        type: 'multiple-choice',
        question: 'According to the passage, how do birds primarily navigate during migration?',
        options: [
          'By following experienced older birds',
          'By using only the Earth\'s magnetic field',
          'By combining multiple navigation techniques',
          'By memorising landmarks from previous trips',
        ],
        answer: 2,
        explanation: '第二段指出 most species use a combination of techniques，鸟类使用太阳、星星和地球磁场等多种方式。',
      },
      {
        id: 'migration-q2',
        type: 'fill-blank',
        question: 'The Arctic tern holds the record for the longest migration, travelling approximately ______ kilometres each year.',
        answer: '71,000',
        explanation: '第三段明确提到：a round trip of approximately 71,000 kilometres。',
      },
      {
        id: 'migration-q3',
        type: 'true-false',
        question: 'The main reason animals migrate is to find mates.',
        options: ['True', 'False'],
        answer: 1,
        explanation: '第四段明确说 The primary motivation is survival（主要动机是生存），包括寻找食物和避开严冬，而非寻找配偶。',
      },
      {
        id: 'migration-q4',
        type: 'heading-match',
        question: 'Which heading best fits the final paragraph?',
        options: [
          'The Magnificent Spectacles of Nature',
          'The Threat to Migration Routes',
          'How Animals Find Their Way',
          'The Record-Breaking Arctic Tern',
        ],
        answer: 1,
        explanation: '最后一段主要讨论人类活动对迁徙路线的威胁（threatening these ancient migration routes），故选 The Threat to Migration Routes。',
      },
    ],
  },
  {
    id: 'reading-color',
    title: '色彩的心理学',
    titleEn: 'The Psychology of Colour',
    category: '心理学',
    level: 'B2',
    wordCount: 400,
    estimatedTime: 8,
    unlocked: false,
    content: `Have you ever wondered why fast-food restaurants are so often decorated in shades of red and yellow? Or why hospitals tend to favour calming blues and greens? The answer lies in the fascinating field of colour psychology, which studies how different hues influence our emotions, behaviour, and decision-making.

Although the effects of colour can be subjective and influenced by cultural background, researchers have identified several patterns that seem to hold true across many contexts. Red, for instance, is widely recognised as a stimulating colour that increases heart rate and creates a sense of urgency. This explains its frequent use in clearance sales and, historically, in restaurant decor where proprietors hope to encourage quick turnover of customers.

Blue, by contrast, is associated with calmness, trust, and professionalism. It is no coincidence that many financial institutions and technology companies choose blue for their logos. Studies have shown that people working in blue environments report feeling more focused and less anxious, though the colour can also be perceived as cold or aloof if overused.

Green occupies a unique position in the psychological spectrum. As the colour most commonly found in nature, it is instinctively associated with growth, harmony, and renewal. Interestingly, researchers have found that exposure to green environments can significantly reduce stress levels and even improve reading ability in children. This may explain why green is so frequently used in educational settings and healthcare facilities.

The implications of colour psychology extend far beyond interior design. Marketing experts carefully select colour schemes to evoke specific emotions in consumers, while urban planners consider the psychological impact of colour when designing public spaces. Even the colour of the pills we take can influence their perceived effectiveness—a phenomenon known as the "placebo effect of colour".

Despite these insights, scientists caution against oversimplifying the relationship between colour and human behaviour. Personal preferences, cultural associations, and contextual factors all play a significant role. Nonetheless, understanding the subtle power of colour can help us make more informed choices in everything from the clothes we wear to the environments we create.`,
    vocabulary: [
      { word: 'hue', meaning: '色彩；色调' },
      { word: 'subjective', meaning: '主观的' },
      { word: 'stimulating', meaning: '刺激的；令人兴奋的' },
      { word: 'proprietor', meaning: '经营者；业主' },
      { word: 'turnover', meaning: '营业额；人员流动' },
      { word: 'aloof', meaning: '冷淡的；疏远的' },
      { word: 'spectrum', meaning: '光谱；范围' },
      { word: 'placebo effect', meaning: '安慰剂效应' },
    ],
    questions: [
      {
        id: 'color-q1',
        type: 'multiple-choice',
        question: 'Why are fast-food restaurants often decorated in red and yellow?',
        options: [
          'Because these colours are cheap to produce',
          'Because they stimulate appetite and encourage quick eating',
          'Because customers prefer bright colours',
          'Because these colours match the food being served',
        ],
        answer: 1,
        explanation: '第二段提到红色是 stimulating colour that increases heart rate and creates a sense of urgency，餐厅希望"quick turnover"（快速翻台）。',
      },
      {
        id: 'color-q2',
        type: 'fill-blank',
        question: 'According to the passage, blue is associated with calmness, trust, and ______.',
        answer: 'professionalism',
        explanation: '第三段开头：Blue, by contrast, is associated with calmness, trust, and professionalism.',
      },
      {
        id: 'color-q3',
        type: 'true-false',
        question: 'Exposure to green environments has been shown to reduce stress levels.',
        options: ['True', 'False'],
        answer: 0,
        explanation: '第四段提到：exposure to green environments can significantly reduce stress levels，故为 True。',
      },
      {
        id: 'color-q4',
        type: 'multiple-choice',
        question: 'What is the author\'s overall attitude towards colour psychology?',
        options: [
          'It is a proven science that applies to everyone equally',
          'It is interesting but should not be oversimplified',
          'It is mostly used by marketers to manipulate people',
          'It has no real scientific basis',
        ],
        answer: 1,
        explanation: '最后一段 scientists caution against oversimplifying，作者态度是"有趣但不应过度简化"，考虑个人偏好、文化、情境等因素。',
      },
    ],
  },
  {
    id: 'reading-ai-ethics',
    title: '人工智能的伦理困境',
    titleEn: 'The Ethical Dilemma of Artificial Intelligence',
    category: '科技伦理',
    level: 'B2+',
    wordCount: 440,
    estimatedTime: 9,
    unlocked: false,
    content: `In recent years, artificial intelligence has evolved from a futuristic concept into an integral part of our daily lives. From voice assistants in our smartphones to algorithms that determine our creditworthiness, AI systems are making decisions that profoundly affect millions of people. Yet this rapid advancement has given rise to a host of ethical concerns that society has barely begun to address.

One of the most pressing issues is algorithmic bias. AI systems learn from vast datasets, and if those datasets contain historical prejudices, the algorithms will inevitably perpetuate them. A striking example occurred when a major technology company developed an AI recruitment tool that systematically downgraded applications from women. The system had been trained on resumes submitted over the previous decade, the majority of which came from men. The result was an algorithm that learned to associate male candidates with success, effectively codifying decades of gender discrimination.

The question of accountability presents another formidable challenge. When a self-driving car is involved in a fatal accident, or when a medical AI system misdiagnoses a patient, who bears responsibility? The manufacturer? The programmer? The user? The legal frameworks that govern such situations are still in their infancy, and until they mature, the rapid deployment of autonomous systems poses significant risks.

Privacy concerns have also reached unprecedented levels. AI-powered surveillance technologies, including facial recognition systems, are now capable of tracking individuals in real time across cities. In some countries, such systems have been deployed on a massive scale, raising profound questions about the balance between security and individual liberty. Civil liberties organisations warn that without robust regulations, we risk sleepwalking into a surveillance state.

Despite these concerns, abandoning AI development is neither realistic nor desirable. The potential benefits—from medical breakthroughs to environmental solutions—are simply too significant to ignore. What is needed is a thoughtful, proactive approach to AI governance. This includes diverse development teams to mitigate bias, transparent algorithms that can be audited, and regulations that hold organisations accountable for the systems they deploy.

Ultimately, the goal should not be to slow down technological progress but to ensure that it serves humanity rather than the other way around. As AI continues to evolve at a breathtaking pace, the ethical frameworks we develop today will shape the society of tomorrow. The choices we make now may well determine whether AI becomes humanity's greatest ally or its most formidable adversary.`,
    vocabulary: [
      { word: 'integral', meaning: '不可或缺的；基本的' },
      { word: 'bias', meaning: '偏见；偏颇' },
      { word: 'perpetuate', meaning: '使永久；使延续' },
      { word: 'codify', meaning: '编纂；将...编成规范' },
      { word: 'accountability', meaning: '问责制；责任' },
      { word: 'infancy', meaning: '初期；婴儿期' },
      { word: 'unprecedented', meaning: '前所未有的' },
      { word: 'robust', meaning: '强健的；健全的' },
      { word: 'adversary', meaning: '对手；敌手' },
    ],
    questions: [
      {
        id: 'ai-q1',
        type: 'multiple-choice',
        question: 'Why did the AI recruitment tool mentioned in the passage downgrade applications from women?',
        options: [
          'Because the programmers intentionally programmed it to do so',
          'Because the training data was dominated by male candidates',
          'Because women typically have less experience in tech roles',
          'Because the algorithm was faulty in its design',
        ],
        answer: 1,
        explanation: '第二段解释：训练数据来自过去十年的简历，其中大部分来自男性，算法因此"学会"将男性候选人等同于成功。',
      },
      {
        id: 'ai-q2',
        type: 'heading-match',
        question: 'Which heading best fits the third paragraph?',
        options: [
          'The Challenge of Algorithmic Bias',
          'The Question of Responsibility',
          'The Threat to Personal Privacy',
          'The Need for Diverse Teams',
        ],
        answer: 1,
        explanation: '第三段核心是 accountability（问责/责任）问题，讨论当事故发生时谁来负责，故选 The Question of Responsibility。',
      },
      {
        id: 'ai-q3',
        type: 'fill-blank',
        question: 'Civil liberties organisations warn that without robust regulations, we risk sleepwalking into a ______ state.',
        answer: 'surveillance',
        explanation: '第四段末尾：we risk sleepwalking into a surveillance state（监控国家）。',
      },
      {
        id: 'ai-q4',
        type: 'true-false',
        question: 'The author believes that AI development should be abandoned due to its risks.',
        options: ['True', 'False'],
        answer: 1,
        explanation: '第五段开头：abandoning AI development is neither realistic nor desirable（放弃 AI 开发既不现实也不可取），故为 False。',
      },
    ],
  },
];
