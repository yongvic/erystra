export const sampleMetrics = {
  engagement: 7.8,
  reach: 48210,
  followerGrowth: 312,
  scheduledPosts: 18
};

export const sampleAccounts = [
  { id: "demo-facebook", provider: "FACEBOOK", label: "Erystra Group", handle: "@erystra.group" },
  { id: "demo-linkedin", provider: "LINKEDIN", label: "Erystra LinkedIn", handle: "erystra-group" },
  { id: "demo-twitter", provider: "TWITTER", label: "Erystra X", handle: "@ErystraGroup" }
];

export const samplePosts = [
  {
    id: "post-1",
    title: "Campagne transformation durable",
    content: "Mise en avant des solutions d'accompagnement des organisations.",
    status: "SCHEDULED",
    scheduledFor: "2026-04-08T09:00:00.000Z",
    providerLabels: ["LinkedIn", "Facebook"]
  },
  {
    id: "post-2",
    title: "Retour evenement RH",
    content: "Resume de l'atelier sur les talents et la performance durable.",
    status: "PUBLISHED",
    scheduledFor: "2026-04-05T15:30:00.000Z",
    providerLabels: ["X"]
  }
];

export const sampleTrend = [
  { label: "Lun", value: 58 },
  { label: "Mar", value: 61 },
  { label: "Mer", value: 64 },
  { label: "Jeu", value: 72 },
  { label: "Ven", value: 76 },
  { label: "Sam", value: 69 },
  { label: "Dim", value: 81 }
];
