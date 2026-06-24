import { ListeningMaterial } from '../types';

export const listeningMaterials: ListeningMaterial[] = [
  {
    id: 'listening-trip-planning',
    title: '策划旅行',
    titleEn: 'Planning a Weekend Trip',
    type: 'dialogue',
    level: 'B1',
    duration: 180,
    unlocked: true,
    transcript: `[Transcript]
Sarah: Hi Tom! I was wondering if you've thought about what we're doing this weekend. The forecast says it's going to be sunny, so it'd be a shame to stay indoors.

Tom: Hey Sarah! Actually, I was thinking the exact same thing. How about we head to the coast? Brighton is only an hour and a half by train, and we haven't been there in ages.

Sarah: Brighton sounds brilliant! I've been wanting to visit the Royal Pavilion for months. We could also stroll along the pier and maybe grab some fish and chips by the sea.

Tom: Perfect. What time should we leave? The earlier the better, I reckon, so we can make the most of the day.

Sarah: How about the 8:15 train from Victoria Station? That would get us there by 10, giving us the whole morning to explore.

Tom: 8:15 might be a bit of a struggle for me, to be honest. I've got a late meeting on Friday night. Could we make it the 9:30 instead? That still gives us plenty of time.

Sarah: Sure, that works for me. Shall I book the tickets online tonight? They're usually cheaper if you buy them in advance.

Tom: That'd be great. Could you get me a return ticket as well? I'll transfer the money to you straight away. Oh, and one more thing—do you think we should book a table for lunch somewhere? The seafront restaurants get incredibly busy at weekends.

Sarah: Good idea. There's a lovely little seafood place called The Salt Room that my colleague recommended. I'll see if they have a table for one o'clock.

Tom: Sounds perfect. I'm really looking forward to it now. Let's hope the weather forecast is right for once!`,
    questions: [
      {
        id: 'trip-q1',
        type: 'multiple-choice',
        question: 'Where do Sarah and Tom decide to go for the weekend?',
        options: ['To London', 'To Brighton', 'To Victoria Station', 'To Cambridge'],
        answer: 1,
        explanation: 'Tom 提出 Brighton is only an hour and a half by train，Sarah 回复 Brighton sounds brilliant，最终决定去 Brighton。',
      },
      {
        id: 'trip-q2',
        type: 'multiple-choice',
        question: 'What time does Sarah originally suggest taking the train?',
        options: ['8:15', '9:30', '10:00', '1:00'],
        answer: 0,
        explanation: 'Sarah 建议 the 8:15 train from Victoria Station，但 Tom 觉得太早，最终改为 9:30。',
      },
      {
        id: 'trip-q3',
        type: 'fill-blank',
        question: 'Sarah plans to book a table at a seafood restaurant called The ______ Room.',
        answer: 'Salt',
        explanation: 'Sarah 提到 a lovely little seafood place called The Salt Room。',
      },
      {
        id: 'trip-q4',
        type: 'multiple-choice',
        question: 'Why does Tom prefer a later train?',
        options: [
          'He wants to sleep in',
          'He has a late meeting on Friday night',
          'The 8:15 train is fully booked',
          'He has to finish homework first',
        ],
        answer: 1,
        explanation: 'Tom 解释：I\'ve got a late meeting on Friday night，所以 8:15 的火车对他来说太早了。',
      },
    ],
  },
  {
    id: 'listening-gap-year',
    title: '我的间隔年',
    titleEn: 'My Unforgettable Gap Year',
    type: 'monologue',
    level: 'B1+',
    duration: 240,
    unlocked: false,
    transcript: `[Transcript]
When I finished my A-levels last summer, most of my friends were rushing to apply for university. But I knew I wasn't ready. I felt exhausted after years of exams, and I wanted to do something different before committing to another three years of study. So, I decided to take a gap year—and honestly, it turned out to be the best decision I've ever made.

I spent the first three months volunteering at a wildlife conservation project in Costa Rica. I'd never travelled alone before, so arriving in San José was completely overwhelming. I didn't speak a word of Spanish, and my luggage had been lost somewhere between London and Miami. But the project coordinators were incredibly welcoming, and within a week, I felt right at home.

My daily routine involved tracking sea turtles on the beach at night, collecting data on their nesting habits, and helping to protect the eggs from poachers. The work was physically exhausting—we often walked over fifteen kilometres in a single shift—but seeing those tiny hatchlings make their way to the ocean for the first time was absolutely magical.

After Costa Rica, I travelled through Central America for two months, picking up enough Spanish to hold a decent conversation. I stayed in hostels, met travellers from all over the world, and learned far more about different cultures than I ever could from a textbook.

The final part of my year was spent working in a café in Melbourne, Australia, saving up money for university. Pouring coffees might not sound glamorous, but I learned so much about responsibility, teamwork, and dealing with difficult customers.

Looking back, my gap year gave me confidence, independence, and a much clearer sense of what I want to study. I'm starting my degree in marine biology this September, and I genuinely don't think I would have chosen this path without my experiences in Costa Rica. If you're considering a gap year, my advice is simple: do it. You won't regret it.`,
    questions: [
      {
        id: 'gap-q1',
        type: 'multiple-choice',
        question: 'Why did the speaker decide to take a gap year?',
        options: [
          'Because she didn\'t get into university',
          'Because she felt exhausted and wanted to do something different',
          'Because her parents forced her to',
          'Because she wanted to earn money first',
        ],
        answer: 1,
        explanation: '演讲者说 I felt exhausted after years of exams, and I wanted to do something different，所以选择 gap year。',
      },
      {
        id: 'gap-q2',
        type: 'fill-blank',
        question: 'In Costa Rica, the speaker helped to track sea ______ on the beach at night.',
        answer: 'turtles',
        explanation: '演讲者提到 My daily routine involved tracking sea turtles on the beach at night。',
      },
      {
        id: 'gap-q3',
        type: 'multiple-choice',
        question: 'What did the speaker do during the final part of her gap year?',
        options: [
          'She travelled through Central America',
          'She worked in a café in Melbourne',
          'She returned to Costa Rica',
          'She studied Spanish in Spain',
        ],
        answer: 1,
        explanation: '最后一段提到 The final part of my year was spent working in a café in Melbourne, Australia。',
      },
      {
        id: 'gap-q4',
        type: 'multiple-choice',
        question: 'What will the speaker study at university?',
        options: ['Marine biology', 'Spanish literature', 'Hospitality management', 'Environmental science'],
        answer: 0,
        explanation: '倒数第二段：I\'m starting my degree in marine biology this September。',
      },
    ],
  },
  {
    id: 'listening-news-report',
    title: '城市新闻播报',
    titleEn: 'City News Bulletin',
    type: 'broadcast',
    level: 'B2',
    duration: 210,
    unlocked: false,
    transcript: `[Transcript]
Good evening, this is the 7 o'clock news. I'm James Whitfield.

The headline story tonight: the city council has approved a controversial plan to pedestrianise the historic Market Square. The proposal, which was passed by a narrow margin of nine votes to seven, will see all private vehicles banned from the area starting from next March. The mayor, Linda Chen, described the decision as "a landmark moment for our city", arguing that it would reduce pollution and revitalise local businesses. However, several shopkeepers have expressed concern that the restrictions will drive customers away, particularly elderly residents who rely on cars.

In other news, a team of archaeologists from the University has unearthed what appears to be a Roman settlement beneath the former bus depot on Station Road. Professor Eleanor Hughes, who is leading the excavation, described the find as "extraordinarily significant". Among the artefacts discovered are well-preserved mosaic floors, ceramic vessels, and a collection of bronze coins dating back to the third century AD. The site will be open to the public for guided tours next month, though access will be limited to small groups to protect the fragile remains.

Meanwhile, local authorities are warning residents to be on their guard following a series of thefts from vehicles in the northern suburbs. Over the past fortnight, there have been twenty-three reported incidents, predominantly in supermarket car parks. Police are advising motorists to ensure valuables are kept out of sight and to report any suspicious behaviour immediately.

And finally, in sports, the city's under-18 football team has secured a place in the national championship final after a thrilling 3-2 victory over their long-standing rivals from Manchester. The team's captain, sixteen-year-old Marcus Reed, scored the winning goal in the dying seconds of extra time. The final will be held at Wembley Stadium on the 18th of next month, and tickets are expected to sell out within hours.

That's all from us. The full bulletin will be available on our website shortly. Good night.`,
    questions: [
      {
        id: 'news-q1',
        type: 'multiple-choice',
        question: 'What was the result of the city council vote on pedestrianising Market Square?',
        options: [
          'It was rejected by a large majority',
          'It was passed by a narrow margin of 9 to 7',
          'It was passed unanimously',
          'It was postponed for further discussion',
        ],
        answer: 1,
        explanation: '第一段提到 The proposal ... was passed by a narrow margin of nine votes to seven（9票对7票微弱优势通过）。',
      },
      {
        id: 'news-q2',
        type: 'fill-blank',
        question: 'Archaeologists discovered a Roman settlement beneath the former ______ on Station Road.',
        answer: 'bus depot',
        explanation: '第二段提到 unearthed what appears to be a Roman settlement beneath the former bus depot on Station Road。',
      },
      {
        id: 'news-q3',
        type: 'multiple-choice',
        question: 'What artefacts were NOT mentioned as being discovered at the archaeological site?',
        options: ['Mosaic floors', 'Bronze coins', 'Ceramic vessels', 'Golden jewellery'],
        answer: 3,
        explanation: '原文提到了 mosaic floors, ceramic vessels, bronze coins，没有提到 golden jewellery（金饰）。',
      },
      {
        id: 'news-q4',
        type: 'multiple-choice',
        question: 'When will the football championship final take place?',
        options: [
          'Next week',
          'On the 18th of next month',
          'This Saturday',
          'In two days',
        ],
        answer: 1,
        explanation: '最后一段提到 The final will be held at Wembley Stadium on the 18th of next month。',
      },
    ],
  },
  {
    id: 'listening-marine-interview',
    title: '海洋生物学家访谈',
    titleEn: 'Interview with a Marine Biologist',
    type: 'interview',
    level: 'B2+',
    duration: 280,
    unlocked: false,
    transcript: `[Transcript]
Host: Welcome back to "Science Today". My guest this afternoon is Dr. Amara Okafor, a marine biologist whose groundbreaking research on coral reef ecosystems has earned her international recognition. Dr. Okafor, thank you for joining us.

Dr. Okafor: It's a pleasure to be here, thank you for having me.

Host: Let's start with the basics. What initially drew you to the study of marine biology?

Dr. Okafor: Well, I grew up in a coastal town in Nigeria, and I spent most of my childhood either in or near the ocean. I was endlessly fascinated by the creatures I encountered—everything from tiny hermit crabs to magnificent manta rays. But the real turning point came when I was twelve. A massive oil spill devastated the coastline near my home, and I watched helplessly as the marine life I loved disappeared almost overnight. That experience shaped my entire career. I knew I wanted to dedicate my life to understanding and protecting these fragile ecosystems.

Host: That's a powerful story. Your recent work has focused on coral bleaching. Could you explain to our listeners what that is, and why it matters?

Dr. Okafor: Certainly. Coral bleaching occurs when corals—under stress from rising sea temperatures—expel the symbiotic algae that live within their tissues. These algae provide the coral with both its vibrant colour and most of its nutrition. Without them, the coral turns completely white and, more importantly, becomes highly vulnerable to starvation and disease. If the stress persists for too long, the coral dies. This matters enormously because reefs support roughly a quarter of all marine species, despite covering less than one percent of the ocean floor. They're often called the "rainforests of the sea".

Host: A quarter of all marine species—that's staggering. What does the latest research tell us about the current state of the world's reefs?

Dr. Okafor: The picture is deeply concerning. We've lost approximately half of the world's coral reefs in the past thirty years, and if current trends continue, we could lose up to ninety percent by 2050. The Great Barrier Reef alone has suffered three mass bleaching events in the last five years—something that was previously considered unthinkable.

Host: That's truly alarming. Is there any reason for optimism?

Dr. Okafor: Yes, actually. My team has been studying certain "super corals" that appear to be naturally more resilient to heat stress. We're working to understand the genetic basis of this resilience, with the hope of eventually restoring damaged reefs. There are also inspiring community-led conservation projects around the world proving that local action can make a real difference. The key message is this: it's not too late, but we must act now, and we must act decisively.`,
    questions: [
      {
        id: 'marine-q1',
        type: 'multiple-choice',
        question: 'What inspired Dr. Okafor to become a marine biologist?',
        options: [
          'A documentary she watched as a child',
          'An oil spill that devastated the coastline near her home',
          'A school trip to an aquarium',
          'Her parents were also marine biologists',
        ],
        answer: 1,
        explanation: 'Dr. Okafor 说 A massive oil spill devastated the coastline near my home，这一经历塑造了她的整个职业生涯。',
      },
      {
        id: 'marine-q2',
        type: 'fill-blank',
        question: 'Coral reefs support approximately ______ of all marine species despite covering less than 1% of the ocean floor.',
        answer: 'a quarter',
        explanation: 'Dr. Okafor 提到 reefs support roughly a quarter of all marine species（约四分之一的海洋物种）。',
      },
      {
        id: 'marine-q3',
        type: 'multiple-choice',
        question: 'What percentage of the world\'s coral reefs have been lost in the past thirty years?',
        options: ['About a quarter', 'About half', 'About three quarters', 'Almost all'],
        answer: 1,
        explanation: 'Dr. Okafor 说 We\'ve lost approximately half of the world\'s coral reefs in the past thirty years（过去三十年约失去了一半）。',
      },
      {
        id: 'marine-q4',
        type: 'multiple-choice',
        question: 'What gives Dr. Okafor reason for optimism?',
        options: [
          'Coral reefs can naturally recover within a few years',
          'Some "super corals" show natural resilience to heat stress',
          'The rate of bleaching has slowed down recently',
          'New technology can completely reverse coral damage',
        ],
        answer: 1,
        explanation: 'Dr. Okafor 提到 her team has been studying certain "super corals" that appear to be naturally more resilient to heat stress，这给了她希望。',
      },
    ],
  },
];
