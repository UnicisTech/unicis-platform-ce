import { authOptions } from "../pages/api/auth/[...nextauth]";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getServerSession } from "next-auth/next";

export const getSession = async (
  req: NextApiRequest | GetServerSidePropsContext["req"],
  res: NextApiResponse | GetServerSidePropsContext["res"]
) => {
  return await getServerSession(req, res, authOptions);
};
