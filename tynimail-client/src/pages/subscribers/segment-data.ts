export const SegmentData = [
  {
    name: "Tyni Mail",
    slug: "tyni-mail",
    subscribers: 1200000,
    openRate: "68%",
    clickRate: "12%",
    details: Array.from({ length: 10 }, (_, i) => ({
      email: `user${i + 1}@tynimail.com`,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
      status: "Verified",

      openedEmails: Math.floor(Math.random() * 50) + 1,
      clicks: Math.floor(Math.random() * 30) + 1,
    })),
  },
  {
    name: "Alpha Blast",
    slug: "alpha-blast",
    subscribers: 800000,
    openRate: "72%",
    clickRate: "15%",
    details: Array.from({ length: 10 }, (_, i) => ({
      email: `user${i + 1}@alphablast.com`,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
      status: "Verified",

      openedEmails: Math.floor(Math.random() * 50) + 1,
      clicks: Math.floor(Math.random() * 30) + 1,
    })),
  },
  {
    name: "Quick Send",
    slug: "quick-send",
    subscribers: 500000,
    openRate: "65%",
    clickRate: "10%",
    details: Array.from({ length: 10 }, (_, i) => ({
      email: `user${i + 1}@quicksend.com`,
      firstName: `First${i + 1}`,
      status: "unverified",

      lastName: `Last${i + 1}`,
      openedEmails: Math.floor(Math.random() * 50) + 1,
      clicks: Math.floor(Math.random() * 30) + 1,
    })),
  },
  {
    name: "Mail Storm",
    slug: "mail-storm",
    subscribers: 2000000,
    openRate: "70%",
    clickRate: "14%",
    details: Array.from({ length: 10 }, (_, i) => ({
      email: `user${i + 1}@mailstorm.com`,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
      status: "unverified",

      openedEmails: Math.floor(Math.random() * 50) + 1,
      clicks: Math.floor(Math.random() * 30) + 1,
    })),
  },
  // Generate the remaining 46 objects automatically
  ...Array.from({ length: 26 }, (_, idx) => {
    const randomNum = idx + 5;
    const name = `Mailer Pro ${randomNum}`;
    return {
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      subscribers: Math.floor(Math.random() * 2000000) + 100000, // 100k to 2M
      openRate: `${Math.floor(Math.random() * 40) + 50}%`, // 50% to 90%
      clickRate: `${Math.floor(Math.random() * 20) + 5}%`, // 5% to 25%
      details: Array.from({ length: 10 }, (_, i) => ({
        email: `user${i + 1}@mailerpro${randomNum}.com`,
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        status: "unverified",

        openedEmails: Math.floor(Math.random() * 50) + 1,
        clicks: Math.floor(Math.random() * 30) + 1,
      })),
    };
  }),
];
