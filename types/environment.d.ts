declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      TWITTER_CONSUMER_KEY: string;
      TWITTER_CONSUMER_SECRET: string;
    }
  }
}

export {};
