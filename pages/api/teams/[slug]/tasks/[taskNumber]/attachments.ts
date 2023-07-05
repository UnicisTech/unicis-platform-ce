import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@/lib/session";
import { getTeam, isTeamMember } from "models/team";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import {
  deleteAttachment,
  findAttachmentById,
  readFile,
  saveFileAsAttachment,
} from "models/attachment";
import formidable from "formidable";
import { checkExtensionAndMIMEType } from "models/attachment";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    case "DELETE":
      return handleDELETE(req, res);
    default:
      res.setHeader("Allow", ["GET", "DELETE", "POST"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Download an attachment
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const { slug } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(200).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  try {
    const attachment = await findAttachmentById(id as string);

    if (!attachment) {
      return res.status(200).json({
        data: null,
        error: { message: "Attachment not found." },
      });
    }

    const fileData = attachment.fileData;
    const filename = attachment.filename;

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const writeFileAsync = promisify(fs.writeFile);
    const tempFilePath = path.join("/tmp", filename);

    await writeFileAsync(tempFilePath, fileData);

    const fileStream = fs.createReadStream(tempFilePath);

    fileStream.pipe(res);

    fileStream.on("close", async () => {
      await fs.promises.unlink(tempFilePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      data: null,
      error: { message: "Internal server error." },
    });
  }
};

// Upload an attachment
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { fields, files } = await readFile(req);

  const { taskId } = fields;
  const { slug } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(200).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const file = Object.values(files)[0] as formidable.File[];

  const isAllowed = checkExtensionAndMIMEType(file[0] as formidable.File);

  if (isAllowed) {
    try {
      const url = await saveFileAsAttachment(Number(taskId), file[0]);
      res.status(200).json({ url });
    } catch (error) {
      console.error("Failed to save file as attachment:", error);
      res.status(500).json({ error: "Failed to save file as attachment." });
    }
  } else {
    res.status(200).json({ error: "Not supported type of file." });
  }
};

// Delete a comment

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const session = await getSession(req, res);

  if (!session) {
    return res.status(200).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  await deleteAttachment(id as string);

  return res.status(200).json({ data: {}, error: null });
};
