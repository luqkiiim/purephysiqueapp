import { demoClients, demoCoachProfile } from "@/lib/demo/data";

export const demoCoachCredentials = {
  email: demoCoachProfile.email,
  password: "coachdemo123",
};

export const demoClientCredentials = {
  fullName: demoClients[0].fullName,
  inviteToken: demoClients[0].inviteToken,
};
