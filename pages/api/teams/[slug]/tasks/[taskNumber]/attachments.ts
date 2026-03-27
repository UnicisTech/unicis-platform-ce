import formidable from 'formidable';
import fs from 'fs';
import {
  deleteAttachment,
  findAttachmentById,
  readFile,
  saveFileAsAttachment,
} from 'models/attachment';
import { checkExtensionAndMIMEType } from 'models/attachment';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promisify } from 'util';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { notificationService } from '@/lib/notifications/notification-service';
import { getTeamRecipientsBySlug } from '@/lib/notifications/recipients';
import { NotificationType } from '@/generated/enums';
import { prisma } from '@/lib/prisma';

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
    case 'GET':
      return handleGET(req, res);
    case 'POST':
      return handlePOST(req, res);
    case 'DELETE':
      return handleDELETE(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'POST']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Download an attachment
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'read');

  const { id } = req.query;

  try {
    const attachment = await findAttachmentById(id as string);

    if (!attachment) {
      return res.status(200).json({
        data: null,
        error: { message: 'Attachment not found.' },
      });
    }

    const fileData = attachment.fileData;
    const filename = attachment.filename;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    const writeFileAsync = promisify(fs.writeFile);
    const tempFilePath = path.join('/tmp', filename);

    await writeFileAsync(tempFilePath, fileData);

    const fileStream = fs.createReadStream(tempFilePath);

    fileStream.pipe(res);

    fileStream.on('close', async () => {
      await fs.promises.unlink(tempFilePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      data: null,
      error: { message: 'Internal server error.' },
    });
  }
};

// Upload an attachment
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  try {
    const { fields, files } = await readFile(req);
    const { taskId } = fields;

    const file = Object.values(files)[0] as formidable.File[];

    const isAllowed = checkExtensionAndMIMEType(file[0] as formidable.File);

    if (isAllowed) {
      try {
        const url = await saveFileAsAttachment(Number(taskId), file[0]);
        const task = await prisma.task.findUnique({
          where: { id: Number(taskId) },
          select: {
            id: true,
            title: true,
            taskNumber: true,
            teamId: true,
            team: { select: { slug: true } },
          },
        });

        if (task) {
          const teamSlug = task.team?.slug ?? (req.query.slug as string);
          const recipients = await getTeamRecipientsBySlug(teamSlug);
          const filename =
            file[0]?.originalFilename ??
            file[0]?.newFilename ??
            'file';

          await notificationService.sendBulk(
            recipients.map((user) => ({
              type: NotificationType.FILE_UPLOADED,
              title: `File uploaded: \"${task.title}\"`,
              body: `${teamMember.user.name ?? 'Someone'} uploaded ${filename}.`,
              link: `/teams/${teamSlug}/tasks/${task.taskNumber}`,
              recipientId: user.id,
              recipientEmail: user.email,
              teamId: task.teamId,
              metadata: {
                source: {
                  taskId: task.id,
                  taskNumber: task.taskNumber,
                  event: 'file.uploaded',
                  filename,
                },
              },
            }))
          );
        }

        res.status(200).json({ url });
      } catch (error) {
        console.error('Failed to save file as attachment:', error);
        res
          .status(500)
          .json({ error: { message: 'Failed to save file as attachment.' } });
      }
    } else {
      res
        .status(200)
        .json({ error: { message: 'Not supported type of file.' } });
    }
  } catch {
    res.status(200).json({
      error: { message: 'File is too large. Maximum size of file is 10mb.' },
    });
  }
};

// Delete a comment

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const { id } = req.query;

  await deleteAttachment(id as string);

  return res.status(200).json({ data: {}, error: null });
};
