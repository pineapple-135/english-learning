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
  {
    id: 'reading-mindfulness',
    title: '正念冥想的科学',
    titleEn: 'The Science of Mindfulness Meditation',
    category: '健康与心理',
    level: 'B1',
    wordCount: 330,
    estimatedTime: 6,
    unlocked: false,
    content: `In recent years, mindfulness meditation has moved from the realm of ancient philosophy into the mainstream of modern psychology and healthcare. What began as a practice rooted in Buddhist traditions has now become a popular technique for reducing stress, improving focus, and enhancing overall well-being. But what exactly is mindfulness, and what does science say about its effects?
      
Mindfulness can be defined as the practice of bringing one's attention to the present moment, without judgment. Instead of getting caught up in worries about the future or regrets about the past, mindfulness encourages individuals to observe their thoughts, feelings, and bodily sensations with curiosity and acceptance. This simple yet powerful practice has been shown to have profound effects on both the mind and body.

Research conducted at leading universities has revealed that regular mindfulness practice can actually change the structure of the brain. Studies using magnetic resonance imaging (MRI) have found that mindfulness practitioners have increased grey matter density in the hippocampus, the part of the brain associated with learning and memory, and reduced activity in the amygdala, the region responsible for processing fear and anxiety.

The benefits of mindfulness extend beyond neurological changes. In clinical settings, mindfulness-based stress reduction (MBSR) programs have been shown to effectively treat conditions such as chronic pain, depression, and anxiety disorders. Corporate wellness programs increasingly incorporate mindfulness training to improve employee productivity and reduce burnout.

Perhaps most importantly, mindfulness offers a practical tool for navigating the challenges of modern life. In a world dominated by constant distractions and information overload, the ability to focus on the present moment has become a valuable skill. Whether practiced through formal meditation sessions or integrated into daily activities like walking or eating, mindfulness has the potential to transform how we experience life itself.`,
    vocabulary: [
      { word: 'mindfulness', meaning: '正念；觉知' },
      { word: 'realm', meaning: '领域；范围' },
      { word: 'mainstream', meaning: '主流' },
      { word: 'density', meaning: '密度' },
      { word: 'hippocampus', meaning: '海马体' },
      { word: 'amygdala', meaning: '杏仁核' },
      { word: 'neurological', meaning: '神经学的' },
      { word: 'burnout', meaning: '倦怠；精疲力竭' },
    ],
    questions: [
      {
        id: 'mind-q1',
        type: 'multiple-choice',
        question: 'What is mindfulness meditation defined as?',
        options: [
          'A form of sleep therapy',
          'Focusing on the present moment without judgment',
          'Visualizing future goals',
          'Analyzing past experiences',
        ],
        answer: 1,
        explanation: '第二段定义：Mindfulness can be defined as the practice of bringing one\'s attention to the present moment, without judgment。',
      },
      {
        id: 'mind-q2',
        type: 'fill-blank',
        question: 'Studies have found that mindfulness practitioners have increased grey matter density in the ______, the part of the brain associated with learning and memory.',
        answer: 'hippocampus',
        explanation: '第三段明确提到：increased grey matter density in the hippocampus, the part of the brain associated with learning and memory。',
      },
      {
        id: 'mind-q3',
        type: 'true-false',
        question: 'Mindfulness-based stress reduction (MBSR) programs have been shown to effectively treat chronic pain.',
        options: ['True', 'False'],
        answer: 0,
        explanation: '第四段提到：MBSR programs have been shown to effectively treat conditions such as chronic pain, depression, and anxiety disorders，故为 True。',
      },
      {
        id: 'mind-q4',
        type: 'multiple-choice',
        question: 'What is the main benefit of mindfulness in modern life?',
        options: [
          'It helps people forget their problems',
          'It provides a way to focus amid constant distractions',
          'It eliminates the need for sleep',
          'It increases wealth and success',
        ],
        answer: 1,
        explanation: '最后一段提到：In a world dominated by constant distractions and information overload, the ability to focus on the present moment has become a valuable skill。',
      },
    ],
  },
  {
    id: 'reading-ocean-plastic',
    title: '海洋塑料污染危机',
    titleEn: 'The Ocean Plastic Pollution Crisis',
    category: '环境',
    level: 'B1+',
    wordCount: 370,
    estimatedTime: 7,
    unlocked: false,
    content: `The world's oceans are drowning in plastic. Each year, an estimated eight million tons of plastic waste enters the marine environment, with devastating consequences for wildlife, ecosystems, and human health. What began as a convenient material has transformed into one of the most pressing environmental challenges of our time.

Plastic pollution takes many forms. Single-use items like bottles, bags, and straws make up a significant portion of the waste, but microplastics—tiny particles less than five millimeters in diameter—pose an even more insidious threat. These microplastics come from various sources, including the breakdown of larger plastic items, synthetic clothing fibers that wash off in laundry machines, and microbeads in personal care products.

The impact on marine life is catastrophic. Sea turtles mistake plastic bags for jellyfish, while seabirds feed their chicks bits of plastic, causing starvation and death. Whales and other marine mammals become entangled in fishing nets and plastic debris, leading to injury or drowning. Even creatures at the bottom of the food chain are affected—plankton absorb microplastics, which then accumulate up the food web.

The consequences for human health are equally alarming. Microplastics have been found in tap water, bottled water, and even in the air we breathe. When ingested, these particles can release toxic chemicals that disrupt hormonal balance and potentially cause long-term health effects. The World Health Organization has called for urgent research into the full extent of this threat.

Solutions exist, but they require collective action. Governments must implement stricter regulations on plastic production and waste management. Industries need to develop sustainable alternatives and adopt circular economy principles. Individuals can reduce their plastic footprint by choosing reusable products and supporting businesses that prioritize environmental responsibility.

The ocean plastic crisis is a stark reminder of humanity's relationship with nature. Every piece of plastic that enters the ocean remains there for centuries, a lasting legacy of our consumption patterns. Addressing this crisis is not just an environmental imperative—it is a moral one that will determine the health of our planet for generations to come.`,
    vocabulary: [
      { word: 'devastating', meaning: '毁灭性的' },
      { word: 'insidious', meaning: '隐蔽的；暗中为害的' },
      { word: 'diameter', meaning: '直径' },
      { word: 'synthetic', meaning: '合成的' },
      { word: 'entangled', meaning: '缠绕的；纠缠的' },
      { word: 'debris', meaning: '碎片；残骸' },
      { word: 'accumulate', meaning: '积累；堆积' },
      { word: 'circular economy', meaning: '循环经济' },
    ],
    questions: [
      {
        id: 'ocean-q1',
        type: 'multiple-choice',
        question: 'How much plastic waste enters the marine environment each year?',
        options: [
          'One million tons',
          'Five million tons',
          'Eight million tons',
          'Fifty million tons',
        ],
        answer: 2,
        explanation: '第一段明确提到：an estimated eight million tons of plastic waste enters the marine environment each year。',
      },
      {
        id: 'ocean-q2',
        type: 'fill-blank',
        question: 'Microplastics are defined as tiny particles less than ______ millimeters in diameter.',
        answer: 'five',
        explanation: '第二段：microplastics—tiny particles less than five millimeters in diameter。',
      },
      {
        id: 'ocean-q3',
        type: 'true-false',
        question: 'Microplastics have only been found in ocean water, not in drinking water.',
        options: ['True', 'False'],
        answer: 1,
        explanation: '第四段提到：Microplastics have been found in tap water, bottled water, and even in the air we breathe，故为 False。',
      },
      {
        id: 'ocean-q4',
        type: 'multiple-choice',
        question: 'Which of the following is NOT mentioned as a source of microplastics?',
        options: [
          'Breakdown of larger plastic items',
          'Synthetic clothing fibers',
          'Natural sea salt',
          'Microbeads in personal care products',
        ],
        answer: 2,
        explanation: '第二段列举了微塑料来源：larger plastic items, synthetic clothing fibers, microbeads in personal care products，不包括天然海盐。',
      },
    ],
  },
  {
    id: 'reading-creativity',
    title: '创造力的科学',
    titleEn: 'The Science of Creativity',
    category: '心理学',
    level: 'B2',
    wordCount: 410,
    estimatedTime: 8,
    unlocked: false,
    content: `Creativity is often seen as a mysterious gift reserved for artists, musicians, and geniuses. But recent research suggests that creativity is a cognitive skill that can be developed and nurtured, accessible to anyone willing to put in the effort. Understanding the science behind creativity can help us unlock our own creative potential.

Neuroscientists have identified two distinct modes of thinking that underpin creative processes: the "default mode network" (DMN) and the "executive control network" (ECN). The DMN is active when we are daydreaming, imagining, or making connections between unrelated ideas. The ECN, by contrast, is engaged when we focus on specific tasks and evaluate ideas critically. Creative breakthroughs often occur when these two networks work together in harmony.

One key insight from the science of creativity is the importance of "incubation"—stepping away from a problem and allowing the subconscious mind to work on it. Many famous inventors and artists have reported that their greatest ideas came to them during moments of relaxation or doing mundane activities. The classic example is Archimedes, who famously shouted "Eureka!" while taking a bath.

Another crucial factor is the role of openness to experience. Psychologists have found that individuals who score high on openness—one of the Big Five personality traits—tend to be more creative. This trait involves being curious, imaginative, and receptive to new ideas. Cultivating openness requires stepping outside our comfort zones and exposing ourselves to diverse experiences, perspectives, and cultures.

The environment also plays a significant role. Studies have shown that creative thinking is enhanced by physical spaces that encourage collaboration and exploration. Flexible workspaces, access to nature, and opportunities for playful experimentation all contribute to a creative atmosphere. Interestingly, moderate levels of noise have been found to boost creativity, while excessive silence or loud noise can hinder it.

Perhaps the most empowering finding is that creativity is not an innate talent but a skill that can be practiced. Techniques such as brainstorming, mind mapping, and lateral thinking exercises can strengthen creative muscles. Regular practice, combined with a supportive environment and an open mindset, can transform anyone into a more creative thinker.`,
    vocabulary: [
      { word: 'cognitive', meaning: '认知的' },
      { word: 'nurture', meaning: '培养；养育' },
      { word: 'underpin', meaning: '支撑；构成...的基础' },
      { word: 'incubation', meaning: '孵化；酝酿' },
      { word: 'subconscious', meaning: '潜意识的' },
      { word: 'mundane', meaning: '平凡的；世俗的' },
      { word: 'lateral thinking', meaning: '横向思维' },
      { word: 'innate', meaning: '天生的；固有的' },
    ],
    questions: [
      {
        id: 'creat-q1',
        type: 'multiple-choice',
        question: 'According to the passage, what are the two modes of thinking that underpin creativity?',
        options: [
          'Logical and emotional thinking',
          'Default mode network and executive control network',
          'Left brain and right brain thinking',
          'Analytical and intuitive thinking',
        ],
        answer: 1,
        explanation: '第二段明确提到：the "default mode network" (DMN) and the "executive control network" (ECN)。',
      },
      {
        id: 'creat-q2',
        type: 'fill-blank',
        question: 'The classic example of incubation is Archimedes, who shouted "______!" while taking a bath.',
        answer: 'Eureka',
        explanation: '第三段提到：The classic example is Archimedes, who famously shouted "Eureka!" while taking a bath。',
      },
      {
        id: 'creat-q3',
        type: 'true-false',
        question: 'Individuals who score high on openness tend to be less creative.',
        options: ['True', 'False'],
        answer: 1,
        explanation: '第四段提到：individuals who score high on openness... tend to be more creative，故为 False。',
      },
      {
        id: 'creat-q4',
        type: 'multiple-choice',
        question: 'What does the passage suggest about creativity?',
        options: [
          'It is a gift that only geniuses possess',
          'It is a skill that can be developed through practice',
          'It is determined solely by genetics',
          'It cannot be taught or learned',
        ],
        answer: 1,
        explanation: '最后一段：creativity is not an innate talent but a skill that can be practiced，以及第一段也提到 creativity is a cognitive skill that can be developed。',
      },
    ],
  },
  {
    id: 'reading-space-exploration',
    title: '太空探索的未来',
    titleEn: 'The Future of Space Exploration',
    category: '科技',
    level: 'B2+',
    wordCount: 450,
    estimatedTime: 9,
    unlocked: false,
    content: `Since the dawn of the Space Age, humanity has dreamed of venturing beyond our home planet. From the first satellite launch in 1957 to the historic moon landing in 1969, space exploration has captivated the imagination and pushed the boundaries of what is possible. Today, we stand at the threshold of a new era in space exploration, one that promises to be more ambitious and transformative than ever before.

The return of human spaceflight to the Moon, led by NASA's Artemis program, marks a significant milestone. Unlike the Apollo missions of the past, Artemis aims to establish a sustainable presence on the lunar surface, with plans for a lunar Gateway orbiting the Moon and a permanent base near the lunar south pole. This infrastructure will serve as a stepping stone for future missions to Mars and beyond.

Mars, the Red Planet, has emerged as the next frontier. Both NASA and private companies like SpaceX are developing technologies to send humans to Mars within the next decade. The challenges are enormous: a journey to Mars takes between six and nine months, requiring life support systems that can sustain astronauts during the long voyage. Once on Mars, colonists will need to grow food, generate water, and build habitats—all while adapting to the planet's harsh conditions.

Beyond Mars, the possibilities are truly staggering. The discovery of exoplanets—planets orbiting stars outside our solar system—has opened up new frontiers for exploration. With thousands of exoplanets identified to date, the search for habitable worlds has become a major focus of astrophysics. The James Webb Space Telescope, launched in 2021, is already providing unprecedented insights into the atmospheres of distant planets, bringing us closer than ever to answering the age-old question: Are we alone in the universe?

Space exploration is not without its challenges and ethical considerations. The cost of space missions remains prohibitive, raising questions about resource allocation in a world facing pressing social and environmental issues. There are also concerns about the potential contamination of other planets with Earth organisms and the ethical implications of colonizing other worlds.

Nevertheless, the potential benefits are equally compelling. Space exploration drives innovation in fields ranging from materials science to medicine, producing technologies that improve life on Earth. It inspires future generations of scientists and engineers, fosters international cooperation, and expands our understanding of the universe and our place within it. As we look to the stars, we are reminded that exploration is not just about reaching new destinations—it is about who we are as a species.`,
    vocabulary: [
      { word: 'venture', meaning: '冒险；探索' },
      { word: 'captivate', meaning: '吸引；迷住' },
      { word: 'threshold', meaning: '门槛；起点' },
      { word: 'infrastructure', meaning: '基础设施' },
      { word: 'frontier', meaning: '前沿；边界' },
      { word: 'exoplanet', meaning: '系外行星' },
      { word: 'prohibitive', meaning: '高昂的；令人却步的' },
      { word: 'contamination', meaning: '污染；玷污' },
    ],
    questions: [
      {
        id: 'space-q1',
        type: 'multiple-choice',
        question: 'What is the main goal of NASA\'s Artemis program?',
        options: [
          'To land the first humans on Mars',
          'To establish a sustainable presence on the Moon',
          'To build a space station in orbit around Earth',
          'To explore distant exoplanets',
        ],
        answer: 1,
        explanation: '第二段提到：Artemis aims to establish a sustainable presence on the lunar surface。',
      },
      {
        id: 'space-q2',
        type: 'fill-blank',
        question: 'A journey to Mars takes between ______ and nine months.',
        answer: 'six',
        explanation: '第三段：a journey to Mars takes between six and nine months。',
      },
      {
        id: 'space-q3',
        type: 'true-false',
        question: 'The James Webb Space Telescope was launched before the year 2020.',
        options: ['True', 'False'],
        answer: 1,
        explanation: '第四段提到：The James Webb Space Telescope, launched in 2021，故为 False。',
      },
      {
        id: 'space-q4',
        type: 'multiple-choice',
        question: 'Which of the following is NOT mentioned as a challenge of Mars colonization?',
        options: [
          'Long travel time',
          'Harsh environmental conditions',
          'Lack of gravity',
          'Need to grow food and generate water',
        ],
        answer: 2,
        explanation: '第三段提到：journey takes six to nine months, need to grow food, generate water, build habitats, adapting to harsh conditions。没有提到缺乏重力是挑战。',
      },
    ],
  },
];
