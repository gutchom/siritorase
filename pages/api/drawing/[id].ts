import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'lib/prisma';

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'GET':
      const p = new PrismaClient();
      await p;
      res.status(200).json({ id, name: `User ${id}` });
      break;

    case 'POST':
      res.status(200).json({ id, name: `User ${id}` });
      break;

    case 'PUT':
      res.status(200).json({ id, name: `User ${id}` });
      break;

    case 'DELETE':
      res.status(200).json({ id, name: `User ${id}` });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
