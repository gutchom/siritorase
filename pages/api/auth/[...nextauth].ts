import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from 'lib/prisma';

const clientId = process.env.TWITTER_CONSUMER_KEY;
const clientSecret = process.env.TWITTER_CONSUMER_SECRET;

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [TwitterProvider({ clientId, clientSecret })],
  session: { strategy: 'jwt' },
});
