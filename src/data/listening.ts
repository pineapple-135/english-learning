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
  {
    id: 'listening-job-interview',
    title: '求职面试',
    titleEn: 'Job Interview for Marketing Position',
    type: 'dialogue',
    level: 'B1',
    duration: 200,
    unlocked: false,
    transcript: `[Transcript]
Interviewer: Good morning, Ms. Carter. Thank you for coming in today. Please take a seat.
Ms. Carter: Good morning. Thank you for inviting me.

Interviewer: Let's start with your background. Could you tell me a bit about your previous experience in marketing?

Ms. Carter: Absolutely. I've been working in marketing for the past five years. My most recent role was as a Marketing Manager at Green Solutions, a sustainable products company. I was responsible for developing and implementing digital marketing campaigns, managing social media accounts, and analyzing campaign performance using Google Analytics and other tools.

Interviewer: That sounds very relevant. Can you give me an example of a successful campaign you led?

Ms. Carter: Certainly. Last year, I developed a campaign to promote our new eco-friendly packaging line. We used a combination of social media ads, influencer partnerships, and email marketing. The campaign resulted in a 35% increase in sales within three months, and we received several industry awards for creativity and sustainability.

Interviewer: Impressive. Now, what do you know about our company?

Ms. Carter: I've done extensive research. Your company, Bright Innovations, is a leader in consumer electronics with a strong focus on innovation and customer experience. I particularly admire how you integrate sustainability into your product design and packaging.

Interviewer: Thank you. How would you describe your communication skills?

Ms. Carter: I believe I'm an excellent communicator. In my previous role, I regularly presented campaign results to senior management and collaborated with cross-functional teams, including product development and sales. I'm comfortable adapting my communication style to different audiences.

Interviewer: Finally, do you have any questions for me?

Ms. Carter: Yes, actually. Could you tell me about the team I would be working with and the key priorities for the marketing department over the next year?

Interviewer: Of course. The marketing team consists of eight people with diverse backgrounds. Our main priorities include expanding into international markets and developing a customer loyalty program.

Ms. Carter: Thank you. That's very helpful.

Interviewer: Well, Ms. Carter, we have a few more candidates to interview today, but I'll be in touch within the week.

Ms. Carter: Thank you for your time. I look forward to hearing from you.`,
    questions: [
      {
        id: 'interview-q1',
        type: 'multiple-choice',
        question: 'What was Ms. Carter\'s most recent job?',
        options: ['Marketing Manager at Green Solutions', 'Sales Director at Bright Innovations', 'Digital Marketing Specialist', 'Product Developer'],
        answer: 0,
        explanation: 'Ms. Carter 说 My most recent role was as a Marketing Manager at Green Solutions。',
      },
      {
        id: 'interview-q2',
        type: 'fill-blank',
        question: 'Ms. Carter\'s eco-friendly packaging campaign resulted in a ______ increase in sales.',
        answer: '35%',
        explanation: 'Ms. Carter 提到 The campaign resulted in a 35% increase in sales within three months。',
      },
      {
        id: 'interview-q3',
        type: 'multiple-choice',
        question: 'What does Ms. Carter admire about Bright Innovations?',
        options: [
          'Their low prices',
          'Their focus on sustainability in product design',
          'Their large office space',
          'Their employee benefits',
        ],
        answer: 1,
        explanation: 'Ms. Carter 说 I particularly admire how you integrate sustainability into your product design and packaging。',
      },
      {
        id: 'interview-q4',
        type: 'multiple-choice',
        question: 'What is one of the marketing department\'s key priorities?',
        options: [
          'Reducing employee costs',
          'Expanding into international markets',
          'Closing retail stores',
          'Developing new software',
        ],
        answer: 1,
        explanation: '面试官说 Our main priorities include expanding into international markets and developing a customer loyalty program。',
      },
    ],
  },
  {
    id: 'listening-music-festival',
    title: '音乐节介绍',
    titleEn: 'Summer Music Festival Guide',
    type: 'monologue',
    level: 'B1+',
    duration: 220,
    unlocked: false,
    transcript: `[Transcript]
Welcome to the official guide for this year's Summer Sounds Festival! Taking place over three days from the 15th to the 17th of July at Greenfield Park, this year's festival promises to be bigger and better than ever before.

Let's start with the lineup. On Friday night, we have the legendary rock band The Thunderheads headlining, supported by rising indie star Lila Rose. Saturday's main stage will feature electronic music pioneers Neon Pulse, with a special guest appearance by Grammy-winning DJ Max Storm. Sunday closes the festival with folk-pop sensation Willow Creek and soul singer Marcus Taylor.

Now, some important practical information. Gates open at 11 a.m. each day, and the first act starts at 1 p.m. We strongly recommend arriving early to avoid long queues. Tickets are available online through our website, and we advise buying them in advance—last year's tickets sold out a week before the event.

For those planning to stay overnight, we have a camping area located just a five-minute walk from the main stages. Camping passes include access to shared shower facilities and a communal kitchen. Please note that alcohol is not permitted in the camping area, but there will be plenty of licensed bars near the stages.

In terms of food, we've partnered with some of the city's best food trucks, offering a wide range of options including vegetarian, vegan, and gluten-free meals. There will also be a craft beer tent and a cocktail bar for those looking for a refreshing drink.

Finally, a few safety reminders. Please keep your ticket with you at all times as you'll need it to re-enter the festival grounds. The park is a no-smoking zone, and we ask everyone to respect the environment by using the recycling bins provided.

We can't wait to see you all at Greenfield Park this summer! For more information, visit our website or follow us on social media.`,
    questions: [
      {
        id: 'festival-q1',
        type: 'multiple-choice',
        question: 'When does the Summer Sounds Festival take place?',
        options: [
          'July 15th to 17th',
          'August 15th to 17th',
          'July 1st to 3rd',
          'June 15th to 17th',
        ],
        answer: 0,
        explanation: '演讲者说 Taking place over three days from the 15th to the 17th of July。',
      },
      {
        id: 'festival-q2',
        type: 'fill-blank',
        question: 'The camping area is a ______-minute walk from the main stages.',
        answer: 'five',
        explanation: '演讲者提到 a camping area located just a five-minute walk from the main stages。',
      },
      {
        id: 'festival-q3',
        type: 'multiple-choice',
        question: 'Who is headlining on Saturday night?',
        options: ['The Thunderheads', 'Neon Pulse', 'Willow Creek', 'Lila Rose'],
        answer: 1,
        explanation: '演讲者说 Saturday\'s main stage will feature electronic music pioneers Neon Pulse。',
      },
      {
        id: 'festival-q4',
        type: 'multiple-choice',
        question: 'Which of the following is NOT permitted in the camping area?',
        options: ['Alcohol', 'Camping tents', 'Shower facilities', 'Communal kitchen'],
        answer: 0,
        explanation: '演讲者说 alcohol is not permitted in the camping area。',
      },
    ],
  },
  {
    id: 'listening-podcast',
    title: '科技播客',
    titleEn: 'Tech Trends Podcast',
    type: 'broadcast',
    level: 'B2',
    duration: 250,
    unlocked: false,
    transcript: `[Transcript]
Welcome to Tech Trends, your weekly guide to the latest developments in technology. I'm your host, Alex Chen.

This week, we're diving into the world of artificial intelligence and its impact on the workplace. According to a recent report by the World Economic Forum, AI could automate approximately 30% of work tasks by 2030. But before you start worrying about job losses, let's look at the bigger picture.

The report also predicts that AI will create as many new jobs as it displaces, particularly in fields like data analysis, AI training, and human-AI collaboration. In fact, many experts argue that the real transformation will be in how we work, not whether we work. AI has the potential to take over repetitive tasks, allowing humans to focus on more creative and strategic work.

But it's not all positive. There are significant concerns about bias in AI systems, as we discussed in last week's episode. And the pace of change is so rapid that many workers will need to upskill or reskill to keep up. Governments and companies must invest in training programs to ensure that no one is left behind.

In other news, Elon Musk's Neuralink has announced that it has successfully implanted its brain-computer interface device in a human patient for the first time. The device, which is about the size of a coin, is designed to help people with neurological conditions regain motor functions. While the technology is still in its early stages, the implications are enormous—imagine a world where paralyzed individuals can control computers or even prosthetic limbs with their thoughts.

Finally, let's talk about cybersecurity. With more and more of our lives moving online, the threat of cyber attacks is greater than ever. A recent survey found that 60% of small businesses that suffer a cyber attack go out of business within six months. That's why it's crucial for individuals and organizations to take cybersecurity seriously—use strong passwords, enable two-factor authentication, and keep your software up to date.

That's all for this week. Thank you for listening to Tech Trends. We'll be back next week with more insights into the world of technology.`,
    questions: [
      {
        id: 'podcast-q1',
        type: 'multiple-choice',
        question: 'According to the World Economic Forum, what percentage of work tasks could AI automate by 2030?',
        options: ['10%', '30%', '50%', '70%'],
        answer: 1,
        explanation: '主持人说 AI could automate approximately 30% of work tasks by 2030。',
      },
      {
        id: 'podcast-q2',
        type: 'fill-blank',
        question: 'Neuralink has implanted its brain-computer interface device in a human ______ for the first time.',
        answer: 'patient',
        explanation: '主持人说 Neuralink has announced that it has successfully implanted its brain-computer interface device in a human patient for the first time。',
      },
      {
        id: 'podcast-q3',
        type: 'multiple-choice',
        question: 'What percentage of small businesses go out of business within six months of a cyber attack?',
        options: ['30%', '40%', '50%', '60%'],
        answer: 3,
        explanation: '主持人说 A recent survey found that 60% of small businesses that suffer a cyber attack go out of business within six months。',
      },
      {
        id: 'podcast-q4',
        type: 'multiple-choice',
        question: 'Which of the following is NOT mentioned as a cybersecurity measure?',
        options: ['Use strong passwords', 'Enable two-factor authentication', 'Backup data daily', 'Keep software up to date'],
        answer: 2,
        explanation: '主持人提到 use strong passwords, enable two-factor authentication, keep your software up to date，没有提到 backup data daily（每日备份数据）。',
      },
    ],
  },
  {
    id: 'listening-environmental-talk',
    title: '环保演讲',
    titleEn: 'Environmental Conference Keynote',
    type: 'interview',
    level: 'B2+',
    duration: 300,
    unlocked: false,
    transcript: `[Transcript]
Speaker: Good morning, everyone. It's an honor to be here today at the Global Environmental Summit. My name is Dr. Elena Marquez, and I'm the Director of the International Climate Research Institute.

Let me start with a stark reality: we are facing a climate crisis of unprecedented proportions. The latest data from the Intergovernmental Panel on Climate Change (IPCC) confirms that global temperatures have already risen by 1.1 degrees Celsius since the pre-industrial era. If we don't take immediate action, we could exceed the critical 1.5-degree threshold within the next decade.

So, what does this mean for our planet? Rising sea levels threaten coastal communities around the world. Extreme weather events—heatwaves, droughts, wildfires, and hurricanes—are becoming more frequent and more severe. And the loss of biodiversity is accelerating at an alarming rate, with up to one million species facing extinction.

But here's the good news: we have the solutions. The technology exists to transition to a low-carbon economy. Solar and wind energy are now cheaper than fossil fuels in most parts of the world. Electric vehicles are becoming more affordable and accessible. And we're seeing remarkable innovations in green building materials and sustainable agriculture.

The challenge is political will and collective action. Governments must implement ambitious carbon reduction targets and invest in renewable energy infrastructure. Businesses need to adopt sustainable practices and embrace circular economy principles. And individuals can make a difference through their daily choices—reducing energy consumption, eating less meat, and supporting sustainable products.

Let me leave you with this: the climate crisis is not a distant threat. It's happening now. But it's also our greatest opportunity to build a healthier, more equitable, and more sustainable world for future generations. The choices we make today will determine the kind of planet our children inherit. Let's make sure it's one they can be proud of. Thank you.

Moderator: Thank you, Dr. Marquez. We have time for one question.

Audience Member: Dr. Marquez, what gives you hope that we can actually meet the 1.5-degree target?

Speaker: Great question. I see hope in the younger generation—they're demanding action like never before. I see hope in the rapid advances in clean technology. And I see hope in the growing number of businesses and governments that are committing to net-zero emissions. Change is happening, and it's happening faster than many people think. But we need to accelerate that change. Every day counts.`,
    questions: [
      {
        id: 'env-q1',
        type: 'multiple-choice',
        question: 'How much have global temperatures risen since the pre-industrial era?',
        options: ['0.5 degrees Celsius', '1.1 degrees Celsius', '1.5 degrees Celsius', '2.0 degrees Celsius'],
        answer: 1,
        explanation: 'Dr. Marquez 说 global temperatures have already risen by 1.1 degrees Celsius since the pre-industrial era。',
      },
      {
        id: 'env-q2',
        type: 'fill-blank',
        question: 'Up to ______ species are facing extinction due to the loss of biodiversity.',
        answer: 'one million',
        explanation: 'Dr. Marquez 提到 up to one million species facing extinction。',
      },
      {
        id: 'env-q3',
        type: 'multiple-choice',
        question: 'Which of the following is NOT mentioned as a solution to climate change?',
        options: ['Solar and wind energy', 'Electric vehicles', 'Green building materials', 'Nuclear power'],
        answer: 3,
        explanation: 'Dr. Marquez 提到 solar and wind energy, electric vehicles, green building materials，没有提到 nuclear power（核能）。',
      },
      {
        id: 'env-q4',
        type: 'multiple-choice',
        question: 'What gives Dr. Marquez hope that we can meet the 1.5-degree target?',
        options: [
          'The growing number of people who deny climate change',
          'The younger generation demanding action',
          'The discovery of new fossil fuel reserves',
          'The decrease in global population',
        ],
        answer: 1,
        explanation: 'Dr. Marquez 说 I see hope in the younger generation—they\'re demanding action like never before。',
      },
    ],
  },
];
