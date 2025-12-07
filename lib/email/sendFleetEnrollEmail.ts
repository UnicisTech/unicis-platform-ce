import { sendEmail } from "./sendEmail";
import { render } from "@react-email/components";
import env from "../env";
import FleetEnrollEmail from "@/components/emailTemplates/FleetEnrollEmail";

export const sendFleetEnrollEmail = async (email: string, teamName: string) => {
  const subject = `Enroll your device on Fleet for ${teamName}`;
  const enrollmentLink = `${env.appUrl}/fleet/enroll`;

  const html = await render(
    FleetEnrollEmail({
      teamName,
      enrollmentLink,
      subject,
    }),
  );

  await sendEmail({
    to: email,
    subject,
    html,
  });
};
